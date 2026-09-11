export function gerarCodigo(): string {
    const numero = Math.floor(100000 + Math.random() * 900000)

    return numero.toString()
}