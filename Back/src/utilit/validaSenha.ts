export function validarSenha(senha: string): string[] {
    const erros: string[] = []

    if (senha.length < 8) {
        erros.push("A senha deve conter no minimo 8 caracteres")
    }

    if (!/[a-z]/.test(senha)) {
        erros.push("A senha deve conter letras minusculas")
    }

    if (!/[A-Z]/.test(senha)) {
        erros.push("A senha deve conter letras maiusculas")
    }

    if (!/[0-9]/.test(senha)) {
        erros.push("A senha deve conter numeros")
    }

    if (!/[^A-Za-z0-9]/.test(senha)) {
        erros.push("A senha deve conter simbolos")
    }

    return erros
}