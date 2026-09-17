import "dotenv/config"
import { GoogleGenAI } from "@google/genai"

export type ItemLeilaoIA = {
	nome: string
	ano?: number
	marca?: string
	tipo?: string
}

export type ResultadoIA = {
	descricao: string
	valorEstimado: string
	raridade: string
	unidadesFabricadas: string
	pontosFortes: string[]
}

const promptBase = `Você é um redator especializado em leilões de games e eletrônicos retrô.
Crie uma descrição comercial atrativa e profissional para este item de leilão, pesquise no mercado o valor estimado e raridade do produto, quantas unidades foram fabricadas, e destaque os pontos fortes do item.`

function extrairJson(texto: string): ResultadoIA {
	const json = texto.match(/\{[\s\S]*\}/)?.[0]

	if (!json) {
		throw new Error("A IA não retornou um JSON válido")
	}

	const resultado: unknown = JSON.parse(json)

	if (
		typeof resultado !== "object" ||
		resultado === null ||
		typeof (resultado as ResultadoIA).descricao !== "string" ||
		typeof (resultado as ResultadoIA).valorEstimado !== "string" ||
		typeof (resultado as ResultadoIA).raridade !== "string" ||
		typeof (resultado as ResultadoIA).unidadesFabricadas !== "string" ||
		!Array.isArray((resultado as ResultadoIA).pontosFortes) ||
		!(resultado as ResultadoIA).pontosFortes.every((ponto) => typeof ponto === "string")
	) {
		throw new Error("A resposta da IA possui um formato inválido")
	}

	return resultado as ResultadoIA
}

export async function consultarDadosComIA(item: ItemLeilaoIA): Promise<ResultadoIA> {
	const apiKey = process.env.GEMINI_API_KEY

	if (!apiKey) {
		throw new Error("GEMINI_API_KEY não configurada")
	}

	const ai = new GoogleGenAI({ apiKey })
	const modelos = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-lite-latest"]
	let ultimoErro: unknown

	for (const modelo of modelos) {
		try {
			const resposta = await ai.models.generateContent({
				model: modelo,
				contents: `${promptBase}

Item:
- Nome: ${item.nome}
- Ano: ${item.ano ?? "não informado"}
- Marca: ${item.marca ?? "não informado"}
- Tipo: ${item.tipo ?? "não informado"}

Responda exclusivamente com um JSON válido, sem Markdown, usando exatamente esta estrutura:
{
	"descricao": "texto comercial do item",
	"valorEstimado": "faixa de valor em reais e breve justificativa",
	"raridade": "classificação e justificativa",
	"unidadesFabricadas": "quantidade conhecida ou 'não informado'",
	"pontosFortes": ["ponto forte 1", "ponto forte 2", "ponto forte 3"]
}
Não invente números exatos quando não houver fonte confiável; informe que o dado é desconhecido ou estimado.`,
			})

			return extrairJson(resposta.text ?? "")
		} catch (error) {
			ultimoErro = error
		}
	}

	throw ultimoErro instanceof Error
		? ultimoErro
		: new Error("Todos os modelos Gemini disponíveis estão indisponíveis")
}
