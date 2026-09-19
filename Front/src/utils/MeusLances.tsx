import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

type Lance = {
    id: number
    valor: number
    dataLance: string
    venceu: boolean
    maiorLance: number // Maior valor atual do leilao.
    superado: boolean // Indica se outro usuario fez um lance maior.
    leilao: {
        id: number
        nome: string
    }
}

type Usuario = {
    id: number
}

const apiUrl = import.meta.env.VITE_API_URL

// Busca novamente os lances depois de cada novo lance enviado.
async function buscaLances(usuarioId: number) {
    const resposta = await fetch(`${apiUrl}/clientes/${usuarioId}`)
    const dados = await resposta.json()
    if (!resposta.ok) throw new Error(dados.erro ?? "Não foi possível buscar seus lances")
    return dados.lances ?? []
}

export default function MeusLances() {
    const navigate = useNavigate()
    const [lances, setLances] = useState<Lance[]>([])
    const [erro, setErro] = useState("")
    // Mantem um valor digitado separadamente para cada leilao.
    const [novosLances, setNovosLances] = useState<Record<number, string>>({})
    const [enviando, setEnviando] = useState<number | null>(null)

    useEffect(() => {
        const token = localStorage.getItem("token")
        const usuarioSalvo = localStorage.getItem("usuario")

        if (!token || !usuarioSalvo) {
            navigate("/login")
            return
        }

        try {
            const usuario = JSON.parse(usuarioSalvo) as Usuario

            buscaLances(usuario.id)
                .then(setLances)
                .catch((error: Error) => setErro(error.message))
        } catch {
            localStorage.removeItem("token")
            localStorage.removeItem("usuario")
            navigate("/login")
        }
    }, [navigate])

    // Envia um novo lance usando a validacao e autenticacao do backend.
    async function enviarNovoLance(lance: Lance) {
        const token = localStorage.getItem("token")
        const usuarioSalvo = localStorage.getItem("usuario")
        const valor = Number(novosLances[lance.leilao.id])

        if (!token || !usuarioSalvo || !valor || valor <= lance.maiorLance) {
            setErro(`O novo lance deve ser maior que R$ ${lance.maiorLance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`)
            return
        }

        try {
            setEnviando(lance.leilao.id)
            const resposta = await fetch(`${apiUrl}/lances`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ leilaoId: lance.leilao.id, valor }),
            })
            const dados = await resposta.json()
            if (!resposta.ok) throw new Error(dados.erro ?? "Não foi possível realizar o lance")

            const usuario = JSON.parse(usuarioSalvo) as Usuario
            setLances(await buscaLances(usuario.id))
            setNovosLances((valores) => ({ ...valores, [lance.leilao.id]: "" }))
            setErro("")
        } catch (error) {
            setErro(error instanceof Error ? error.message : "Não foi possível realizar o lance")
        } finally {
            setEnviando(null)
        }
    }

    return (
        <main className="max-w-4xl mx-auto mt-20 mb-32 px-4">
            <h1 className="mb-6 text-3xl font-bold">Meus lances</h1>
            {erro && <p className="text-red-600">{erro}</p>}
            {!erro && lances.length === 0 && <p>Você ainda não realizou nenhum lance.</p>}
            <div className="flex flex-col gap-3">
                {lances.map((lance) => (
                    <article key={lance.id} className="p-4 border rounded-lg shadow-sm">
                        <Link to={`/detalhes/${lance.leilao.id}`} className="font-bold underline">
                            {lance.leilao.nome}
                        </Link>
                        <p>Valor: R$ {lance.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                        <p className="text-sm text-gray-600">
                            Data: {new Date(lance.dataLance).toLocaleString("pt-BR")}
                        </p>
                        {lance.venceu && (
                            <p className="font-bold text-green-600">
                                Parabéns, você arrematou!
                            </p>
                        )}
                        {/* Exibe a nova oferta somente quando outro usuario superou este lance. */}
                        {lance.superado && (
                            <div className="mt-3 rounded border border-yellow-300 bg-yellow-50 p-3">
                                <p className="font-bold text-yellow-800">
                                    Seu lance foi superado. Deseja dar um lance maior?
                                </p>
                                <form className="mt-2 flex gap-2" onSubmit={(evento) => {
                                    evento.preventDefault()
                                    void enviarNovoLance(lance)
                                }}>
                                    <input
                                        type="number"
                                        min={lance.maiorLance + 0.01}
                                        step="0.01"
                                        value={novosLances[lance.leilao.id] ?? ""}
                                        onChange={(evento) => setNovosLances((valores) => ({
                                            ...valores,
                                            [lance.leilao.id]: evento.target.value,
                                        }))}
                                        placeholder={`Maior que R$ ${lance.maiorLance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                                        className="min-w-0 flex-1 rounded border p-2"
                                    />
                                    <button type="submit" disabled={enviando === lance.leilao.id} className="rounded bg-blue-600 px-3 py-2 text-white disabled:opacity-50">
                                        {enviando === lance.leilao.id ? "Enviando..." : "Dar lance"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </main>
    )
}
