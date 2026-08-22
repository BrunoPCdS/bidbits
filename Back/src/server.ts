import express from 'express'
import cors from 'cors'

import routesMarcas from './routes/marcas'
import routesConsoles from './routes/consoles'

const app = express()
const port = 3000

app.use(express.json())
app.use(cors())

app.use("/marcas", routesMarcas)
app.use("/consoles", routesConsoles)

app.get('/', (req, res) => {
  res.send('API: Leilao de Games')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})