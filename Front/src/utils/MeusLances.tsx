import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

type Lance = {
    id: number
    valor: number
    dataLance: string
    venceu: boolean
    leilao: {
        id: number
        nome: string
    }
}

type Usuario = {
    id: number
}

const apiUrl = import.meta.env.VITE_API_URL

export default function MeusLances() {
    const navigate = useNavigate()
    const [lances, setLances] = useState<Lance[]>([])
    const [erro, setErro] = useState("")

    useEffect(() => {
        const token = localStorage.getItem("token")
        const usuarioSalvo = localStorage.getItem("usuario")

        if (!token || !usuarioSalvo) {
            navigate("/login")
            return
        }

        try {
            const usuario = JSON.parse(usuarioSalvo) as Usuario

            fetch(`${apiUrl}/clientes/${usuario.id}`)
                .then(async (resposta) => {
                    const dados = await resposta.json()
                    if (!resposta.ok) throw new Error(dados.erro ?? "Não foi possível buscar seus lances")
                    setLances(dados.lances ?? [])
                })
                .catch((error: Error) => setErro(error.message))
        } catch {
            localStorage.removeItem("token")
            localStorage.removeItem("usuario")
            navigate("/login")
        }
    }, [navigate])

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
                    </article>
                ))}
            </div>
        </main>
    )
}
