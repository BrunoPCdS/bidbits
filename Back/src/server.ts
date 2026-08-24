import express from 'express'
import cors from 'cors'

import routesMarcas from './routes/marcas'
import routesConsoles from './routes/consoles'
import routesMidias from './routes/midias'
import routesLeiloes from './routes/leilao'

const app = express()
const port = 3000

app.use(express.json())
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
  ],
  credentials: true,
}))

app.use("/marcas", routesMarcas)
app.use("/consoles", routesConsoles)
app.use("/midias", routesMidias)
app.use("/leiloes", routesLeiloes)

app.get('/', (req, res) => {
  res.send('API: Leilao de Games')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})