import fs from 'fs'
import express from 'express'
import cors from 'cors'
import oracledb from 'oracledb'
import 'dotenv/config'

const PORT = process.env.PORT ?? 3000

console.log('Verificando variables de entorno:')
console.log('ORACLE_USER:', process.env.ORACLE_USER ? 'DEFINIDO' : 'INDEFINIDO')
console.log('ORACLE_PASSWORD:', process.env.ORACLE_PASSWORD ? 'DEFINIDO' : 'INDEFINIDO')
console.log('ORACLE_CONNECT_STRING:', process.env.ORACLE_CONNECT_STRING ? 'DEFINIDO' : 'INDEFINIDO')

const app = express()
app.use(cors())
app.use(express.json())


async function runQuery(sql, binds = [], options = {}) {
  let connection
  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER || 'SYSTEM',
      password: process.env.ORACLE_PASSWORD || '1234',
      connectString: process.env.ORACLE_CONNECT_STRING || 'localhost:1521/xe',
    })

    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...options,
    })
    return result
  } catch (error) {
    console.error('Error ejecutando query:', error)
    throw error
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

const TABLE_CONFIG = {
  Departamento: {
    table: 'DEPARTAMENTO',
    pk: 'ID_DEPARTAMENTO',

    colMap: {
      'ID_DEPARTAMENTO': 'ID_DEPARTAMENTO',
      'NOMBRE_DEPARTAMENTO': 'NOMBRE_DEPARTAMENTO'
    }
  },
  Municipio: {
    table: 'MUNICIPIO',
    pk: 'ID_MUNICIPIO',
    colMap: {
      'ID_MUNICIPIO': 'ID_MUNICIPIO',
      'ID_DEPARTAMENTO': 'ID_DEPARTAMENTO',
      'NOMBRE_MUNICIPIO': 'NOMBRE_MUNICIPIO'
    }
  },
  Sucursal: {
    table: 'SUCURSAL',
    pk: 'ID_SUCURSAL',
    colMap: {
      'ID_SUCURSAL': 'ID_SUCURSAL',
      'ID_MUNICIPIO': 'ID_MUNICIPIO',
      'DIRECCION': 'DIRECCION',
      'TIPO': 'TIPO'
    }
  },
  Puesto: {
    table: 'PUESTO',
    pk: 'ID_PUESTO',
    colMap: {
      'ID_PUESTO': 'ID_PUESTO',
      'NOMBRE_PUESTO': 'NOMBRE_PUESTO',
      'SALARIO_BASE': 'SALARIO_BASE'
    }
  },
  Empleado: {
    table: 'EMPLEADO',
    pk: 'ID_EMPLEADO',
    colMap: {
      'ID_EMPLEADO': 'ID_EMPLEADO',
      'ID_SUCURSAL': 'ID_SUCURSAL',
      'ID_PUESTO': 'ID_PUESTO',
      'NOMBRE': 'NOMBRE',
      'APELLIDO': 'APELLIDO',
      'SALARIO': 'SALARIO'
    }
  },
  Proveedor: {
    table: 'FABRICANTES',
    pk: 'IDFAB',
    colMap: {
      'ID_PROVEEDOR': 'IDFAB',
      'NOMBRE_PROVEEDOR': 'NOMBRE',
      'DIRECCION': 'DIRECCION',
      'TELEFONO': 'TELEFONO'
    }
  },
  Tipo_Producto: {
    table: 'TIPO_PRODUCTO',
    pk: 'ID_TIPO_PRODUCTO',
    colMap: {
      'ID_TIPO_PRODUCTO': 'ID_TIPO_PRODUCTO',
      'CATEGORIA': 'CATEGORIA'
    }
  },
  Producto: {
    table: 'PRODUCTOS',
    pk: 'IDPRODUCTO',
    colMap: {
      'ID_PRODUCTO': 'IDPRODUCTO',
      'NOMBRE_PRODUCTO': 'DESCRIPCION',
      'PRECIO_VENTA': 'PRECIO',
      'ID_PROVEEDOR': 'IDFAB',
      'EXISTENCIAS': 'EXISTENCIAS',
      'EXISTENCIAS': 'EXISTENCIAS'
    }
  },
  Inventario_Sucursal: {
    table: 'INVENTARIO_SUCURSAL',
    pk: ['ID_SUCURSAL', 'ID_PRODUCTO'],
    colMap: {
      'ID_SUCURSAL': 'ID_SUCURSAL',
      'ID_PRODUCTO': 'ID_PRODUCTO',
      'CANTIDAD': 'CANTIDAD'
    }
  },
  Cliente: {
    table: 'CLIENTE',
    pk: 'ID_CLIENTE',
    colMap: {
      'ID_CLIENTE': 'ID_CLIENTE',
      'NOMBRE_CLIENTE': 'NOMBRE_CLIENTE',
      'APELLIDO': 'APELLIDO',
      'TELEFONO': 'TELEFONO'
    }
  },
  Tipo_Pedido: {
    table: 'TIPO_PEDIDO',
    pk: 'ID_TIPO_PEDIDO',
    colMap: {
      'ID_TIPO_PEDIDO': 'ID_TIPO_PEDIDO',
      'NOMBRE': 'NOMBRE'
    }
  },
  Pedido: {
    table: 'PEDIDO',
    pk: 'ID_PEDIDO',
    colMap: {
      'ID_PEDIDO': 'ID_PEDIDO',
      'ID_CLIENTE': 'ID_CLIENTE',
      'ID_TIPO_PEDIDO': 'ID_TIPO_PEDIDO',
      'FECHA_PEDIDO': 'FECHA_PEDIDO',
      'TOTAL': 'TOTAL'
    }
  },
  Detalle_Pedido: {
    table: 'DETALLE_PEDIDO',
    pk: ['ID_PEDIDO', 'ID_PRODUCTO'],
    colMap: {
      'ID_PEDIDO': 'ID_PEDIDO',
      'ID_PRODUCTO': 'ID_PRODUCTO',
      'CANTIDAD': 'CANTIDAD',
      'PRECIO_UNITARIO': 'PRECIO_UNITARIO'
    }
  },
  Entrega: {
    table: 'ENTREGA',
    pk: 'ID_ENTREGA',
    colMap: {
      'ID_ENTREGA': 'ID_ENTREGA',
      'ID_PEDIDO': 'ID_PEDIDO',
      'ID_SUCURSAL': 'ID_SUCURSAL',
      'FECHA_ESTIMADA': 'FECHA_ESTIMADA'
    }
  },
  Forma_Pago: {
    table: 'FORMA_PAGO',
    pk: 'ID_FORMAPAGO',
    colMap: {
      'ID_FORMAPAGO': 'ID_FORMAPAGO',
      'NOMBRE_METODO': 'NOMBRE_METODO'
    }
  },
  Venta: {
    table: 'VENTA',
    pk: 'ID_VENTA',
    colMap: {
      'ID_VENTA': 'ID_VENTA',
      'ID_SUCURSAL': 'ID_SUCURSAL',
      'ID_CLIENTE': 'ID_CLIENTE',
      'ID_FORMAPAGO': 'ID_FORMAPAGO',
      'ID_EMPLEADO': 'ID_EMPLEADO',
      'FECHA_VENTA': 'FECHA_VENTA',
      'TOTAL': 'TOTAL'
    }
  },
  Detalle_Venta: {
    table: 'DETALLE_VENTA',
    pk: ['ID_VENTA', 'ID_PRODUCTO'],
    colMap: {
      'ID_VENTA': 'ID_VENTA',
      'ID_PRODUCTO': 'ID_PRODUCTO',
      'CANTIDAD_VENTA': 'CANTIDAD_VENTA',
      'PRECIO_UNITARIO': 'PRECIO_UNITARIO'
    }
  },
  Traslado: {
    table: 'TRASLADO',
    pk: 'ID_TRASLADO',
    colMap: {
      'ID_TRASLADO': 'ID_TRASLADO',
      'ID_SUCURSAL_ORIGEN': 'ID_SUCURSAL_ORIGEN',
      'ID_SUCURSAL_DESTINO': 'ID_SUCURSAL_DESTINO',
      'FECHA_TRASLADO': 'FECHA_TRASLADO'
    }
  },
  Detalle_Traslado: {
    table: 'DETALLE_TRASLADO',
    pk: ['ID_TRASLADO', 'ID_PRODUCTO'],
    colMap: {
      'ID_TRASLADO': 'ID_TRASLADO',
      'ID_PRODUCTO': 'ID_PRODUCTO',
      'CANTIDAD': 'CANTIDAD'
    }
  },
  Flujo_Caja: {
    table: 'FLUJO_CAJA',
    pk: 'ID_MOVIMIENTO',
    colMap: {
      'ID_MOVIMIENTO': 'ID_MOVIMIENTO',
      'ID_SUCURSAL': 'ID_SUCURSAL',
      'TIPO': 'TIPO',
      'MONTO': 'MONTO',
      'FECHA': 'FECHA'
    }
  },
  Tipo_Activo: {
    table: 'TIPO_ACTIVO',
    pk: 'ID_TIPOACTIVO',
    colMap: {
      'ID_TIPOACTIVO': 'ID_TIPOACTIVO',
      'NOMBRE_TIPO': 'NOMBRE_TIPO'
    }
  },
  Activo_Fijo: {
    table: 'ACTIVO_FIJO',
    pk: 'ID_ACTIVO',
    colMap: {
      'ID_ACTIVO': 'ID_ACTIVO',
      'ID_TIPOACTIVO': 'ID_TIPOACTIVO',
      'ID_SUCURSAL': 'ID_SUCURSAL',
      'DESCRIPCION': 'DESCRIPCION',
      'VALOR_COMPRA': 'VALOR_COMPRA'
    }
  }
}

app.get('/api/:table', async (req, res) => {
  const tableName = req.params.table
  const config = TABLE_CONFIG[tableName]

  if (!config) {
    return res.status(404).json({ message: `Tabla ${tableName} no configurada` })
  }

  try {
    let selectClause = '*'
    if (config.colMap) {
      const columns = []
      for (const [front, back] of Object.entries(config.colMap)) {
        columns.push(`${back} AS "${front}"`)
      }
      selectClause = columns.join(', ')
    }

    const query = `SELECT ${selectClause} FROM ${config.table}`
    const { rows } = await runQuery(query)
    res.json(rows)
  } catch (error) {
    console.error(`Error consultando ${tableName}`, error)
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/:table', async (req, res) => {
  const tableName = req.params.table
  const config = TABLE_CONFIG[tableName]
  if (!config) return res.status(404).json({ message: 'Tabla no encontrada' })

  const payload = req.body
  console.log(`[POST] Intentando crear en ${tableName}:`, payload)

  const dbCols = []
  const bindVars = {}

  for (const [key, value] of Object.entries(payload)) {
    const dbCol = config.colMap ? config.colMap[key] : key
    const isValidCol = config.colMap ? (key in config.colMap) : true

    if (isValidCol && dbCol) {
      dbCols.push(dbCol)
      bindVars[dbCol] = value
    }
  }

  if (dbCols.length === 0) {
    console.warn(`[POST] Sin columnas válidas para ${tableName}`)
    return res.status(400).json({ message: 'Sin datos válidos' })
  }

  const sql = `INSERT INTO ${config.table} (${dbCols.join(', ')}) VALUES (${dbCols.map(c => `:${c}`).join(', ')})`
  console.log(`[POST] SQL: ${sql}`)
  console.log(`[POST] Binds:`, bindVars)

  try {
    await runQuery(sql, bindVars)
    console.log(`[POST] Éxito en ${tableName}`)
    res.status(201).json(payload)
  } catch (error) {
    console.error(`[POST] Error en ${tableName}:`, error)
    res.status(500).json({ message: error.message })
  }
})


app.put('/api/:table/:id', async (req, res) => {
  const tableName = req.params.table
  let id = req.params.id
  const config = TABLE_CONFIG[tableName]
  if (!config) return res.status(404).json({ message: 'Tabla no encontrada' })

  if (typeof id === 'string') id = id.trim()

  const payload = req.body
  console.log(`[PUT] Intentando actualizar ${tableName} ID=${id}:`, payload)

  const updates = []
  const bindVars = { pk: id }

  if (!Array.isArray(config.pk) && !isNaN(id) && id !== '') {
    bindVars.pk = Number(id)
  }

  for (const [key, value] of Object.entries(payload)) {
    const dbCol = config.colMap ? config.colMap[key] : key
    const isValidCol = config.colMap ? (key in config.colMap) : true

    if (isValidCol && dbCol && dbCol !== config.pk) {
      updates.push(`${dbCol} = :${dbCol}`)
      bindVars[dbCol] = value
    }
  }

  if (updates.length === 0) {
    console.warn(`[PUT] Sin campos para actualizar en ${tableName}`)
    return res.json(payload)
  }

  let whereClause = `${config.pk} = :pk`

  // Handle composite keys
  if (Array.isArray(config.pk)) {
    if (id.includes('=')) {
      const parts = decodeURIComponent(id).split('|')
      const whereParts = []
      parts.forEach((part, idx) => {
        const [k, v] = part.split('=')
        const paramName = `pk${idx}`
        whereParts.push(`${k} = :${paramName}`)
        bindVars[paramName] = !isNaN(v) ? Number(v) : v
      })
      whereClause = whereParts.join(' AND ')
      delete bindVars.pk
    }
  }

  const sql = `UPDATE ${config.table} SET ${updates.join(', ')} WHERE ${whereClause}`
  console.log(`[PUT] SQL: ${sql}`)
  console.log(`[PUT] Binds:`, bindVars)

  try {
    await runQuery(sql, bindVars)
    console.log(`[PUT] Éxito en ${tableName}`)
    res.json(req.body)
  } catch (error) {
    console.error(`[PUT] Error en ${tableName}:`, error)
    res.status(500).json({ message: error.message })
  }
})


app.delete('/api/:table/:id', async (req, res) => {
  const tableName = req.params.table
  let id = req.params.id
  const config = TABLE_CONFIG[tableName]
  if (!config) return res.status(404).json({ message: 'Tabla no encontrada' })

  if (typeof id === 'string') id = id.trim()

  console.log(`[DELETE] Intentando eliminar ${tableName} ID=${id}`)

  let whereClause = `${config.pk} = :pk`
  const bindVars = { pk: id }


  if (!Array.isArray(config.pk) && !isNaN(id) && id !== '') {
    bindVars.pk = Number(id)
  }

  if (Array.isArray(config.pk) && id.includes('=')) {
    const parts = decodeURIComponent(id).split('|')
    const whereParts = []
    parts.forEach((part, idx) => {
      const [k, v] = part.split('=')
      const paramName = `pk${idx}`
      whereParts.push(`${k} = :${paramName}`)
      bindVars[paramName] = !isNaN(v) ? Number(v) : v
    })
    whereClause = whereParts.join(' AND ')
    delete bindVars.pk
  }

  const sql = `DELETE FROM ${config.table} WHERE ${whereClause}`
  console.log(`[DELETE] SQL: ${sql}`)
  console.log(`[DELETE] Binds:`, bindVars)

  try {
    await runQuery(sql, bindVars)
    console.log(`[DELETE] Éxito en ${tableName}`)
    res.status(204).send()
  } catch (error) {
    console.error(`[DELETE] Error en ${tableName}:`, error)
    res.status(500).json({ message: error.message })
  }
})


app.get('/api/debug/schema/:table', async (req, res) => {
  const tableName = req.params.table
  try {
    const result = await runQuery(
      `SELECT column_name, data_type FROM user_tab_columns WHERE table_name = :t`,
      [tableName.toUpperCase()]
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`)
})
