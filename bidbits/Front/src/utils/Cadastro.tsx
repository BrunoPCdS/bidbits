import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"

const apiUrl = import.meta.env.VITE_API_URL

export default function Cadastro() {
    const navigate = useNavigate()
    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [confirmacaoSenha, setConfirmacaoSenha] = useState("")
    const [mensagem, setMensagem] = useState("")
    const [erro, setErro] = useState("")
    const [enviando, setEnviando] = useState(false)

    async function cadastrar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault()
        setErro("")
        setMensagem("")

        if (senha !== confirmacaoSenha) {
            setErro("As senhas não conferem")
            return
        }

        if (senha.length < 8) {
            setErro("A senha deve possuir no mínimo 8 caracteres")
            return
        }

        setEnviando(true)

        try {
            const resposta = await fetch(`${apiUrl}/clientes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, senha }),
            })
            const dados = await resposta.json()

            if (!resposta.ok) {
                setErro(dados.erro?.issues?.[0]?.message ?? "Não foi possível realizar o cadastro")
                return
            }

            setMensagem("Cadastro realizado com sucesso")
            setTimeout(() => navigate("/login"), 1000)
        } catch {
            setErro("Não foi possível conectar ao servidor")
        } finally {
            setEnviando(false)
        }
    }

    return (
        <form onSubmit={cadastrar} className="max-w-md mx-auto mt-20 mb-32 p-6 border rounded-lg shadow">
            <h1 className="mb-6 text-2xl font-bold">Cadastre-se</h1>
            <label className="block mb-2" htmlFor="nome">Nome</label>
            <input id="nome" type="text" required minLength={3} maxLength={50} value={nome} onChange={(evento) => setNome(evento.target.value)} className="w-full mb-4 p-2 border rounded" />
            <label className="block mb-2" htmlFor="email">E-mail</label>
            <input id="email" type="email" required value={email} onChange={(evento) => setEmail(evento.target.value)} className="w-full mb-4 p-2 border rounded" />
            <label className="block mb-2" htmlFor="senha">Senha</label>
            <input id="senha" type="password" required minLength={8} value={senha} onChange={(evento) => setSenha(evento.target.value)} className="w-full mb-4 p-2 border rounded" />
            <label className="block mb-2" htmlFor="confirmacao-senha">Confirme a senha</label>
            <input id="confirmacao-senha" type="password" required minLength={8} value={confirmacaoSenha} onChange={(evento) => setConfirmacaoSenha(evento.target.value)} className="w-full mb-4 p-2 border rounded" />
            {erro && <p className="mb-4 text-red-600">{erro}</p>}
            {mensagem && <p className="mb-4 text-green-600">{mensagem}</p>}
            <button type="submit" disabled={enviando} className="px-4 py-2 text-white bg-[#1d0014] rounded">
                {enviando ? "Cadastrando..." : "Cadastrar"}
            </button>
            <p className="mt-4 text-sm">Já possui uma conta? <Link to="/login" className="underline">Entrar</Link></p>
        </form>
    )
}
