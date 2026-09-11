import { prisma } from "../../lib/prisma"
import { Router, type Request, type Response } from "express"
import { z } from "zod"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

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

const loginSchema = z.object({
    email: z.email(),
    senha: z.string().min(1)
})

router.post("/login", async (req: Request, res: Response) => {
    const valida = loginSchema.safeParse(req.body)

    if (!valida.success) {
        res.status(400).json({ erro: "Email e senha são obrigatórios" })
        return
    }

    const usuario = await prisma.usuario.findUnique({ where: { email: valida.data.email } })

    if (!usuario || !(await bcrypt.compare(valida.data.senha, usuario.senha))) {
        res.status(401).json({ erro: "Email ou senha inválidos" })
        return
    }

    const token = jwt.sign(
        { usuarioId: usuario.id },
        process.env.JWT_SECRET ?? "bidbits-segredo-desenvolvimento",
        { expiresIn: "1d" }
    )

    res.status(200).json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } })
})

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
        const senhaCriptografada = await bcrypt.hash(senha, 12)
        const cliente = await prisma.usuario.create({
            data: {
                nome,
                email,
                senha: senhaCriptografada
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