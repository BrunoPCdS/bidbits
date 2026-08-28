import { CardLeilao } from "./components/CardLeilao";
import { InputPesquisa } from "./components/InputPesquisa";
import type { LeilaoType } from "./utils/LeilaoType";
import { useEffect, useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL

export default function App() {
  const [leiloes, setLeiloes] = useState<LeilaoType[]>([])

  useEffect(() => {
    async function buscaDados() {
      const response = await fetch(`${apiUrl}/leiloes`)
      const dados = await response.json()
      setLeiloes(dados)
    }

    buscaDados()
  }, [])

  const listaLeiloes = leiloes.map((leilao) => (
    <CardLeilao data={leilao} key={leilao.id} />
  ))

  return (
    <>
      <InputPesquisa setLeiloes={setLeiloes} />
      <div className="max-w-7xl mx-auto">
        <h1 className="mb-6 mt-5 text-center text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-black">
          Leilões da semana
          
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {listaLeiloes}
        </div>
      </div>
    </>
  );
}
