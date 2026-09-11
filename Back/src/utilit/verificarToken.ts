import jwt from "jsonwebtoken"
import type { NextFunction, Request, Response } from "express"

const segredo = process.env.JWT_SECRET ?? "bidbits-segredo-desenvolvimento"

declare global {
	namespace Express {
		interface Request {
			usuarioId?: number
		}
	}
}

export function verificarToken(req: Request, res: Response, next: NextFunction) {
	const autorizacao = req.headers.authorization
	const token = autorizacao?.startsWith("Bearer ") ? autorizacao.slice(7) : undefined

	if (!token) {
		res.status(401).json({ erro: "Faça login para continuar" })
		return
	}

	try {
		const payload = jwt.verify(token, segredo)

		if (typeof payload !== "object" || typeof payload.usuarioId !== "number") {
			res.status(401).json({ erro: "Token inválido" })
			return
		}

		req.usuarioId = payload.usuarioId
		next()
	} catch {
		res.status(401).json({ erro: "Token inválido ou expirado" })
	}
}