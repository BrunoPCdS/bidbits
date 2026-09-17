import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"

const apiUrl = import.meta.env.VITE_API_URL

export default function AdminLogin() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [erro, setErro] = useState("")
    const [enviando, setEnviando] = useState(false)

    async function entrar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault()
        setErro("")
        setEnviando(true)

        try {
            const resposta = await fetch(`${apiUrl}/administradores/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha }),
            })
            const dados = await resposta.json()

            if (!resposta.ok) {
                setErro(dados.erro ?? "Não foi possível entrar como administrador")
                return
            }

            localStorage.setItem("token", dados.token)
            localStorage.setItem("usuario", JSON.stringify(dados.admin))
            localStorage.setItem("perfil", "admin")
            window.dispatchEvent(new Event("sessao-alterada"))
            navigate("/admin/painel")
        } catch {
            setErro("Não foi possível conectar ao servidor")
        } finally {
            setEnviando(false)
        }
    }

    return (
        <form onSubmit={entrar} className="max-w-md mx-auto mt-20 mb-32 p-6 border rounded-lg shadow">
            <h1 className="mb-2 text-2xl font-bold">Acesso administrativo</h1>
            <p className="mb-6 text-gray-600">Entre para cadastrar itens e criar leilões.</p>
            <label className="block mb-2" htmlFor="admin-email">E-mail</label>
            <input id="admin-email" type="email" required value={email} onChange={(evento) => setEmail(evento.target.value)} className="w-full mb-4 p-2 border rounded" />
            <label className="block mb-2" htmlFor="admin-senha">Senha</label>
            <input id="admin-senha" type="password" required value={senha} onChange={(evento) => setSenha(evento.target.value)} className="w-full mb-4 p-2 border rounded" />
            {erro && <p className="mb-4 text-red-600">{erro}</p>}
            <button type="submit" disabled={enviando} className="px-4 py-2 text-white bg-[#1d0014] rounded">
                {enviando ? "Entrando..." : "Entrar como admin"}
            </button>
            <p className="mt-4 text-sm"><Link to="/login" className="underline">Voltar para login de cliente</Link></p>
        </form>
    )
}