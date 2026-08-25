import { prisma } from "../../lib/prisma"
import { Router, type Request, type Response } from "express"
import { z } from "zod"


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
} as const

router.get("/", async (_req: Request, res: Response) => {
    try {
        const admins = await prisma.usuario.findMany({
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
        const admin = await prisma.usuario.findUnique({
            where: { id },
            select: {
                ...adminPublico,
                lances: {
                    include: {
                        leilao: true
                    },
                    orderBy: { dataLance: "desc" }
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
        const admin = await prisma.usuario.create({
            data: { nome, email, senha }
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
        const admin = await prisma.usuario.update({
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