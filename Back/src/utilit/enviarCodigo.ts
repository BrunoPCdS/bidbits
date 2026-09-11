import "dotenv/config"
import nodemailer from "nodemailer"

const smtpHost = process.env.MAILTRAP_HOST ?? "sandbox.smtp.mailtrap.io"
const smtpPort = Number(process.env.MAILTRAP_PORT ?? 2525)

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
        user: process.env.MAILTRAP_EMAIL,
        pass: process.env.MAILTRAP_SENHA
    }
})

export async function enviarCodigoRecuperacao(email: string, codigo: string) {
    if (!process.env.MAILTRAP_EMAIL || !process.env.MAILTRAP_SENHA) {
        throw new Error("Credenciais do Mailtrap não configuradas")
    }

    await transporter.sendMail({
        from: process.env.MAILTRAP_FROM ?? "no-reply@bidbits.local",
        to: email,
        subject: "Codigo para alterar sua senha",
        text: `Seu codigo para alterar a senha e ${codigo}. Ele expira em 15 minutos.`,
        html: `
            <h2>Alteracao de senha</h2>
            <p>Use o codigo abaixo para alterar sua senha:</p>
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${codigo}</p>
            <p>Este codigo expira em 15 minutos.</p>
        `
    })
}