import type { CarroType } from "./utils/CarroType"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"

const apiUrl = import.meta.env.VITE_API_URL

export default function Detalhes() {
  const params = useParams()

  const [carro, setCarro] = useState<CarroType>()

  useEffect(() => {
    async function buscaDados() {
      const response = await fetch(`${apiUrl}/carros/${params.carroId}`)
      const dados = await response.json()
      // console.log(dados)
      setCarro(dados)
    }
    buscaDados()
  }, [])

  return (
    <>
      <section className="flex mt-6 mx-auto flex-col items-center bg-white border border-gray-200 rounded-lg shadow md:flex-row md:max-w-5xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
        <img className="object-cover w-full rounded-t-lg h-96 md:h-2/4 md:w-2/4 md:rounded-none md:rounded-s-lg"
          src={carro?.foto} alt="Foto do Carro" />
        <div className="flex flex-col justify-between p-4 leading-normal">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {carro?.marca.nome} {carro?.modelo}
          </h5>
          <h5 className="mb-2 text-xl tracking-tight text-gray-900 dark:text-white">
            Ano: {carro?.ano} - {carro?.km.toLocaleString("pt-br")} km
          </h5>
          <h5 className="mb-2 text-xl tracking-tight text-gray-900 dark:text-white">
            Preço R$: {Number(carro?.preco)
              .toLocaleString("pt-br", { minimumFractionDigits: 2 })}
          </h5>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
            {carro?.acessorios}
          </p>
        </div>
      </section>
    </>
  )
}