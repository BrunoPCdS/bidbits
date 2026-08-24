import { prisma } from "../../lib/prisma"
import { Router, type Request, type Response } from "express"
import { z } from "zod"

const router = Router()

const clienteSchema = z.object({
    nome: z.string()
        .min(3, "Nome deve possuir no minimo 3 caracteres")
        .max(50, "Nome deve ter no maximo 50 caracteres"),
    email: z.email(),
    senha: z.string().min(8, "Senha deve possuir no minimo 8 caracteres")
})

const usuarioPublico = {
    id: true,
    nome: true,
    email: true
} as const

router.get("/", async (_req: Request, res: Response) => {
    try {
        const clientes = await prisma.usuario.findMany({
            select: usuarioPublico,
            orderBy: { id: "asc" }
        })

        res.status(200).json(clientes)
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
        const cliente = await prisma.usuario.findUnique({
            where: { id },
            select: {
                ...usuarioPublico,
                lances: {
                    include: {
                        leilao: true
                    },
                    orderBy: { dataLance: "desc" }
                }
            }
        })

        if (!cliente) {
            res.status(404).json({ erro: "Cliente nao cadastrado" })
            return
        }

        res.status(200).json(cliente)
    } catch (error) {
        res.status(500).json({ erro: error })
    }
})

router.post("/", async (req: Request, res: Response) => {
    const valida = clienteSchema.safeParse(req.body)

    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const { nome, email, senha } = valida.data

    try {
        const cliente = await prisma.usuario.create({
            data: {
                nome,
                email,
                senha
            },
            select: usuarioPublico
        })

        res.status(201).json(cliente)
    } catch (error) {
        res.status(400).json({ erro: error })
    }
})

router.put("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
        res.status(400).json({ erro: "Codigo invalido" })
        return
    }

    const valida = clienteSchema.safeParse(req.body)

    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const { nome, email, senha } = valida.data

    try {
        const cliente = await prisma.usuario.update({
            where: { id },
            data: {
                nome,
                email,
                senha
            },
            select: usuarioPublico
        })

        res.status(200).json(cliente)
    } catch (error) {
        res.status(400).json({ erro: error })
    }
})

router.delete("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    if (Number.isNaN(id)) {
        res.status(400).json({ erro: "Codigo invalido" })
        return
    }

    try {
        const cliente = await prisma.usuario.delete({
            where: { id },
            select: usuarioPublico
        })

        res.status(200).json(cliente)
    } catch (error) {
        res.status(400).json({ erro: error })
    }
})

export default router