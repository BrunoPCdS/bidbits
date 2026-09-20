import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import type { ConsoleType, LeilaoType, MidiaType } from "./LeilaoType"
import type { MarcaType } from "./MarcaType"

const apiUrl = import.meta.env.VITE_API_URL
const token = () => localStorage.getItem("token")

type ItemForm = {
    nome: string
    marcaid: string
    empresa: string
    ano: string
    foto: string
    video: string
    descricao: string
    tipo: string
}

const itemInicial: ItemForm = { nome: "", marcaid: "", empresa: "Nintendo", ano: "", foto: "", video: "", descricao: "", tipo: "Fita" }

export default function AdminPainel() {
    const navigate = useNavigate()
    const [consoles, setConsoles] = useState<ConsoleType[]>([])
    const [midias, setMidias] = useState<MidiaType[]>([])
    const [marcas, setMarcas] = useState<MarcaType[]>([])
    const [leiloes, setLeiloes] = useState<LeilaoType[]>([])
    const [mensagem, setMensagem] = useState("")
    const [erro, setErro] = useState("")
    const [consoleForm, setConsoleForm] = useState(itemInicial)
    const [consoleEditandoId, setConsoleEditandoId] = useState<number | null>(null)
    const [midiaForm, setMidiaForm] = useState(itemInicial)
    const [midiaEditandoId, setMidiaEditandoId] = useState<number | null>(null)
    const [leilao, setLeilao] = useState({ nome: "", descricao: "", valorInicial: "", dataInicio: "", dataFim: "", consoleId: "", midiaId: "" })

    useEffect(() => {
        if (localStorage.getItem("perfil") !== "admin") {
            navigate("/admin")
            return
        }
        Promise.all([
            fetch(`${apiUrl}/consoles`).then((resposta) => resposta.json()),
            fetch(`${apiUrl}/midias`).then((resposta) => resposta.json()),
            fetch(`${apiUrl}/leiloes`).then((resposta) => resposta.json()),
            fetch(`${apiUrl}/marcas`).then((resposta) => resposta.json()),
        ]).then(([consolesDados, midiasDados, leiloesDados, marcasDados]) => {
            setConsoles(consolesDados)
            setMidias(midiasDados)
            setLeiloes(leiloesDados)
            setMarcas(marcasDados)
        }).catch(() => setErro("Não foi possível carregar os itens cadastrados"))
    }, [navigate])

    async function atualizarItens() {
        const [consolesDados, midiasDados] = await Promise.all([
            fetch(`${apiUrl}/consoles`).then((resposta) => resposta.json()),
            fetch(`${apiUrl}/midias`).then((resposta) => resposta.json()),
        ])
        setConsoles(consolesDados)
        setMidias(midiasDados)
        const leiloesDados = await fetch(`${apiUrl}/leiloes`).then((resposta) => resposta.json())
        setLeiloes(leiloesDados)
    }

    async function enviar(endpoint: string, body: object, sucesso: string) {
        setErro("")
        setMensagem("")
        const resposta = await fetch(`${apiUrl}/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
            body: JSON.stringify(body),
        })
        const dados = await resposta.json()
        if (!resposta.ok) {
            const mensagemErro = dados.erro?.issues?.[0]?.message ?? (typeof dados.erro === "string" ? dados.erro : "Não foi possível salvar")
            throw new Error(mensagemErro)
        }
        setMensagem(sucesso)
    }

    async function cadastrarConsole(evento: FormEvent) {
        evento.preventDefault()
        try {
            const corpo = { ...consoleForm, marcaid: Number(consoleForm.marcaid), ano: Number(consoleForm.ano) }
            if (consoleEditandoId) {
                const resposta = await fetch(`${apiUrl}/consoles/${consoleEditandoId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
                    body: JSON.stringify(corpo),
                })
                const dados = await resposta.json()
                if (!resposta.ok) {
                    const mensagemErro = dados.erro?.issues?.[0]?.message ?? (typeof dados.erro === "string" ? dados.erro : "Não foi possível alterar")
                    throw new Error(mensagemErro)
                }
                setMensagem("Console alterado")
            } else {
                await enviar("consoles", corpo, "Console cadastrado")
            }
            setConsoleForm(itemInicial)
            setConsoleEditandoId(null)
            await atualizarItens()
        } catch (error) { setErro(error instanceof Error ? error.message : "Falha ao cadastrar console") }
    }

    function editarConsole(consoleItem: ConsoleType) {
        setConsoleEditandoId(consoleItem.id)
        setConsoleForm({
            nome: consoleItem.nome,
            marcaid: String(consoleItem.marcaid),
            empresa: consoleItem.empresa ?? "Nintendo",
            ano: String(consoleItem.ano ?? ""),
            foto: consoleItem.foto ?? "",
            video: consoleItem.video ?? "",
            descricao: consoleItem.descricao ?? "",
            tipo: "Fita",
        })
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    async function excluirConsole(id: number) {
        const usuario = JSON.parse(localStorage.getItem("usuario") ?? "{}") as { id?: number }
        if (!usuario.id || !window.confirm("Deseja excluir este console?")) return

        try {
            const resposta = await fetch(`${apiUrl}/consoles/${id}?adminId=${usuario.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token()}` },
            })
            const dados = await resposta.json()
            if (!resposta.ok) throw new Error(dados.erro ?? "Não foi possível excluir o console")
            if (consoleEditandoId === id) {
                setConsoleEditandoId(null)
                setConsoleForm(itemInicial)
            }
            setMensagem("Console excluído")
            await atualizarItens()
        } catch (error) { setErro(error instanceof Error ? error.message : "Falha ao excluir console") }
    }

    function cancelarEdicaoConsole() {
        setConsoleEditandoId(null)
        setConsoleForm(itemInicial)
    }

    async function cadastrarMidia(evento: FormEvent) {
        evento.preventDefault()
        try {
            const corpo = { ...midiaForm, descricaoDetalhada: midiaForm.descricao, marcaid: Number(midiaForm.marcaid), ano: Number(midiaForm.ano) }
            if (midiaEditandoId) {
                const resposta = await fetch(`${apiUrl}/midias/${midiaEditandoId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
                    body: JSON.stringify(corpo),
                })
                const dados = await resposta.json()
                if (!resposta.ok) {
                    const mensagemErro = dados.erro?.issues?.[0]?.message ?? (typeof dados.erro === "string" ? dados.erro : "Não foi possível alterar")
                    throw new Error(mensagemErro)
                }
                setMensagem("Mídia alterada")
            } else {
                await enviar("midias", corpo, "Mídia cadastrada")
            }
            setMidiaForm(itemInicial)
            setMidiaEditandoId(null)
            await atualizarItens()
        } catch (error) { setErro(error instanceof Error ? error.message : "Falha ao cadastrar mídia") }
    }

    function editarMidia(midia: MidiaType) {
        setMidiaEditandoId(midia.id)
        setMidiaForm({
            nome: midia.nome,
            marcaid: String(midia.marcaid),
            empresa: midia.empresa ?? "Nintendo",
            ano: String(midia.ano ?? ""),
            foto: midia.foto ?? "",
            video: midia.video ?? "",
            descricao: midia.descricaoDetalhada ?? midia.descricao ?? "",
            tipo: midia.tipo ?? "Fita",
        })
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    async function excluirMidia(id: number) {
        const usuario = JSON.parse(localStorage.getItem("usuario") ?? "{}") as { id?: number }
        if (!usuario.id || !window.confirm("Deseja excluir esta mídia?")) return

        try {
            const resposta = await fetch(`${apiUrl}/midias/${id}?adminId=${usuario.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token()}` },
            })
            const dados = await resposta.json()
            if (!resposta.ok) throw new Error(dados.erro ?? "Não foi possível excluir a mídia")
            if (midiaEditandoId === id) {
                setMidiaEditandoId(null)
                setMidiaForm(itemInicial)
            }
            setMensagem("Mídia excluída")
            await atualizarItens()
        } catch (error) { setErro(error instanceof Error ? error.message : "Falha ao excluir mídia") }
    }

    function cancelarEdicaoMidia() {
        setMidiaEditandoId(null)
        setMidiaForm(itemInicial)
    }

    async function excluirLeilao(id: number) {
        if (!window.confirm("Deseja excluir este leilão? Os lances associados também serão removidos.")) return

        try {
            const resposta = await fetch(`${apiUrl}/leiloes/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token()}` },
            })
            const dados = await resposta.json()
            if (!resposta.ok) throw new Error(dados.erro ?? "Não foi possível excluir o leilão")
            setMensagem("Leilão excluído")
            await atualizarItens()
        } catch (error) { setErro(error instanceof Error ? error.message : "Falha ao excluir leilão") }
    }

    async function gerarIADoLeilao(id: number) {
        setErro("")
        setMensagem("")
        try {
            const resposta = await fetch(`${apiUrl}/leiloes/${id}/gerar-ia`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token()}` },
            })
            const dados = await resposta.json()
            if (!resposta.ok) throw new Error(dados.erro ?? "Não foi possível gerar os detalhes com IA")
            setMensagem("Detalhes gerados com IA")
            await atualizarItens()
        } catch (error) { setErro(error instanceof Error ? error.message : "Falha ao gerar detalhes com IA") }
    }

    async function cadastrarLeilao(evento: FormEvent) {
        evento.preventDefault()
        try {
            await enviar("leiloes", { ...leilao, valorInicial: Number(leilao.valorInicial), consoleId: leilao.consoleId ? Number(leilao.consoleId) : null, midiaId: leilao.midiaId ? Number(leilao.midiaId) : null, gerarDescricaoComIA: true }, "Leilão cadastrado; descrição sendo gerada automaticamente")
            setLeilao({ nome: "", descricao: "", valorInicial: "", dataInicio: "", dataFim: "", consoleId: "", midiaId: "" })
        } catch (error) { setErro(error instanceof Error ? error.message : "Falha ao cadastrar leilão") }
    }

    function camposItem(formulario: ItemForm, setFormulario: (valor: ItemForm) => void, midia = false) {
        return <>
            <input required placeholder="Nome" value={formulario.nome} onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })} className="p-2 border rounded" />
            <label className="grid gap-1"><span className="text-sm text-gray-600">Marca</span><select required value={formulario.marcaid} onChange={(e) => setFormulario({ ...formulario, marcaid: e.target.value })} className="p-2 border rounded"><option value="">Selecionar marca</option>{marcas.map((marca) => <option key={marca.id} value={marca.id}>{marca.nome}</option>)}</select></label>
            <input required type="number" placeholder="Ano" value={formulario.ano} onChange={(e) => setFormulario({ ...formulario, ano: e.target.value })} className="p-2 border rounded" />
            <input required placeholder="URL da foto" value={formulario.foto} onChange={(e) => setFormulario({ ...formulario, foto: e.target.value })} className="p-2 border rounded" />
            <input required placeholder="URL do vídeo" value={formulario.video} onChange={(e) => setFormulario({ ...formulario, video: e.target.value })} className="p-2 border rounded" />
            <label className="grid gap-1"><span className="text-sm text-gray-600">Empresa/fabricante</span><select value={formulario.empresa} onChange={(e) => setFormulario({ ...formulario, empresa: e.target.value })} className="p-2 border rounded"><option>Nintendo</option><option>Sony</option><option>Microsoft</option><option>Xbox</option><option>Atari</option><option>Sega</option><option>Tectoy</option></select></label>
            {midia && <select value={formulario.tipo} onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value })} className="p-2 border rounded"><option>Fita</option><option>DVD</option><option>CD</option></select>}
            <textarea required={!midia} placeholder={midia ? "Descrição detalhada (opcional)" : "Descrição"} value={formulario.descricao} onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })} className="p-2 border rounded md:col-span-2" />
        </>
    }

    // DASHBOARD: botão que leva o administrador do painel de cadastros para os indicadores.
    return <main className="max-w-6xl mx-auto px-4 py-10"><h1 className="text-3xl font-bold mb-2">Painel administrativo</h1> <button type="button" onClick={() => navigate("/admin/dashboard")} className="px-4 py-2 text-white bg-[#1d0014] rounded">Ver dashboard</button><p className="mb-8 text-gray-600">Cadastre o item primeiro e depois associe-o a um leilão.</p>
        {(erro || mensagem) && <p className={erro ? "mb-6 text-red-600" : "mb-6 text-green-600"}>{erro || mensagem}</p>}
        <div className="grid gap-8 lg:grid-cols-2">
            <form onSubmit={cadastrarConsole} className="p-6 border rounded-lg shadow"><h2 className="mb-4 text-xl font-semibold">{consoleEditandoId ? "Alterar console" : "Novo console"}</h2><div className="grid gap-3">{camposItem(consoleForm, setConsoleForm)}<div className="flex gap-2"><button className="px-4 py-2 text-white bg-[#1d0014] rounded">{consoleEditandoId ? "Salvar alteração" : "Cadastrar console"}</button>{consoleEditandoId && <button type="button" onClick={cancelarEdicaoConsole} className="px-4 py-2 border rounded">Cancelar</button>}</div></div></form>
            <form onSubmit={cadastrarMidia} className="p-6 border rounded-lg shadow"><h2 className="mb-4 text-xl font-semibold">{midiaEditandoId ? "Alterar mídia" : "Nova mídia"}</h2><div className="grid gap-3">{camposItem(midiaForm, setMidiaForm, true)}<div className="flex gap-2"><button className="px-4 py-2 text-white bg-[#1d0014] rounded">{midiaEditandoId ? "Salvar alteração" : "Cadastrar mídia"}</button>{midiaEditandoId && <button type="button" onClick={cancelarEdicaoMidia} className="px-4 py-2 border rounded">Cancelar</button>}</div></div></form>
            <form onSubmit={cadastrarLeilao} className="p-6 border rounded-lg shadow lg:col-span-2"><h2 className="mb-4 text-xl font-semibold">Novo leilão</h2><div className="grid gap-3 md:grid-cols-2"><input required placeholder="Nome do leilão" value={leilao.nome} onChange={(e) => setLeilao({ ...leilao, nome: e.target.value })} className="p-2 border rounded" /><input required type="number" step="0.01" placeholder="Valor inicial" value={leilao.valorInicial} onChange={(e) => setLeilao({ ...leilao, valorInicial: e.target.value })} className="p-2 border rounded" /><textarea required placeholder="Descrição" value={leilao.descricao} onChange={(e) => setLeilao({ ...leilao, descricao: e.target.value })} className="p-2 border rounded md:col-span-2" /><input required type="datetime-local" value={leilao.dataInicio} onChange={(e) => setLeilao({ ...leilao, dataInicio: e.target.value })} className="p-2 border rounded" /><input required type="datetime-local" value={leilao.dataFim} onChange={(e) => setLeilao({ ...leilao, dataFim: e.target.value })} className="p-2 border rounded" /><select value={leilao.consoleId} onChange={(e) => setLeilao({ ...leilao, consoleId: e.target.value, midiaId: "" })} className="p-2 border rounded"><option value="">Selecionar console (opcional)</option>{consoles.map((item) => <option key={item.id} value={item.id}>#{item.id} - {item.nome}{item.marca ? ` (${item.marca.nome})` : ""}</option>)}</select><select value={leilao.midiaId} onChange={(e) => setLeilao({ ...leilao, midiaId: e.target.value, consoleId: "" })} className="p-2 border rounded"><option value="">Selecionar mídia (opcional)</option>{midias.map((item) => <option key={item.id} value={item.id}>#{item.id} - {item.nome}{item.marca ? ` (${item.marca.nome})` : ""}</option>)}</select><button className="px-4 py-2 text-white bg-[#1d0014] rounded md:col-span-2">Cadastrar leilão</button></div></form>
        </div>
        <section className="mt-8 p-6 border rounded-lg shadow"><h2 className="mb-4 text-xl font-semibold">Leilões cadastrados</h2>{leiloes.length === 0 ? <p className="text-gray-600">Nenhum leilão cadastrado.</p> : <div className="grid gap-4 md:grid-cols-2">{leiloes.map((leilaoItem) => <article key={leilaoItem.id} className="flex items-center justify-between gap-4 border rounded p-4"><div className="min-w-0"><h3 className="font-bold">{leilaoItem.nome}</h3><p className="text-sm text-gray-600">Encerra em {new Date(leilaoItem.dataFim).toLocaleString("pt-BR")}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={() => gerarIADoLeilao(leilaoItem.id)} className="px-3 py-1 text-sm text-white bg-[#1d0014] rounded">Gerar IA</button><button type="button" onClick={() => excluirLeilao(leilaoItem.id)} className="px-3 py-1 text-sm text-red-700 border border-red-300 rounded">Excluir</button></div></article>)}</div>}</section>
        <section className="mt-8 p-6 border rounded-lg shadow"><h2 className="mb-4 text-xl font-semibold">Consoles cadastrados</h2>{consoles.length === 0 ? <p className="text-gray-600">Nenhum console cadastrado.</p> : <div className="grid gap-4 md:grid-cols-2">{consoles.map((consoleItem) => <article key={consoleItem.id} className="flex gap-4 border rounded p-4"><img src={consoleItem.foto} alt={consoleItem.nome} className="h-24 w-24 rounded object-cover" /><div className="min-w-0 flex-1"><h3 className="font-bold">{consoleItem.nome}</h3><p className="text-sm text-gray-600">{consoleItem.marca?.nome ?? "Marca não informada"} | {consoleItem.empresa} | {consoleItem.ano}</p><div className="mt-3 flex gap-2"><button type="button" onClick={() => editarConsole(consoleItem)} className="px-3 py-1 text-sm text-white bg-[#1d0014] rounded">Alterar</button><button type="button" onClick={() => excluirConsole(consoleItem.id)} className="px-3 py-1 text-sm text-red-700 border border-red-300 rounded">Excluir</button></div></div></article>)}</div>}</section>
        <section className="mt-8 p-6 border rounded-lg shadow"><h2 className="mb-4 text-xl font-semibold">Mídias cadastradas</h2>{midias.length === 0 ? <p className="text-gray-600">Nenhuma mídia cadastrada.</p> : <div className="grid gap-4 md:grid-cols-2">{midias.map((midia) => <article key={midia.id} className="flex gap-4 border rounded p-4"><img src={midia.foto} alt={midia.nome} className="h-24 w-24 rounded object-cover" /><div className="min-w-0 flex-1"><h3 className="font-bold">{midia.nome}</h3><p className="text-sm text-gray-600">{midia.marca?.nome ?? "Marca não informada"} | {midia.tipo} | {midia.ano}</p><div className="mt-3 flex gap-2"><button type="button" onClick={() => editarMidia(midia)} className="px-3 py-1 text-sm text-white bg-[#1d0014] rounded">Alterar</button><button type="button" onClick={() => excluirMidia(midia.id)} className="px-3 py-1 text-sm text-red-700 border border-red-300 rounded">Excluir</button></div></div></article>)}</div>}</section>
    </main>
}