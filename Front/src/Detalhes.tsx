import type { LeilaoType } from "./utils/LeilaoType"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"

const apiUrl = import.meta.env.VITE_API_URL

export default function Detalhes() {
  const params = useParams()

  const [leilao, setLeilao] = useState<LeilaoType>()

  useEffect(() => {
    async function buscaDados() {
      const response = await fetch(`${apiUrl}/leiloes/${params.leilaoId}`)
      const dados = await response.json()
      setLeilao(dados)
    }

    if (params.leilaoId) {
      buscaDados()
    }
  }, [params.leilaoId])

  const item = leilao?.console ?? leilao?.midia
  const nomeItem = item?.nome ?? leilao?.nome
  const marcaItem = item?.marca?.nome ?? "Marca"
  const fotoItem = item?.foto ?? ""
  const videoItem = item?.video ?? ""

  return (
    <>
      <section className="flex mt-6 mx-auto flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-5xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
        <img className="object-cover w-full rounded-t-lg h-96 md:h-2/4 md:w-2/4 md:rounded-none md:rounded-s-lg"
          src={fotoItem} alt="Foto do item do leilão" />
        <div className="flex flex-col justify-between p-4 leading-normal">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {marcaItem} {nomeItem}
          </h5>
          <h5 className="mb-2 text-xl tracking-tight text-gray-900 dark:text-white">
            Valor inicial: R$ {Number(leilao?.valorInicial ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </h5>
          <h5 className="mb-2 text-xl tracking-tight text-gray-900 dark:text-white">
            Ano: {leilao?.console?.ano ?? leilao?.midia?.ano ?? "-"}
          </h5>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
            {leilao?.descricao}
          </p>
          {videoItem && (
            <a
              href={videoItem}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
            >
              Ver vídeo
            </a>
          )}
        </div>
      </section>
    </>
  )
}