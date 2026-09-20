import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const apiUrl = import.meta.env.VITE_API_URL

type DashboardData = {
    // Formato dos dados recebidos do endpoint administrativo.
    resumo: { totalClientes: number; totalLeiloes: number; totalLances: number; leiloesAtivos: number; maiorLance: number }
    cadastrosPorMes: { chave: string; total: number }[]
    rankingLeiloes: { id: number; nome: string; quantidadeLances: number; maiorLance: number }[]
    marcasMaisProcuradas: { marca: string; quantidadeLances: number }[]
}

const dinheiro = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

export default function Dashboard() {
    const navigate = useNavigate()
    const [dados, setDados] = useState<DashboardData | null>(null)
    const [erro, setErro] = useState("")

    useEffect(() => {
        // A página só é carregada por administradores e usa o token para chamar a API protegida.
        if (localStorage.getItem("perfil") !== "admin") {
            navigate("/admin")
            return
        }
        fetch(`${apiUrl}/administradores/dashboard`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
            .then(async (resposta) => {
                const resultado = await resposta.json()
                if (!resposta.ok) throw new Error(resultado.erro?.message ?? resultado.erro ?? "Não foi possível carregar os indicadores")
                return resultado
            })
            .then(setDados)
            .catch((error) => setErro(error instanceof Error ? error.message : "Erro ao carregar dashboard"))
    }, [navigate])

    if (erro) return <main className="max-w-6xl mx-auto px-4 py-10"><p className="text-red-600">{erro}</p></main>
    if (!dados) return <main className="max-w-6xl mx-auto px-4 py-10"><p>Carregando dashboard...</p></main>

    // Os maiores valores servem para calcular proporcionalmente a altura das barras.
    const maiorQuantidade = Math.max(1, ...dados.marcasMaisProcuradas.map((item) => item.quantidadeLances))
    const maiorCadastro = Math.max(1, ...dados.cadastrosPorMes.map((item) => item.total))

    return <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8"><div><p className="text-sm uppercase tracking-widest text-gray-500">Administração</p><h1 className="text-3xl font-bold">Dashboard</h1></div><Link to="/admin/painel" className="px-4 py-2 border rounded">Voltar ao painel</Link></div>
        {/* Cards com os principais indicadores do sistema. */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="p-5 rounded-lg bg-[#1d0014] text-white"><p className="text-sm opacity-75">Clientes cadastrados</p><strong className="text-3xl">{dados.resumo.totalClientes}</strong></div>
            <div className="p-5 rounded-lg border"><p className="text-sm text-gray-500">Leilões ativos</p><strong className="text-3xl">{dados.resumo.leiloesAtivos}</strong></div>
            <div className="p-5 rounded-lg border"><p className="text-sm text-gray-500">Total de lances</p><strong className="text-3xl">{dados.resumo.totalLances}</strong></div>
            <div className="p-5 rounded-lg border"><p className="text-sm text-gray-500">Maior lance</p><strong className="text-3xl">{dinheiro.format(dados.resumo.maiorLance)}</strong></div>
        </section>
        {/* Gráficos simples em CSS: cadastros por mês e marcas com mais lances. */}
        <section className="grid gap-8 lg:grid-cols-2">
            <article className="p-6 border rounded-lg"><h2 className="text-xl font-semibold mb-6">Cadastros nos últimos meses</h2><div className="flex items-end gap-3 h-52 border-b border-l px-3">{dados.cadastrosPorMes.map((item) => <div key={item.chave} className="flex-1 flex flex-col items-center justify-end h-full gap-2"><span className="text-xs">{item.total}</span><div className="w-full max-w-10 bg-[#1d0014] rounded-t" style={{ height: `${Math.max(4, item.total / maiorCadastro * 75)}%` }} /><span className="text-xs text-gray-500">{item.chave.slice(5)}</span></div>)}</div></article>
            <article className="p-6 border rounded-lg"><h2 className="text-xl font-semibold mb-6">Marcas mais procuradas</h2><div className="space-y-4">{dados.marcasMaisProcuradas.length === 0 ? <p className="text-gray-500">Ainda não há lances registrados.</p> : dados.marcasMaisProcuradas.map((item) => <div key={item.marca}><div className="flex justify-between text-sm mb-1"><span>{item.marca}</span><strong>{item.quantidadeLances}</strong></div><div className="h-3 bg-gray-100 rounded"><div className="h-3 bg-[#1d0014] rounded" style={{ width: `${item.quantidadeLances / maiorQuantidade * 100}%` }} /></div></div>)}</div></article>
        </section>
        {/* Tabela ordenada pelos leilões que receberam mais lances. */}
        <section className="mt-8 p-6 border rounded-lg"><h2 className="text-xl font-semibold mb-4">Leilões com mais lances</h2>{dados.rankingLeiloes.length === 0 ? <p className="text-gray-500">Ainda não há leilões cadastrados.</p> : <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b text-sm text-gray-500"><th className="py-3 pr-4">Leilão</th><th className="py-3 pr-4">Lances</th><th className="py-3">Maior lance</th></tr></thead><tbody>{dados.rankingLeiloes.map((item, indice) => <tr key={item.id} className="border-b last:border-0"><td className="py-3 pr-4"><span className="mr-3 text-gray-400">{indice + 1}º</span>{item.nome}</td><td className="py-3 pr-4">{item.quantidadeLances}</td><td className="py-3">{dinheiro.format(item.maiorLance)}</td></tr>)}</tbody></table></div>}</section>
    </main>
}