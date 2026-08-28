import Titulo from './components/Titulo.tsx'
import { Outlet } from 'react-router-dom'

import { Toaster } from 'sonner'
import Rodape from './components/rodape.tsx'

export default function Layout() {
  return (
    <>
      <Titulo />
      <Outlet />
      <Rodape />
      <Toaster richColors position="top-center" />
    </>
  )
}
