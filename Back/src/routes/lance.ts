import { prisma } from "../../lib/prisma"
import { Router } from "express"
import { z } from "zod"
import { verificarToken } from "../utilit/verificarToken"

const router = Router()

const lanceSchema = z.object({
    leilaoId: z.number().int().positive(),
    valor: z.number().positive(),
})

router.post("/", verificarToken, async (req, res) => {
    const valida = lanceSchema.safeParse(req.body)

    if (!valida.success || !req.usuarioId) {
        res.status(400).json({ erro: "Dados do lance inválidos" })
        return
    }

    const leilao = await prisma.leilao.findUnique({
        where: { id: valida.data.leilaoId },
        include: { lances: { orderBy: { valor: "desc" }, take: 1 } },
    })

    if (!leilao) {
        res.status(404).json({ erro: "Leilão não encontrado" })
        return
    }

    const agora = new Date()
    const maiorLance = leilao.lances[0]?.valor ?? leilao.valorInicial

    if (agora < leilao.dataInicio) {
        res.status(400).json({ erro: "O leilão começará em breve!" })
        return
    }

    if (agora >= leilao.dataFim) {
        res.status(400).json({ erro: "Este leilão já foi encerrado" })
        return
    }

    if (valida.data.valor <= maiorLance) {
        res.status(400).json({ erro: `O lance deve ser maior que R$ ${maiorLance.toFixed(2)}` })
        return
    }

    const lance = await prisma.lance.create({
        data: { valor: valida.data.valor, leilaoId: valida.data.leilaoId, usuarioId: req.usuarioId },
    })

    res.status(201).json({ mensagem: "Lance realizado com sucesso", lance })
})

export default router