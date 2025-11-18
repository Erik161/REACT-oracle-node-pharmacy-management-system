import fs from 'fs'
import express from 'express'
import cors from 'cors'
import oracledb from 'oracledb'
import 'dotenv/config'

const PORT = process.env.PORT ?? 3000

const app = express()
app.use(cors())

// Helper to execute queries with automatic connection handling
async function runQuery(sql, binds = [], options = {}) {
  let connection
  try {
    // console.log('Intentando conectar con:', {
    //   user: process.env.ORACLE_USER,
    //   connectString: process.env.ORACLE_CONNECT_STRING
    // })
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
    })

    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      ...options,
    })
    return result
  } finally {
    if (connection) {
      try {
        await connection.close()
      } catch (closeError) {
        console.error('No se pudo cerrar la conexión', closeError)
      }
    }
  }
}

app.get('/api/productos', async (_req, res) => {
  try {
    const { rows } = await runQuery(
      `SELECT IDPRODUCTO AS ID_PRODUCTO, DESCRIPCION AS NOMBRE, PRECIO FROM PRODUCTOS ORDER BY DESCRIPCION`
    )
    res.json(rows)
  } catch (error) {
    console.error('Error consultando productos', error)
    try {
      fs.appendFileSync('error.log', `${new Date().toISOString()} - ${error.message}\n${error.stack}\n\n`)
    } catch (logError) {
      console.error('Error escribiendo log', logError)
    }
    res.status(500).json({ message: 'Error consultando Oracle' })
  }
})

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`)
})
