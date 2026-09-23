type UsuarioSessao = {
    id: string | number
    nome: string
    email: string
}

function armazenamentoDaSessao(): Storage | null {
    if (localStorage.getItem("token")) return localStorage
    if (sessionStorage.getItem("token")) return sessionStorage
    return null
}

export function obterItemSessao(chave: string) {
    return armazenamentoDaSessao()?.getItem(chave) ?? null
}

export function salvarSessao(token: string, usuario: UsuarioSessao, manterConectado: boolean) {
    limparSessao()
    const armazenamento = manterConectado ? localStorage : sessionStorage
    armazenamento.setItem("token", token)
    armazenamento.setItem("usuario", JSON.stringify(usuario))
    armazenamento.setItem("clienteId", String(usuario.id))
}

export function limparSessao() {
    for (const armazenamento of [localStorage, sessionStorage]) {
        armazenamento.removeItem("token")
        armazenamento.removeItem("usuario")
        armazenamento.removeItem("clienteId")
    }
}