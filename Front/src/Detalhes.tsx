import type { LeilaoType } from "./utils/LeilaoType"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import carimbo from "./assets/Carimbo.png"
import { obterItemSessao } from "./utils/sessao"

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
  const agora = new Date()
  const inicio = leilao ? new Date(leilao.dataInicio) : null
  const fim = leilao ? new Date(leilao.dataFim) : null
  const encerrado = fim ? agora >= fim : false
  const naoIniciado = inicio ? agora < inicio : false
  const usuarioLogado = Boolean(obterItemSessao("token"))
  const [valorLance, setValorLance] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<"detalhes" | "ia">("detalhes")

  async function enviarLance(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const valor = Number(valorLance)
    const token = obterItemSessao("token")

    if (!leilao || !token || !valor || valor <= 0) {
      setMensagem("Informe um valor válido.")
      return
    }

    setEnviando(true)
    try {
      const resposta = await fetch(`${apiUrl}/lances`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ leilaoId: leilao.id, valor }),
      })
      const dados = await resposta.json()
      setMensagem(dados.mensagem ?? dados.erro ?? "Não foi possível realizar o lance")
      if (resposta.ok) setValorLance("")
    } catch {
      setMensagem("Não foi possível conectar ao servidor")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <section className="flex mt-20 mb-35 mx-auto flex-col items-center rounded-lg border border-slate-600 bg-slate-700 text-white shadow md:flex-row md:max-w-5xl">
        <img className="object-cover w-full rounded-t-lg h-96 md:h-2/4 md:w-2/4 md:rounded-none md:rounded-s-lg"
          src={fotoItem} alt="Foto do item do leilão" />
        <div className="flex flex-col justify-between p-4 leading-normal">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">
            {marcaItem} {nomeItem}
          </h5>
          <h5 className="mb-2 text-xl tracking-tight text-white">
            Valor inicial: <span className="text-yellow-400">R$ {Number(leilao?.valorInicial ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          </h5>
          <h5 className="mb-2 text-xl tracking-tight text-white">
            Ano: {leilao?.console?.ano ?? leilao?.midia?.ano ?? "-"}
          </h5>
          <div className="mb-4 border-b border-slate-500">
            <div className="flex gap-5" role="tablist" aria-label="Informações do leilão">
              <button
                type="button"
                role="tab"
                aria-selected={abaAtiva === "detalhes"}
                onClick={() => setAbaAtiva("detalhes")}
                className={`border-b-2 px-1 pb-2 text-sm font-semibold ${abaAtiva === "detalhes" ? "border-yellow-400 text-white" : "border-transparent text-slate-300"}`}
              >
                Detalhes
              </button>
              {leilao?.dadosIA && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={abaAtiva === "ia"}
                  onClick={() => setAbaAtiva("ia")}
                  className={`border-b-2 px-1 pb-2 text-sm font-semibold ${abaAtiva === "ia" ? "border-yellow-400 text-white" : "border-transparent text-slate-300"}`}
                >
                  Análise com IA
                </button>
              )}
            </div>
          </div>
          {abaAtiva === "detalhes" && (
            <p className="mb-3 font-normal text-slate-200">
              {leilao?.descricao}
            </p>
          )}
          {abaAtiva === "ia" && leilao?.dadosIA && (
            <section className="mb-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-gray-700" role="tabpanel">
              <p className="mb-3 font-semibold text-amber-900">Conteúdo gerado por inteligência artificial</p>
              <p className="mb-4 text-xs text-amber-800">
                As informações são estimativas e podem conter erros. Confirme os dados do item antes de tomar decisões no leilão.
              </p>
              <p className="mb-3">{leilao.dadosIA.descricao}</p>
              <dl className="mb-3 grid gap-2 sm:grid-cols-3">
                <div><dt className="font-semibold">Valor estimado</dt><dd>{leilao.dadosIA.valorEstimado}</dd></div>
                <div><dt className="font-semibold">Raridade</dt><dd>{leilao.dadosIA.raridade}</dd></div>
                <div><dt className="font-semibold">Unidades fabricadas</dt><dd>{leilao.dadosIA.unidadesFabricadas}</dd></div>
              </dl>
              <h6 className="mb-1 font-semibold">Pontos fortes</h6>
              <ul className="list-disc pl-5">
                {leilao.dadosIA.pontosFortes.map((ponto) => <li key={ponto}>{ponto}</li>)}
              </ul>
            </section>
          )}
          <p className="mb-3 font-normal text-slate-200">
            Início do leilão: <span className="font-semibold text-emerald-300">{new Date(leilao?.dataInicio ?? "").toLocaleDateString("pt-BR")}</span>
          </p>
          <p className="mb-3 font-normal text-slate-200">
            Fim do leilão: <span className="font-semibold text-red-300">{new Date(leilao?.dataFim ?? "").toLocaleDateString("pt-BR")}</span>
          </p>
          {encerrado && <img src={carimbo} alt="Leilão encerrado" className="w-40 mb-4" />}
          {!encerrado && naoIniciado && <p className="mb-4 text-yellow-600">O leilão começará em breve!</p>}
          {!encerrado && !naoIniciado && !usuarioLogado && (
            <p className="mb-4 text-red-300"><Link to="/login" className="font-semibold underline">Logue para dar um lance.</Link></p>
          )}
          {!encerrado && !naoIniciado && usuarioLogado && (
            <form onSubmit={enviarLance} className="flex flex-col gap-2">
              <label htmlFor="valor-lance" className="font-medium text-white">Seu lance</label>
              <input id="valor-lance" type="number" min="0.01" step="0.01" required value={valorLance} onChange={(evento) => setValorLance(evento.target.value)} className="rounded border border-slate-300 bg-white p-2 text-slate-900 placeholder:text-slate-500" />
              <button type="submit" disabled={enviando} className="w-fit px-4 py-2 text-white bg-[#1d0014] rounded">
                {enviando ? "Enviando..." : "Dar um lance"}
              </button>
              {mensagem && <p className={`text-sm ${mensagem.toLowerCase().includes("inválido") || mensagem.toLowerCase().includes("não") ? "text-red-300" : "text-emerald-300"}`}>{mensagem}</p>}
            </form>
          )}
          {videoItem && (
            <a
              href={videoItem}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center px-3 py-2 text-sm font-semibold text-yellow-300 underline decoration-yellow-300 underline-offset-2">
              Ver vídeo
            </a>
          )}
        </div>
      </section>
    </>
  )
}