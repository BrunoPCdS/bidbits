import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import type { MarcaType } from "./MarcaType"
import type { ConsoleType, MidiaType } from "./LeilaoType"

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
    const [marcas, setMarcas] = useState<MarcaType[]>([])
    const [consoles, setConsoles] = useState<ConsoleType[]>([])
    const [midias, setMidias] = useState<MidiaType[]>([])
    const [mensagem, setMensagem] = useState("")
    const [erro, setErro] = useState("")
    const [consoleForm, setConsoleForm] = useState(itemInicial)
    const [midiaForm, setMidiaForm] = useState(itemInicial)
    const [leilao, setLeilao] = useState({ nome: "", descricao: "", valorInicial: "", dataInicio: "", dataFim: "", consoleId: "", midiaId: "" })

    useEffect(() => {
        if (localStorage.getItem("perfil") !== "admin") {
            navigate("/admin")
            return
        }
        Promise.all([
            fetch(`${apiUrl}/marcas`).then((resposta) => resposta.json()),
            fetch(`${apiUrl}/consoles`).then((resposta) => resposta.json()),
            fetch(`${apiUrl}/midias`).then((resposta) => resposta.json()),
        ]).then(([marcasDados, consolesDados, midiasDados]) => {
            setMarcas(marcasDados)
            setConsoles(consolesDados)
            setMidias(midiasDados)
        }).catch(() => setErro("Não foi possível carregar os itens cadastrados"))
    }, [navigate])

    async function atualizarItens() {
        const [consolesDados, midiasDados] = await Promise.all([
            fetch(`${apiUrl}/consoles`).then((resposta) => resposta.json()),
            fetch(`${apiUrl}/midias`).then((resposta) => resposta.json()),
        ])
        setConsoles(consolesDados)
        setMidias(midiasDados)
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
        if (!resposta.ok) throw new Error(dados.erro?.issues?.[0]?.message ?? dados.erro ?? "Não foi possível salvar")
        setMensagem(sucesso)
    }

    async function cadastrarConsole(evento: FormEvent) {
        evento.preventDefault()
        try {
            await enviar("consoles", { ...consoleForm, marcaid: Number(consoleForm.marcaid), ano: Number(consoleForm.ano) }, "Console cadastrado")
            setConsoleForm(itemInicial)
            await atualizarItens()
        } catch (error) { setErro(error instanceof Error ? error.message : "Falha ao cadastrar console") }
    }

    async function cadastrarMidia(evento: FormEvent) {
        evento.preventDefault()
        try {
            await enviar("midias", { ...midiaForm, descricaoDetalhada: midiaForm.descricao, marcaid: Number(midiaForm.marcaid), ano: Number(midiaForm.ano) }, "Mídia cadastrada")
            setMidiaForm(itemInicial)
            await atualizarItens()
        } catch (error) { setErro(error instanceof Error ? error.message : "Falha ao cadastrar mídia") }
    }

    async function cadastrarLeilao(evento: FormEvent) {
        evento.preventDefault()
        try {
            await enviar("leiloes", { ...leilao, valorInicial: Number(leilao.valorInicial), consoleId: leilao.consoleId ? Number(leilao.consoleId) : null, midiaId: leilao.midiaId ? Number(leilao.midiaId) : null, gerarDescricaoComIA: false }, "Leilão cadastrado")
            setLeilao({ nome: "", descricao: "", valorInicial: "", dataInicio: "", dataFim: "", consoleId: "", midiaId: "" })
        } catch (error) { setErro(error instanceof Error ? error.message : "Falha ao cadastrar leilão") }
    }

    function camposItem(formulario: ItemForm, setFormulario: (valor: ItemForm) => void, midia = false) {
        return <>
            <input required placeholder="Nome" value={formulario.nome} onChange={(e) => setFormulario({ ...formulario, nome: e.target.value })} className="p-2 border rounded" />
            <select required value={formulario.marcaid} onChange={(e) => setFormulario({ ...formulario, marcaid: e.target.value })} className="p-2 border rounded"><option value="">Marca</option>{marcas.map((marca) => <option key={marca.id} value={marca.id}>{marca.nome}</option>)}</select>
            <input required type="number" placeholder="Ano" value={formulario.ano} onChange={(e) => setFormulario({ ...formulario, ano: e.target.value })} className="p-2 border rounded" />
            <input required placeholder="URL da foto" value={formulario.foto} onChange={(e) => setFormulario({ ...formulario, foto: e.target.value })} className="p-2 border rounded" />
            <input required placeholder="URL do vídeo" value={formulario.video} onChange={(e) => setFormulario({ ...formulario, video: e.target.value })} className="p-2 border rounded" />
            <select value={formulario.empresa} onChange={(e) => setFormulario({ ...formulario, empresa: e.target.value })} className="p-2 border rounded"><option>Nintendo</option><option>Sony</option><option>Microsoft</option><option>Xbox</option><option>Atari</option><option>Sega</option><option>Tectoy</option></select>
            {midia && <select value={formulario.tipo} onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value })} className="p-2 border rounded"><option>Fita</option><option>DVD</option><option>CD</option></select>}
            <textarea required={!midia} placeholder={midia ? "Descrição detalhada (opcional)" : "Descrição"} value={formulario.descricao} onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })} className="p-2 border rounded md:col-span-2" />
        </>
    }

    return <main className="max-w-6xl mx-auto px-4 py-10"><h1 className="text-3xl font-bold mb-2">Painel administrativo</h1><p className="mb-8 text-gray-600">Cadastre o item primeiro e depois associe-o a um leilão.</p>
        {(erro || mensagem) && <p className={erro ? "mb-6 text-red-600" : "mb-6 text-green-600"}>{erro || mensagem}</p>}
        <div className="grid gap-8 lg:grid-cols-2">
            <form onSubmit={cadastrarConsole} className="p-6 border rounded-lg shadow"><h2 className="mb-4 text-xl font-semibold">Novo console</h2><div className="grid gap-3">{camposItem(consoleForm, setConsoleForm)}<button className="px-4 py-2 text-white bg-[#1d0014] rounded">Cadastrar console</button></div></form>
            <form onSubmit={cadastrarMidia} className="p-6 border rounded-lg shadow"><h2 className="mb-4 text-xl font-semibold">Nova mídia</h2><div className="grid gap-3">{camposItem(midiaForm, setMidiaForm, true)}<button className="px-4 py-2 text-white bg-[#1d0014] rounded">Cadastrar mídia</button></div></form>
            <form onSubmit={cadastrarLeilao} className="p-6 border rounded-lg shadow lg:col-span-2"><h2 className="mb-4 text-xl font-semibold">Novo leilão</h2><div className="grid gap-3 md:grid-cols-2"><input required placeholder="Nome do leilão" value={leilao.nome} onChange={(e) => setLeilao({ ...leilao, nome: e.target.value })} className="p-2 border rounded" /><input required type="number" step="0.01" placeholder="Valor inicial" value={leilao.valorInicial} onChange={(e) => setLeilao({ ...leilao, valorInicial: e.target.value })} className="p-2 border rounded" /><textarea required placeholder="Descrição" value={leilao.descricao} onChange={(e) => setLeilao({ ...leilao, descricao: e.target.value })} className="p-2 border rounded md:col-span-2" /><input required type="datetime-local" value={leilao.dataInicio} onChange={(e) => setLeilao({ ...leilao, dataInicio: e.target.value })} className="p-2 border rounded" /><input required type="datetime-local" value={leilao.dataFim} onChange={(e) => setLeilao({ ...leilao, dataFim: e.target.value })} className="p-2 border rounded" /><select value={leilao.consoleId} onChange={(e) => setLeilao({ ...leilao, consoleId: e.target.value, midiaId: "" })} className="p-2 border rounded"><option value="">Selecionar console (opcional)</option>{consoles.map((item) => <option key={item.id} value={item.id}>#{item.id} - {item.nome}{item.marca ? ` (${item.marca.nome})` : ""}</option>)}</select><select value={leilao.midiaId} onChange={(e) => setLeilao({ ...leilao, midiaId: e.target.value, consoleId: "" })} className="p-2 border rounded"><option value="">Selecionar mídia (opcional)</option>{midias.map((item) => <option key={item.id} value={item.id}>#{item.id} - {item.nome}{item.marca ? ` (${item.marca.nome})` : ""}</option>)}</select><button className="px-4 py-2 text-white bg-[#1d0014] rounded md:col-span-2">Cadastrar leilão</button></div></form>
        </div>
    </main>
}