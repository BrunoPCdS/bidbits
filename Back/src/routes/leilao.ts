
import { prisma } from "../../lib/prisma";

import { Router } from 'express'
import { z } from 'zod'

const router = Router()

const leilaoSchema = z.object({
    nome: z.string().min(2, { message: "Nome deve possuir, no mínimo, 2 caracteres" }),
    descricao: z.string().min(3, { message: "Descrição deve possuir, no mínimo, 3 caracteres" }),
    dataInicio: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Data de início inválida" }),
    dataFim: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Data de fim inválida" }),
    marcaid: z.number().int().positive(),
    ano: z.number().int(),
    foto: z.string().min(1, { message: "Foto é obrigatória" }),
    video: z.string().min(1, { message: "Vídeo é obrigatório" }),
})

router.get('/', async (_req, res) => {
    try {
        const leiloes = await prisma.leilao.findMany({
            where: { deletadoEm: null },
            include: {
                marca: true,
                criadoPor: {
                    select: { id: true, nome: true, email: true },
                },
            },
        });

        res.status(200).json(leiloes);
    } catch (error) {
        res.status(500).json({ erro: error });
    }
})

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const leilaoItem = await prisma.leilao.findFirst({
            where: { id: Number(id), deletadoEm: null },
            include: {
                marca: true,
                criadoPor: {
                    select: { id: true, nome: true, email: true },
                },
            },
        });

        if (!leilaoItem) {
            res.status(404).json({ erro: 'Leilão não encontrado' });
            return;
        }

        res.status(200).json(leilaoItem);
    } catch (error) {
        res.status(500).json({ erro: error });
    }
});

router.post('/', async (req, res) => {
    const valida = leilaoSchema.safeParse(req.body);
    if (!valida.success) {
        res.status(400).json({ erro: valida.error });
        return;
    }
    const { nome, descricao, dataInicio, dataFim, marcaid, ano, foto, video } = valida.data;
    const inicio = new Date(valida.data.dataInicio);
    const fim = new Date(valida.data.dataFim);
    const dataFimValida = fim > inicio ? fim : inicio;
    try {
        const leilaoItem = await prisma.leilao.create({
            data: {
                nome,
                descricao,
                dataInicio: inicio,
                dataFim: dataFimValida,
                marcaid,
                ano,
                foto,
                video,
            },
        });
        res.status(201).json(leilaoItem);
    } catch (error) {
        res.status(500).json({ erro: error });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const valida = leilaoSchema.safeParse(req.body);
    if (!valida.success) {
        res.status(400).json({ erro: valida.error });
        return;
    }
    const { nome, descricao, dataInicio, dataFim, marcaid, ano, foto, video } = valida.data;
    const inicio = new Date(valida.data.dataInicio);
    const fim = new Date(valida.data.dataFim);
    const dataFimValida = fim > inicio ? fim : inicio;
    try {
        const leilaoItem = await prisma.leilao.update({
            where: { id: Number(id) },
            data: {
                nome,
                descricao,
                dataInicio: inicio,
                dataFim: dataFimValida,
                marcaid,
                ano,
                foto,
                video,
            },
        });
        res.status(200).json(leilaoItem);
    } catch (error) {
        res.status(500).json({ erro: error });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const deletadoEm = new Date();
    const removidoPoId = Number(req.query.adminId);

    if (!removidoPoId) {
        res.status(400).json({ erro: 'ID do administrador é obrigatório para deletar o leilão' });
        return;
    }

    try {
        const leilaoItem = await prisma.leilao.update({
            where: { id: Number(id) },
            data: { deletadoEm },
        });
        res.status(200).json(leilaoItem);
    } catch (error) {
        res.status(500).json({ erro: error });
    }
});

export default router;