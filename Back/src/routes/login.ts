import { prisma } from "../../lib/prisma"
import { Router, type Request, type Response } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { z } from "zod"
import { registraLog } from "../utilit/baseLogs"

const router = Router()

const loginSchema = z.object({
    email: z.email("Email deve ser válido"),
    senha: z.string().min(1, "Senha deve ser informada")
})

router.post("/", async (req: Request, res: Response) => {
    const valida = loginSchema.safeParse(req.body)

    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const { email, senha } = valida.data
    const mensagemPadrao = "Email ou senha invalidos"

    try {
        const usuario = await prisma.usuario.findUnique({ where: { email } })

        if (!usuario) {
            await registraLog(`Tentativa de login falhou para o email nao cadastrado: ${email}`)
            res.status(400).json({ erro: mensagemPadrao })
            return
        }

        const senhaOk = await bcrypt.compare(senha, usuario.senha)

        if (!senhaOk) {
            await registraLog(`Tentativa de login falhou para o email ${email} por senha incorreta.`, usuario.id)
            res.status(400).json({ erro: mensagemPadrao })
            return
        }

        const ultimoLoginAnterior = usuario.ultimoLogin

        await prisma.usuario.update({
            where: { id: usuario.id },
            data: { ultimoLogin: new Date() }
        })

        const secret = process.env.JWT_SECRET

        if (!secret) {
            res.status(500).json({ erro: "Configuracao de autenticacao ausente" })
            return
        }

        const token = jwt.sign(
            {
                usuarioId: usuario.id,
                usuarioNome: usuario.nome,
                usuarioEmail: usuario.email
            },
            secret,
            { expiresIn: "15m" }
        )

        const mensagem = ultimoLoginAnterior
            ? `Bem-vindo, ${usuario.nome}. Seu ultimo acesso foi em ${new Date(ultimoLoginAnterior).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}.`
            : `Bem-vindo, ${usuario.nome}. Este e o seu primeiro acesso ao sistema.`

        await registraLog(`Usuario ${usuario.nome} (ID: ${usuario.id}) logou com sucesso.`, usuario.id)

        res.status(200).json({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            token,
            mensagem
        })
    } catch (error) {
        res.status(500).json({ erro: "Erro interno no servidor" })
    }
})

export default router