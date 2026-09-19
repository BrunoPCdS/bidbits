import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { LeilaoType } from "../utils/LeilaoType";

const apiUrl = import.meta.env.VITE_API_URL

type Inputs = {
    termo: string
}

type InputPesquisaProps = {
    setLeiloes: React.Dispatch<React.SetStateAction<LeilaoType[]>>
}

export function InputPesquisa({ setLeiloes }: InputPesquisaProps) {
    const { register, handleSubmit} = useForm<Inputs>()

    async function enviaPesquisa(data: Inputs) {
    const termo = data.termo.trim().toLowerCase()

    if (!termo) {
        const response = await fetch(`${apiUrl}/leiloes`)
        const dados = await response.json()
        setLeiloes(dados)
        return
    }

    if (termo.length < 2) {
        toast.error("Informe, no mínimo, 2 caracteres")
        return
    }

            const response = await fetch(`${apiUrl}/leiloes`)
            const dados = await response.json()

    const filtrados = dados.filter((item: LeilaoType) => {
        const nome = item.nome?.toLowerCase() ?? ""
        const consoleNome = item.console?.nome?.toLowerCase() ?? ""
        const midiaNome = item.midia?.nome?.toLowerCase() ?? ""
        const marcaConsole = item.console?.marca?.nome?.toLowerCase() ?? ""
        const marcaMidia = item.midia?.marca?.nome?.toLowerCase() ?? ""

        return nome.includes(termo) ||
            consoleNome.includes(termo) ||
            midiaNome.includes(termo) ||
            marcaConsole.includes(termo) ||
            marcaMidia.includes(termo)
    })

    setLeiloes(filtrados)
}

    return (
        <div className="flex mx-auto max-w-5xl mt-3">
            <form className="flex-1" onSubmit={handleSubmit(enviaPesquisa)}>
                <label htmlFor="termo" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                    </div>
                    <input type="search" id="termo" className="block w-full p-4 ps-10 pe-32 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Informe nome, console, midia ou marca"
                        {...register('termo')} />
                    <button type="submit" className="text-white absolute end-2.5 bottom-2.5 z-10 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2">
                        Pesquisar
                    </button>
                </div>
            </form>
        </div>
    )
}