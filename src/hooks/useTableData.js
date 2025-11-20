import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchTable, createRecord, updateRecord, deleteRecord } from '../services/apiClient'

const normalizeValue = (value, type) => {
  if (value === null || value === undefined) return ''
  if (type === 'date') {
    return String(value).slice(0, 10)
  }
  return value
}

const buildSort = (records, sortConfig) => {
  if (!sortConfig?.field) return records
  const sorted = [...records].sort((a, b) => {
    const first = a[sortConfig.field]
    const second = b[sortConfig.field]
    if (first === second) return 0
    if (first === undefined) return 1
    if (second === undefined) return -1
    if (first > second) return sortConfig.direction === 'desc' ? -1 : 1
    return sortConfig.direction === 'desc' ? 1 : -1
  })
  return sorted
}

const encodeKey = (schema, record) => {
  if (Array.isArray(schema.primaryKey)) {
    return schema.primaryKey.map((key) => `${key}=${record[key]}`).join('|')
  }
  return record[schema.primaryKey]
}

const useTableData = (tableName, schema) => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const applySort = useCallback(
    (items) => (schema?.defaultSort ? buildSort(items, schema.defaultSort) : items),
    [schema]
  )

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchTable(tableName)
      setRecords(applySort(data))
      setError(null)
    } catch (apiError) {
      console.error('Fallo la API', apiError)
      setError(`Error de conexión: ${apiError.message}`)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [tableName, applySort])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(
    async (payload) => {
      const prepared = schema.fields.reduce((acc, field) => {
        acc[field.name] = normalizeValue(payload[field.name], field.type)
        return acc
      }, {})
      try {
        const created = await createRecord(tableName, prepared)
        setRecords((prev) => applySort([...prev, created]))
        setError(null)
        return { success: true }
      } catch (apiError) {
        console.error('Error creando registro:', apiError)
        setError(`Error al crear: ${apiError.message}`)
        return { success: false, message: apiError.message }
      }
    },
    [applySort, schema, tableName]
  )

  const update = useCallback(
    async (record) => {
      const id = encodeKey(schema, record)
      try {
        await updateRecord(tableName, encodeURIComponent(id), record)
        setRecords((prev) => {
          const next = prev.map((item) =>
            encodeKey(schema, item) === id ? { ...item, ...record } : item
          )
          return applySort(next)
        })
        setError(null)
        return { success: true }
      } catch (apiError) {
        console.error('Error actualizando registro:', apiError)
        setError(`Error al actualizar: ${apiError.message}`)
        return { success: false, message: apiError.message }
      }
    },
    [schema, tableName, applySort]
  )

  const remove = useCallback(
    async (record) => {
      const id = encodeKey(schema, record)
      try {
        await deleteRecord(tableName, encodeURIComponent(id))
        setRecords((prev) => prev.filter((item) => encodeKey(schema, item) !== id))
        setError(null)
      } catch (apiError) {
        console.error('Error eliminando registro:', apiError)
        setError(`Error al eliminar: ${apiError.message}`)
      }
    },
    [schema, tableName]
  )

  const connectionState = useMemo(
    () => ({
      status: error ? 'error' : 'online',
      message: error ?? 'Conectado a Oracle',
    }),
    [error]
  )

  return {
    records,
    loading,
    error,
    connectionState,
    create,
    update,
    remove,
    refresh,
  }
}

export default useTableData
