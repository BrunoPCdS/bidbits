import type { MarcaType } from "./MarcaType"

export type DadosIAType = {
  descricao: string
  valorEstimado: string
  raridade: string
  unidadesFabricadas: string
  pontosFortes: string[]
}

export type ConsoleType = {
  id: number
  nome: string
  marcaid: number
  marca?: MarcaType
  empresa?: "Nintendo" | "Sony" | "Microsoft" | "Xbox" | "Atari" | "Sega" | "Tectoy"
  ano?: number
  foto?: string
  video?: string
  descricao?: string
  createdAt?: Date
  updatedAt?: Date
}

export type MidiaType = {
  id: number
  nome: string
  marcaid: number
  marca?: MarcaType
  empresa?: "Nintendo" | "Sony" | "Microsoft" | "Xbox" | "Atari" | "Sega" | "Tectoy"
  ano?: number
  foto?: string
  video?: string
  tipo?: "Fita" | "DVD" | "CD"
  descricao?: string
  descricaoDetalhada?: string
  createdAt?: Date
  updatedAt?: Date
}

export type LeilaoType = {
  id: number
  nome: string
  descricao: string
  dadosIA?: DadosIAType | null
  valorInicial: number
  // Valor final retornado pela API com base no maior lance do leilao.
  valorFinal?: number
  dataInicio: string
  dataFim: string
  consoleId?: number | null
  midiaId?: number | null
  console?: ConsoleType | null
  midia?: MidiaType | null
  criadoPor?: {
    id: number
    nome: string
    email: string
  }
}