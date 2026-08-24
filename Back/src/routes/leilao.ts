import { prisma } from "../../lib/prisma"

import { Router } from 'express'
import { z } from 'zod'

const router = Router()

const leilaoSchema = z.object({
  nome: z.string().min(2, { message: "Nome deve possuir, no mínimo, 2 caracteres" }),
  descricao: z.string().min(3, { message: "Descrição deve possuir, no mínimo, 3 caracteres" }),
  valorInicial: z.number().nonnegative(),
  consoleId: z.number().int().positive().nullable().optional(),
  midiaId: z.number().int().positive().nullable().optional(),
  dataInicio: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Data de início inválida" }),
  dataFim: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Data de fim inválida" }),
  adminId: z.number().int().positive(),
}).refine((data) => Boolean(data.consoleId || data.midiaId), {
  message: "Informe pelo menos um consoleId ou midiaId",
  path: ["consoleId"],
})

router.get('/', async (_req, res) => {
  try {
    const leiloes = await prisma.leilao.findMany({
      include: {
        console: true,
        midia: true,
        criadoPor: {
          select: { id: true, nome: true, email: true },
        },
      },
      orderBy: { id: 'desc' },
    })

    res.status(200).json(leiloes)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.get('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const leilaoItem = await prisma.leilao.findUnique({
      where: { id: Number(id) },
      include: {
        console: true,
        midia: true,
        criadoPor: {
          select: { id: true, nome: true, email: true },
        },
      },
    })

    if (!leilaoItem) {
      res.status(404).json({ erro: 'Leilão não encontrado' })
      return
    }

    res.status(200).json(leilaoItem)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post('/', async (req, res) => {
  const valida = leilaoSchema.safeParse(req.body)

  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { nome, descricao, valorInicial, consoleId, midiaId, dataInicio, dataFim, adminId } = valida.data

  try {
    const leilaoItem = await prisma.leilao.create({
      data: {
        nome,
        descricao,
        valorInicial,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        adminId,
        ...(consoleId ? { console: { connect: { id: consoleId } } } : {}),
        ...(midiaId ? { midia: { connect: { id: midiaId } } } : {}),
      },
      include: {
        console: true,
        midia: true,
      },
    })

    res.status(201).json(leilaoItem)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const valida = leilaoSchema.safeParse(req.body)

  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { nome, descricao, valorInicial, consoleId, midiaId, dataInicio, dataFim, adminId } = valida.data

  try {
    const leilaoItem = await prisma.leilao.update({
      where: { id: Number(id) },
      data: {
        nome,
        descricao,
        valorInicial,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        adminId,
        ...(consoleId ? { console: { connect: { id: consoleId } } } : {}),
        ...(midiaId ? { midia: { connect: { id: midiaId } } } : {}),
      },
      include: {
        console: true,
        midia: true,
      },
    })

    res.status(200).json(leilaoItem)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params

  try {
    const leilaoItem = await prisma.leilao.delete({
      where: { id: Number(id) },
    })

    res.status(200).json(leilaoItem)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

export default router