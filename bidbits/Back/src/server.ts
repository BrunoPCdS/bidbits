import express from 'express'
import cors from 'cors'

import routesMarcas from './routes/marcas'
import routesConsoles from './routes/consoles'
import routesMidias from './routes/midias'
import routesLeiloes from './routes/leilao'
import routesClientes from './routes/cliente'
import routesLances from './routes/lance'

const app = express()
const port = 3000

app.use(cors());
app.use(express.json());

app.use("/marcas", routesMarcas)
app.use("/consoles", routesConsoles)
app.use("/midias", routesMidias)
app.use("/leiloes", routesLeiloes)
app.use("/clientes", routesClientes)
app.use("/lances", routesLances)

app.get('/', (req, res) => {
  res.send('API: Leilao de Games')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})