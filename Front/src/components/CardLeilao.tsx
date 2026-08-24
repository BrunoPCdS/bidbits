import { Link } from "react-router-dom"
import type { LeilaoType } from "../utils/LeilaoType"

export function CardLeilao({ data }: { data: LeilaoType }) {
    const item = data.console ?? data.midia
    const nomeItem = item?.nome ?? data.nome
    const fotoItem = item?.foto ?? ""
    const marcaItem = item?.marca?.nome ?? "Marca"
    const tipoItem = data.console ? "Console" : data.midia ? "Mídia" : "Item"

    return (
        <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <img className="rounded-t-lg h-56 w-full object-cover" src={fotoItem} alt={nomeItem} />
            <div className="p-5">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {marcaItem} {nomeItem}
                </h5>
                <p className="mb-3 font-extrabold text-gray-700 dark:text-gray-400">
                    Valor inicial: R$ {Number(data.valorInicial).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                    {tipoItem} • {data.console?.ano ?? data.midia?.ano ?? "Ano indisponível"}
                </p>
                <p className="mb-4 line-clamp-3 text-sm text-gray-700 dark:text-gray-400">
                    {data.descricao}
                </p>
                <Link to={`/detalhes/${data.id}`} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    Ver Detalhes
                    <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                    </svg>
                </Link>
            </div>
        </div>
    )
}