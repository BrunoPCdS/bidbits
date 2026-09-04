import { Link } from "react-router-dom"
import { useEffect, useState } from "react"

export default function Titulo() {
    const [logado, setLogado] = useState(Boolean(localStorage.getItem("token")))

    useEffect(() => {
        function atualizarSessao() {
            setLogado(Boolean(localStorage.getItem("token")))
        }

        window.addEventListener("sessao-alterada", atualizarSessao)
        window.addEventListener("storage", atualizarSessao)

        return () => {
            window.removeEventListener("sessao-alterada", atualizarSessao)
            window.removeEventListener("storage", atualizarSessao)
        }
    }, [])

    function sair() {
        localStorage.removeItem("token")
        localStorage.removeItem("usuario")
        window.dispatchEvent(new Event("sessao-alterada"))
    }

    return (
        <nav className="border-[#1d0014] bg-[#1d0014] px-2 sm:px-4 py-2.5 rounded dark:bg-[#1d0014] dark:border-[#1d0014]">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <img src="./logo.gif" className="h-12" alt="Logo Herbie" />
                    <span className="self-center text-2xl font-semibold whitespace-nowrap text-white dark:text-white">
                        BidBits
                    </span>
                </Link>
                <button data-collapse-toggle="navbar-solid-bg" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-solid-bg" aria-expanded="false">
                    <span className="sr-only">Open main menu</span>
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15" />
                    </svg>
                </button>

                <div className="hidden w-full md:block md:w-auto" id="navbar-solid-bg">
                    <ul className="flex flex-col font-medium mt-4 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent dark:bg-gray-800 md:dark:bg-transparent dark:border-gray-700">
                        {!logado ? (
                            <>
                                <li>
                                    <Link to="/login" className="block py-2 px-3 md:p-0 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">
                                        Identifique-se
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/register" className="block py-2 px-3 md:p-0 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">
                                        Cadastre-se
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link to="/meus-lances" className="block py-2 px-3 md:p-0 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">
                                        Meus lances
                                    </Link>
                                </li>
                                <li>
                                    <button type="button" onClick={sair} className="block py-2 px-3 md:p-0 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">
                                        Sair
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    )
}