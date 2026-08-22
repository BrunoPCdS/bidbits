import type { MarcaType } from "./MarcaType"

export type CarroType = {
    id: number
    modelo: string
    ano: number
    preco: number
    km: number
    destaque: boolean
    foto: string
    acessorios: string
    createdAt: Date
    updatedAt: Date
    combustivel: string
    marcaId: number
    marca: MarcaType
}