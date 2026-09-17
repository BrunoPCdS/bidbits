import { prisma } from "../../lib/prisma"
import {Router} from 'express';
import {z} from 'zod';
import { verificarAdmin } from "../utilit/verificarToken"

const router = Router();


const midiaSchema = z.object({
    nome: z.string().min(3, {message: 'Nome deve possuir, no mínimo, 3 caracteres'}),
    marcaid: z.number().int().positive(),
    empresa: z.enum(['Nintendo', 'Sony', 'Microsoft', 'Xbox', 'Atari', 'Sega', 'Tectoy']).default('Nintendo'),
    ano: z.number().int(),
    foto: z.string().min(1, {message: 'Foto é obrigatória'}),
    video: z.string().min(1, {message: 'Vídeo é obrigatório'}),
    descricaoDetalhada: z.string().optional(),
    tipo: z.enum(['Fita', 'DVD', 'CD']).default('Fita'),
    adminId: z.number().int().positive().optional(),
});

router.get('/', async (_req, res) => {
    try {
        const midias = await prisma.midia.findMany({
            where: { deletadoEm: null },
            include: {
            marca: true,
            criadoPor: {
            select: { id: true, nome: true, email: true },
        },
        },
        orderBy: { id: 'desc' },
    });

    res.status(200).json(midias);
    } catch (error) {
    res.status(500).json({ erro: error });
    }
})




router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const midiaItem = await prisma.midia.findFirst({
            where: { id: Number(id), deletadoEm: null },
            include: {
            marca: true,
            criadoPor: {
                select: { id: true, nome: true, email: true },
            },
        },
});

    if (!midiaItem) {
        res.status(404).json({ erro: 'Mídia não encontrada' });
        return;
    }

    res.status(200).json(midiaItem);
    } catch (error) {
    res.status(500).json({ erro: error });
    }
});

router.post('/', verificarAdmin, async (req, res) => {
    const valida = midiaSchema.safeParse(req.body);

    if (!valida.success) {
        res.status(400).json({ erro: valida.error });
        return;
    }

    const { nome, marcaid, empresa, ano, foto, video, descricaoDetalhada, tipo } = valida.data;

    try {
        const midiaItem = await prisma.midia.create({
            data: {
                nome,
                marcaid,
                empresa,
                ano,
                foto,
                video,
                descricao: descricaoDetalhada ?? '',
                descricaoDetalhada,
                tipo,
                adminId: req.adminId!,
            },
        });

        res.status(201).json(midiaItem);
    } catch (error) {
        res.status(500).json({ erro: error });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;

    const valida = midiaSchema.omit({ adminId: true }).partial().safeParse(req.body);

    if (!valida.success) {
        res.status(400).json({ erro: valida.error });
        return;
    }

    try {
        const midiaItem = await prisma.midia.update({
            where: { id: Number(id) },
            data: valida.data,
        });

        res.status(200).json(midiaItem);
    } catch (error) {
        res.status(500).json({ erro: error });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const removidoPorId = Number(req.query.adminId);

    if (!removidoPorId || isNaN(removidoPorId)) {
        res.status(400).json({ erro: 'ID do administrador inválido' });
        return;
    }

    try {
        const midiaItem = await prisma.midia.update({
        where: { id: Number(id) },
        data: { deletadoEm: new Date(), deletadoPorId: removidoPorId },
        });

    res.status(200).json(midiaItem);
    } catch (error) {
        res.status(500).json({ erro: error });
    }
});

export default router;

