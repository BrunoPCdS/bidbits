import { prisma } from "../../lib/prisma"

import { Router } from "express"
import { z } from "zod"

const router = Router()

const empresaSchema = z.enum(["Nintendo", "Sony", "Microsoft", "Xbox", "Atari", "Sega", "Tectoy"])

const consoleSchema = z.object({
  nome: z.string().min(2, { message: "Nome deve possuir, no mínimo, 2 caracteres" }),
  marcaid: z.number().int().positive(),
  empresa: empresaSchema.default("Nintendo"),
  ano: z.number().int(),
  foto: z.string().min(1, { message: "Foto é obrigatória" }),
  video: z.string().min(1, { message: "Vídeo é obrigatório" }),
  descricao: z.string().min(3, { message: "Descrição deve possuir, no mínimo, 3 caracteres" }),
  adminId: z.number().int().positive(),
})

router.get("/", async (_req, res) => {
  try {
    const consoles = await prisma.console.findMany({
      where: { deletadoEm: null },
      include: {
        marca: true,
        criadoPor: {
          select: { id: true, nome: true, email: true },
        },
      },
      orderBy: { id: "desc" },
    })

    res.status(200).json(consoles)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.get("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const consoleItem = await prisma.console.findFirst({
      where: { id: Number(id), deletadoEm: null },
      include: {
        marca: true,
        criadoPor: {
          select: { id: true, nome: true, email: true },
        },
      },
    })

    if (!consoleItem) {
      res.status(404).json({ erro: "Console não encontrado" })
      return
    }

    res.status(200).json(consoleItem)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {
  const valida = consoleSchema.safeParse(req.body)

  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { nome, marcaid, empresa, ano, foto, video, descricao, adminId } = valida.data

  try {
    const consoleItem = await prisma.console.create({
      data: {
        nome,
        marcaid,
        empresa,
        ano,
        foto,
        video,
        descricao,
        adminId,
      },
    })

    res.status(201).json(consoleItem)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.put("/:id", async (req, res) => {
  const { id } = req.params

  const valida = consoleSchema.omit({ adminId: true }).safeParse(req.body)

  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { nome, marcaid, empresa, ano, foto, video, descricao } = valida.data

  try {
    const consoleItem = await prisma.console.update({
      where: { id: Number(id) },
      data: {
        nome,
        marcaid,
        empresa,
        ano,
        foto,
        video,
        descricao
      },
    })

    res.status(200).json(consoleItem)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  const removidoPorId = Number(req.query.adminId)

  if (!removidoPorId || Number.isNaN(removidoPorId)) {
    res.status(400).json({ erro: "Informe o adminId na query para deletar" })
    return
  }

  try {
    const consoleItem = await prisma.console.update({
      where: { id: Number(id) },
      data: {
        deletadoEm: new Date(),
        deletadoPorId: removidoPorId,
      },
    })

    res.status(200).json(consoleItem)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

export default router
