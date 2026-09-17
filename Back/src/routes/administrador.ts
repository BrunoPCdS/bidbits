import { prisma } from "../../lib/prisma"
import { Router, type Request, type Response } from "express"
import { z } from "zod"
import jwt from "jsonwebtoken"


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