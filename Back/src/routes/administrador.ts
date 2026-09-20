import { prisma } from "../../lib/prisma"
import { Router, type Request, type Response } from "express"
import { z } from "zod"
import jwt from "jsonwebtoken"
import { verificarAdmin } from "../utilit/verificarToken"


const router = Router()

const adminSchema = z.object({
    nome: z.string()
        .min(3, "Nome deve possuir no minimo 3 caracteres")
        .max(50, "Nome deve ter no maximo 50 caracteres"),
    email: z.email(),
    senha: z.string().min(8, "Senha deve possuir no minimo 8 caracteres")
})

const adminPublico = {
    id: true,
    nome: true,
    email: true,
} as const

const loginSchema = z.object({
    email: z.email(),
    senha: z.string().min(1),
})

router.post("/login", async (req: Request, res: Response) => {
    const valida = loginSchema.safeParse(req.body)

    if (!valida.success) {
        res.status(400).json({ erro: "Email e senha são obrigatórios" })
        return
    }

    const admin = await prisma.admin.findUnique({ where: { email: valida.data.email } })

    if (!admin || admin.senha !== valida.data.senha) {
        res.status(401).json({ erro: "Email ou senha de administrador inválidos" })
        return
    }

    const token = jwt.sign(
        { adminId: admin.id, perfil: "admin" },
        process.env.JWT_SECRET ?? "bidbits-segredo-desenvolvimento",
        { expiresIn: "1d" },
    )

    res.status(200).json({ token, admin: { id: admin.id, nome: admin.nome, email: admin.email } })
})

// DASHBOARD: endpoint protegido que agrega clientes, lances, leilões e marcas para o frontend.
router.get("/dashboard", verificarAdmin, async (_req: Request, res: Response) => {
    try {
        const agora = new Date()
        const [usuarios, leiloes, lances] = await Promise.all([
            prisma.usuario.findMany({ select: { createdAt: true } }),
            prisma.leilao.findMany({
                select: {
                    id: true, nome: true, valorInicial: true, dataInicio: true, dataFim: true,
                    console: { select: { marca: { select: { nome: true } } } },
                    midia: { select: { marca: { select: { nome: true } } } },
                    lances: { select: { valor: true } },
                },
            }),
            prisma.lance.findMany({
                select: {
                    leilao: {
                        select: {
                            console: { select: { marca: { select: { nome: true } } } },
                            midia: { select: { marca: { select: { nome: true } } } },
                        },
                    },
                },
            }),
        ])

        const meses = Array.from({ length: 6 }, (_, indice) => {
            const data = new Date(agora.getFullYear(), agora.getMonth() - (5 - indice), 1)
            return { chave: `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`, total: 0 }
        })
        const mesesMap = new Map(meses.map((mes) => [mes.chave, mes]))
        for (const usuario of usuarios) {
            const chave = `${usuario.createdAt.getFullYear()}-${String(usuario.createdAt.getMonth() + 1).padStart(2, "0")}`
            const mes = mesesMap.get(chave)
            if (mes) mes.total += 1
        }

        const rankingLeiloes = leiloes.map((leilao) => ({
            id: leilao.id,
            nome: leilao.nome,
            quantidadeLances: leilao.lances.length,
            maiorLance: Math.max(leilao.valorInicial, ...leilao.lances.map((lance) => lance.valor)),
        })).sort((a, b) => b.quantidadeLances - a.quantidadeLances).slice(0, 5)

        const marcasMap = new Map<string, number>()
        for (const lance of lances) {
            const marca = lance.leilao.console?.marca.nome ?? lance.leilao.midia?.marca.nome
            if (marca) marcasMap.set(marca, (marcasMap.get(marca) ?? 0) + 1)
        }
        const marcasMaisProcuradas = Array.from(marcasMap, ([marca, quantidadeLances]) => ({ marca, quantidadeLances }))
            .sort((a, b) => b.quantidadeLances - a.quantidadeLances).slice(0, 5)
        const leiloesAtivos = leiloes.filter((leilao) => agora >= leilao.dataInicio && agora < leilao.dataFim).length
        const maiorLance = Math.max(0, ...leiloes.flatMap((leilao) => leilao.lances.map((lance) => lance.valor)))

        res.status(200).json({
            resumo: { totalClientes: usuarios.length, totalLeiloes: leiloes.length, totalLances: lances.length, leiloesAtivos, maiorLance },
            cadastrosPorMes: meses, rankingLeiloes, marcasMaisProcuradas,
        })
    } catch (error) {
        console.error("Erro ao carregar dashboard:", error)
        res.status(500).json({ erro: error })
    }
})

router.get("/", async (_req: Request, res: Response) => {
    try {
        const admins = await prisma.admin.findMany({
            select: adminPublico,
            orderBy: { id: "asc" }
        })

        res.status(200).json(admins)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.get("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
        res.status(400).json({ erro: "Codigo invalido" })
        return
    }

    try {
        const admin = await prisma.admin.findUnique({
            where: { id },
            select: {
                ...adminPublico,
                leiloesCriados: {
                    orderBy: { id: "desc" }
                }
            }
        })

        if (!admin) {
            res.status(404).json({ erro: "Administrador nao cadastrado" })
            return
        }

        res.status(200).json(admin)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.post("/", async (req: Request, res: Response) => {
    const valida = adminSchema.safeParse(req.body)

    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const { nome, email, senha } = valida.data

    try {
        const admin = await prisma.admin.create({
            data: { nome, email, senha },
            select: adminPublico
        })

        res.status(201).json(admin)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.put("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
        res.status(400).json({ erro: "Codigo invalido" })
        return
    }

    const valida = adminSchema.partial().safeParse(req.body)

    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    try {
        const admin = await prisma.admin.update({
            where: { id },
            data: valida.data,
            select: adminPublico
        })

        res.status(200).json(admin)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.delete("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
        res.status(400).json({ erro: "Codigo invalido" })
        return
    }

    try {
        await prisma.admin.delete({
            where: { id }
        })

        res.status(204).send()
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

export default router