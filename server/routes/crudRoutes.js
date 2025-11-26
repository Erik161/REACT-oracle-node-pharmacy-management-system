import { Router } from 'express'
import oracledb from 'oracledb'
import { tableDefinitions } from '../../shared/tableDefinitions.js'
import { getConnection } from '../db/oracleClient.js'

const router = Router()

const sanitizeTable = (name) => (tableDefinitions[name] ? name : null)

const buildWhereClause = (schema) => {
  const keys = Array.isArray(schema.primaryKey) ? schema.primaryKey : [schema.primaryKey]
  return keys.map((key) => `${key} = :${key}`).join(' AND ')
}

const parseCompositeKey = (schema, rawKey) => {
  const decoded = decodeURIComponent(rawKey)
  if (!Array.isArray(schema.primaryKey)) {
    const [, value] = decoded.split('=')
    return { [schema.primaryKey]: value }
  }
  return decoded.split('|').reduce((acc, pair) => {
    const [field, value] = pair.split('=')
    acc[field] = value
    return acc
  }, {})
}

const pickFields = (schema, body) => {
  const payload = {}
  schema.fields.forEach((field) => {
    if (body[field.name] !== undefined) {
      payload[field.name] = body[field.name]
    }
  })
  return payload
}

const execute = async (callback) => {
  const connection = await getConnection()
  try {
    return await callback(connection)
  } finally {
    await connection.close()
  }
}

router.get('/:table', async (req, res) => {
  const tableName = sanitizeTable(req.params.table)
  if (!tableName) {
    return res.status(404).json({ message: 'Tabla no permitida' })
  }
  const schema = tableDefinitions[tableName]
  try {
    const rows = await execute(async (connection) => {
      const query = `SELECT * FROM ${tableName}`
      const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT })
      return result.rows ?? []
    })
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al consultar Oracle' })
  }
})

router.post('/:table', async (req, res) => {
  const tableName = sanitizeTable(req.params.table)
  if (!tableName) {
    return res.status(404).json({ message: 'Tabla no permitida' })
  }
  const schema = tableDefinitions[tableName]
  const payload = pickFields(schema, req.body)
  const columns = Object.keys(payload)
  if (columns.length === 0) {
    return res.status(400).json({ message: 'Payload vacío' })
  }
  const values = columns.map((column) => `:${column}`).join(', ')
  const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values})`
  try {
    await execute(async (connection) => {
      await connection.execute(sql, payload, { autoCommit: true })
    })
    res.status(201).json(payload)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al insertar en Oracle' })
  }
})

router.put('/:table/:id', async (req, res) => {
  const tableName = sanitizeTable(req.params.table)
  if (!tableName) {
    return res.status(404).json({ message: 'Tabla no permitida' })
  }
  const schema = tableDefinitions[tableName]
  const keyParams = parseCompositeKey(schema, req.params.id)
  const payload = { ...pickFields(schema, req.body), ...keyParams }
  const columns = schema.fields
    .map((field) => field.name)
    .filter((fieldName) => !(Array.isArray(schema.primaryKey) ? schema.primaryKey.includes(fieldName) : schema.primaryKey === fieldName))
    .map((fieldName) => `${fieldName} = :${fieldName}`)
    .join(', ')
  const sql = `UPDATE ${tableName} SET ${columns} WHERE ${buildWhereClause(schema)}`
  try {
    await execute(async (connection) => {
      await connection.execute(sql, payload, { autoCommit: true })
    })
    res.json(payload)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al actualizar en Oracle' })
  }
})

router.delete('/:table/:id', async (req, res) => {
  const tableName = sanitizeTable(req.params.table)
  if (!tableName) {
    return res.status(404).json({ message: 'Tabla no permitida' })
  }
  const schema = tableDefinitions[tableName]
  const keyParams = parseCompositeKey(schema, req.params.id)
  const sql = `DELETE FROM ${tableName} WHERE ${buildWhereClause(schema)}`
  try {
    await execute(async (connection) => {
      await connection.execute(sql, keyParams, { autoCommit: true })
    })
    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al eliminar en Oracle' })
  }
})

export default router
