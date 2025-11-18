import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchTable, createRecord, updateRecord, deleteRecord } from '../services/apiClient'
import { mockData } from '../data/mockData'

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
  return `${schema.primaryKey}=${record[schema.primaryKey]}`
}

const useTableData = (tableName, schema) => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const applySort = useCallback(
    (items) => (schema?.defaultSort ? buildSort(items, schema.defaultSort) : items),
    [schema]
  )

  const getMock = useCallback(() => mockData[tableName] ?? [], [tableName])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchTable(tableName)
      setRecords(applySort(data))
      setError(null)
    } catch (apiError) {
      console.warn('Fallo la API, usando datos de ejemplo', apiError)
      setRecords(applySort(getMock()))
      setError('Mostrando datos de ejemplo. Revisa la conexión con Oracle.')
    } finally {
      setLoading(false)
    }
  }, [tableName, applySort, getMock])

  useEffect(() => {
    refresh()
  }, [refresh])

  const upsertLocalRecord = useCallback(
    (payload, matcher, updater) => {
      setRecords((prev) => {
        const next = prev.map((record) =>
          matcher(record) ? { ...record, ...updater(record) } : record
        )
        return applySort(next)
      })
    },
    [applySort]
  )

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
        console.warn('No se pudo crear en Oracle, guardando en memoria', apiError)
        const optimistic = { ...prepared, _optimistic: true, _localId: Date.now() }
        setRecords((prev) => applySort([...prev, optimistic]))
        setError('Registro creado solo en memoria. Sincroniza cuando la API esté lista.')
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
        upsertLocalRecord(
          record,
          (current) => encodeKey(schema, current) === id,
          () => record
        )
        setError(null)
        return { success: true }
      } catch (apiError) {
        console.warn('No se pudo actualizar en Oracle, actualizando solo UI', apiError)
        upsertLocalRecord(
          record,
          (current) => encodeKey(schema, current) === id,
          () => record
        )
        setError('Actualización local. Verifica la API para guardar los cambios.')
        return { success: false, message: apiError.message }
      }
    },
    [schema, tableName, upsertLocalRecord]
  )

  const remove = useCallback(
    async (record) => {
      const id = encodeKey(schema, record)
      try {
        await deleteRecord(tableName, encodeURIComponent(id))
      } catch (apiError) {
        console.warn('No se pudo borrar en Oracle, removiendo solo en UI', apiError)
        setError('Eliminación local. Confirma con la base de datos.')
      }
      setRecords((prev) => prev.filter((item) => encodeKey(schema, item) !== id))
    },
    [schema, tableName]
  )

  const connectionState = useMemo(
    () => ({
      status: error ? 'demo' : 'online',
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
