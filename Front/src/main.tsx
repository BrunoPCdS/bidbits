import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.tsx'
import Login from './utils/Login.tsx'
import Cadastro from './utils/Cadastro.tsx'
import Detalhes from './Detalhes.tsx'
import MeusLances from './utils/MeusLances.tsx'
import AdminLogin from './utils/AdminLogin.tsx'
import AdminPainel from './utils/AdminPainel.tsx'

import Layout from './Layout.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const rotas = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Cadastro /> },
      { path: 'detalhes/:leilaoId', element: <Detalhes /> },
      { path: 'meus-lances', element: <MeusLances /> },
      { path: 'admin', element: <AdminLogin /> },
      { path: 'admin/painel', element: <AdminPainel /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={rotas} />
  </StrictMode>,
)