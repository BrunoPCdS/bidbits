import { prisma } from "../../lib/prisma"
import { consultarDadosComIA } from "../../iaServices"

import { Router } from 'express'
import { z } from 'zod'
import { verificarAdmin } from "../utilit/verificarToken"

const router = Router()

const leilaoSchema = z.object({
  nome: z.string().min(2, { message: "Nome deve possuir, no mínimo, 2 caracteres" }),
  descricao: z.string().min(3, { message: "Descrição deve possuir, no mínimo, 3 caracteres" }).optional(),
  valorInicial: z.number().nonnegative(),
  consoleId: z.number().int().positive().nullable().optional(),
  midiaId: z.number().int().positive().nullable().optional(),
  dataInicio: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Data de início inválida" }),
  dataFim: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Data de fim inválida" }),
  adminId: z.number().int().positive().optional(),
  gerarDescricaoComIA: z.boolean().optional().default(true),
}).refine((data) => Boolean(data.consoleId || data.midiaId), {
  message: "Informe pelo menos um consoleId ou midiaId",
  path: ["consoleId"],
})

router.post('/consultar-ia', async (req, res) => {
  const valida = z.object({
    nome: z.string().min(2),
    ano: z.number().int().optional(),
    marca: z.string().optional(),
    tipo: z.string().optional(),
  }).safeParse(req.body)

  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  try {
    const resultado = await consultarDadosComIA(valida.data)
    res.status(200).json(resultado)
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Falha ao consultar a IA"
    res.status(502).json({ erro: mensagem })
  }
})

router.get('/', async (_req, res) => {
  try {
    const leiloes = await prisma.leilao.findMany({
      include: {
        console: true,
        midia: true,
        // Carrega somente o maior lance para calcular o valor final do leilao.
        lances: {
          orderBy: { valor: 'desc' },
          take: 1,
        },
        criadoPor: {
          select: { id: true, nome: true, email: true },
        },
      },
      orderBy: { id: 'desc' },
    })

    // O valor final e o maior lance; sem lances, o valor inicial e mantido.
    const leiloesComValorFinal = leiloes.map((leilao) => ({
      ...leilao,
      valorFinal: leilao.lances[0]?.valor ?? leilao.valorInicial,
    }))

    res.status(200).json(leiloesComValorFinal)
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

router.post('/:id/gerar-ia', verificarAdmin, async (req, res) => {
  const id = Number(req.params.id)

  try {
    const leilaoItem = await prisma.leilao.findUnique({
      where: { id },
      include: {
        console: { include: { marca: true } },
        midia: { include: { marca: true } },
      },
    })

    if (!leilaoItem) {
      res.status(404).json({ erro: "Leilão não encontrado" })
      return
    }

    const item = leilaoItem.console ?? leilaoItem.midia
    if (!item) {
      res.status(400).json({ erro: "O leilão não possui console ou mídia associado" })
      return
    }

    const dadosIA = await consultarDadosComIA({
      nome: item.nome,
      ano: item.ano,
      marca: item.marca.nome,
      tipo: "tipo" in item ? String(item.tipo) : "console",
    })

    const atualizado = await prisma.leilao.update({
      where: { id },
      data: { descricao: dadosIA.descricao, dadosIA },
    })

    res.status(200).json(atualizado)
  } catch (error) {
    const mensagem = error instanceof Error ? error.message : "Falha ao gerar detalhes com IA"
    res.status(502).json({ erro: mensagem })
  }
})

router.post('/', verificarAdmin, async (req, res) => {
  const valida = leilaoSchema.safeParse(req.body)

  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { nome, descricao, valorInicial, consoleId, midiaId, dataInicio, dataFim, gerarDescricaoComIA } = valida.data

  try {
    if (!descricao) {
      res.status(400).json({ erro: "Informe uma descrição ou habilite gerarDescricaoComIA" })
      return
    }

    const leilaoItem = await prisma.leilao.create({
      data: {
        nome,
        descricao,
        valorInicial,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        criadoPor: { connect: { id: req.adminId! } },
        ...(consoleId ? { console: { connect: { id: consoleId } } } : {}),
        ...(midiaId ? { midia: { connect: { id: midiaId } } } : {}),
      },
      include: {
        console: true,
        midia: true,
      },
    })

    if (gerarDescricaoComIA) {
      void (async () => {
        try {
          const item = consoleId
            ? await prisma.console.findUnique({ where: { id: consoleId }, include: { marca: true } })
            : midiaId
              ? await prisma.midia.findUnique({ where: { id: midiaId }, include: { marca: true } })
              : null

          if (!item) return

          const dadosIA = await consultarDadosComIA({
            nome: item.nome,
            ano: item.ano,
            marca: item.marca.nome,
            tipo: "tipo" in item ? String(item.tipo) : "console",
          })

          await prisma.leilao.update({
            where: { id: leilaoItem.id },
            data: { descricao: dadosIA.descricao, dadosIA },
          })
        } catch (error) {
          console.error(`Falha ao gerar descrição automática do leilão ${leilaoItem.id}:`, error)
        }
      })()
    }

    res.status(201).json({ ...leilaoItem, dadosIA: null })
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const valida = leilaoSchema.omit({ adminId: true }).safeParse(req.body)

  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { nome, descricao, valorInicial, consoleId, midiaId, dataInicio, dataFim } = valida.data

  try {
    const leilaoItem = await prisma.leilao.update({
      where: { id: Number(id) },
      data: {
        nome,
        descricao,
        valorInicial,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
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

router.delete('/:id', verificarAdmin, async (req, res) => {
  const { id } = req.params

  try {
    const leilaoItem = await prisma.$transaction(async (transacao) => {
      await transacao.lance.deleteMany({ where: { leilaoId: Number(id) } })
      return transacao.leilao.delete({
        where: { id: Number(id) },
      })
    })

    res.status(200).json(leilaoItem)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

export default router