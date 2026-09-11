import { prisma } from "../../lib/prisma"
import { Router, type Request, type Response } from "express"
import bcrypt from "bcrypt"
import { z } from "zod"
import { validarSenha } from "../utilit/validaSenha"
import { registraLog } from "../utilit/baseLogs"
import { gerarCodigo } from "../utilit/gerarCodigo"
import { enviarCodigoRecuperacao } from "../utilit/enviarCodigo"

const router = Router()

const alterarSenhaSchema = z.object({
    email: z.email("Email deve ser válido"),
    codigo: z.string().min(1, "Codigo deve ser informado"),
    novaSenha: z.string().min(8, "Nova senha deve ter no minimo 8 caracteres")
})

const solicitarCodigoSchema = z.object({
    email: z.email("Email deve ser válido")
})

router.post("/solicitar-codigo", async (req: Request, res: Response) => {
    const valida = solicitarCodigoSchema.safeParse(req.body)

    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    try {
        const usuario = await prisma.usuario.findUnique({ where: { email: valida.data.email } })

        if (!usuario) {
            res.status(200).json({ mensagem: "Se o email estiver cadastrado, um codigo sera enviado" })
            return
        }

        const codigo = gerarCodigo()
        await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                codigoRecuperacao: codigo,
                codigoExpiraEm: new Date(Date.now() + 15 * 60 * 1000)
            }
        })

        await enviarCodigoRecuperacao(usuario.email, codigo)

        await registraLog(`Codigo de recuperacao solicitado para o usuario ${usuario.id}.`, usuario.id)

        res.status(200).json({ mensagem: "Se o email estiver cadastrado, um codigo sera enviado" })
    } catch {
        res.status(500).json({ erro: "Erro ao solicitar recuperacao de senha" })
    }
})

router.post("/", async (req: Request, res: Response) => {
    const valida = alterarSenhaSchema.safeParse(req.body)

    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }

    const { email, codigo, novaSenha } = valida.data

    try {
        const usuario = await prisma.usuario.findUnique({ where: { email } })

        if (!usuario) {
            res.status(404).json({ erro: "Usuario nao cadastrado" })
            return
        }

        if (!usuario.codigoRecuperacao || usuario.codigoRecuperacao !== codigo) {
            res.status(400).json({ erro: "Codigo invalido" })
            return
        }

        if (!usuario.codigoExpiraEm || usuario.codigoExpiraEm < new Date()) {
            res.status(400).json({ erro: "Codigo expirado" })
            return
        }

        const errosSenha = validarSenha(novaSenha)

        if (errosSenha.length > 0) {
            res.status(400).json({ erro: errosSenha })
            return
        }

        const senhaCriptografada = await bcrypt.hash(novaSenha, 12)

        await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                senha: senhaCriptografada,
                codigoRecuperacao: null,
                codigoExpiraEm: null
            }
        })

        await registraLog(`Usuario ${usuario.nome} alterou a senha com sucesso.`, usuario.id)

        res.status(200).json({ mensagem: "Senha alterada com sucesso" })
    } catch (error) {
        res.status(500).json({ erro: "Erro ao alterar senha" })
    }
})

export default router