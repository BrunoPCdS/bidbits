import { Link } from "react-router-dom"
import type { LeilaoType } from "../utils/LeilaoType"
import fim from "../assets/fim.png"

export function CardLeilao({ data }: { data: LeilaoType }) {
    const item = data.console ?? data.midia
    const nomeItem = item?.nome ?? data.nome
    const fotoItem = item?.foto ?? ""
    const tipoItem = data.console ? "Console" : data.midia ? "Mídia" : "Item"
    const encerrado = new Date() > new Date(data.dataFim)

    return (
        <div className="max-w-sm mb-8 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <img className="rounded-t-lg h-56 w-full object-cover" src={fotoItem} alt={nomeItem} />
            <div className="p-5">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {nomeItem}
                </h5>
                <p className="mb-3 font-extrabold text-gray-700 dark:text-gray-400">
                    Valor inicial: <span className="text-yellow-500">R$ {Number(data.valorInicial).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </p>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                    {tipoItem} • <span className="text-yellow-500">{data.console?.ano ?? data.midia?.ano ?? "Ano indisponível"}</span>
                </p>
                <p className="mb-4 line-clamp-3 text-sm text-gray-700 dark:text-gray-400">
                    {data.descricao}
                </p>
                {encerrado && (
                    <img className="rounded-t-lg h-30 w-35 object-cover" src={fim} alt="Leilão encerrado" />
                )}
                {!encerrado && (
                    <>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Início do leilão: <span className="text-green-400">{new Date(data.dataInicio).toLocaleDateString("pt-BR")}</span>
                        </p>
                        <p className="text-sm mb-4 text-gray-500  dark:text-gray-400">
                        Fim do leilão: <span className="text-yellow-500">{new Date(data.dataFim).toLocaleDateString("pt-BR")}</span>
                        </p>
                    </>
                )}
                <Link to={`/detalhes/${data.id}`} className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white ">
                    Ver Detalhes
                    <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                    </svg>
                </Link>
            </div>
        </div>
    )
}