import { prisma } from "../../lib/prisma"
import { Router, type Request, type Response } from "express"
import { verificarToken } from "./../utilit/verificarToken"

const router = Router()

router.get("/", verificarToken, async (_req: Request, res: Response) => {
    try {
        const logs = await prisma.log.findMany({
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                }
            },
            orderBy: { criadoEm: "desc" }
        })

        res.status(200).json(logs)
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar logs" })
    }
})

export default router