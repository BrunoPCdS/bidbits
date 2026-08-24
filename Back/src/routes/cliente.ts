import { prisma } from "../../lib/prisma"
import { Router, type Request, type Response } from "express"
import { z } from "zod"

const router = Router()

const clienteSchema = z.object({
    nome: z.string()
        .min(3, "Nome deve possuir no minimo 3 caracteres")
        .max(80, "Nome deve ter no maximo 80 caracteres"),
    telefone: z.string()
        .min(8, "Telefone deve possuir no minimo 8 caracteres")
        .max(20, "Telefone deve ter no maximo 20 caracteres"),
    email: z.email()
})

router.get("/", async (_req: Request, res: Response) => {
    try {
        const clientes = await prisma.cliente.findMany({
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
        const cliente = await prisma.cliente.findUnique({
            where: { id },
            include: {
                agendamentos: {
                    include: {
                        servico: true
                    },
                    orderBy: { dataHora: "desc" }
                },
                historicoFidelidade: {
                    include: {
                        agendamento: {
                            include: {
                                servico: true
                            }
                        }
                    },
                    orderBy: { data: "desc" }
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

    const { nome, telefone, email } = valida.data

    try {
        const cliente = await prisma.cliente.create({
            data: {
                nome,
                telefone,
                email
            }
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

    const { nome, telefone, email } = valida.data

    try {
        const cliente = await prisma.cliente.update({
            where: { id },
            data: {
                nome,
                telefone,
                email
            }
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
        const cliente = await prisma.cliente.delete({
            where: { id }
        })

        res.status(200).json(cliente)
    } catch (error) {
        res.status(400).json({ erro: error })
    }
})

export default router