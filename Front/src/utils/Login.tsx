import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { salvarSessao } from "./sessao"

const apiUrl = import.meta.env.VITE_API_URL

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [manterConectado, setManterConectado] = useState(true)
    const [erro, setErro] = useState("")
    const [enviando, setEnviando] = useState(false)

    async function entrar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault()
        setErro("")
        setEnviando(true)

        try {
            const resposta = await fetch(`${apiUrl}/clientes/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha }),
            })
            const dados = await resposta.json()

            if (!resposta.ok) {
                setErro(dados.erro ?? "Não foi possível entrar")
                return
            }

            salvarSessao(dados.token, dados.usuario, manterConectado)
            localStorage.removeItem("perfil")
            window.dispatchEvent(new Event("sessao-alterada"))
            navigate("/")
        } catch {
            setErro("Não foi possível conectar ao servidor")
        } finally {
            setEnviando(false)
        }
    }

    return (
        <form onSubmit={entrar} className="max-w-md mx-auto mt-20 mb-32 p-6 border rounded-lg shadow">
            <h1 className="mb-6 text-2xl font-bold">Identifique-se</h1>
            <label className="block mb-2" htmlFor="email">E-mail</label>
            <input id="email" type="email" required value={email} onChange={(evento) => setEmail(evento.target.value)} className="w-full mb-4 p-2 border rounded" />
            <label className="block mb-2" htmlFor="senha">Senha</label>
            <input id="senha" type="password" required value={senha} onChange={(evento) => setSenha(evento.target.value)} className="w-full mb-4 p-2 border rounded" />
            <label className="mb-4 flex items-center gap-2 text-sm" htmlFor="manter-conectado">
                <input id="manter-conectado" type="checkbox" checked={manterConectado} onChange={(evento) => setManterConectado(evento.target.checked)} />
                Manter conectado
            </label>
            {erro && <p className="mb-4 text-red-600">{erro}</p>}
            <button type="submit" disabled={enviando} className="px-4 py-2 text-white bg-[#1d0014] rounded">
                {enviando ? "Entrando..." : "Entrar"}
            </button>
            <p className="mt-4 text-sm">É administrador? <Link to="/admin" className="underline">Acessar painel administrativo</Link></p>
        </form>
    )
}