import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import crudRoutes from './routes/crudRoutes.js'
import { initPool, closePool } from './db/oracleClient.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', async (_req, res) => {
  try {
    await initPool()
    res.json({ status: 'ok' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ status: 'error', message: error.message })
  }
})

app.use('/api', crudRoutes)

const port = process.env.SERVER_PORT || 4000

app.listen(port, async () => {
  try {
    await initPool()
    console.log(`Servidor Oracle listo en http://localhost:${port}`)
  } catch (error) {
    console.error('No se pudo iniciar el pool de Oracle', error)
  }
})

process.on('SIGINT', async () => {
  await closePool()
  process.exit(0)
})
