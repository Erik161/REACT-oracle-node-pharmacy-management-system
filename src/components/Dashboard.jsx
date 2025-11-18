import { useMemo, useState } from 'react'
import Sidebar from './Sidebar'
import StatsCards from './StatsCards'
import TableView from './TableView'
import RecordForm from './RecordForm'
import { tableDefinitions } from '../../shared/tableDefinitions'
import useTableData from '../hooks/useTableData'

const Dashboard = () => {
  const tableKeys = Object.keys(tableDefinitions)
  const [selectedTable, setSelectedTable] = useState(tableKeys[0])
  const schema = useMemo(() => tableDefinitions[selectedTable], [selectedTable])
  const [editingRecord, setEditingRecord] = useState(null)

  const { records, loading, error, connectionState, create, update, remove, refresh } = useTableData(
    selectedTable,
    schema
  )

  const handleCreate = async (payload) => {
    const response = await create(payload)
    if (response.success) {
      setEditingRecord(null)
    }
    return response
  }

  const handleUpdate = async (payload) => {
    const response = await update(payload)
    if (response.success) {
      setEditingRecord(null)
    }
    return response
  }

  const handleDelete = (record) => {
    const confirmation = confirm('¿Seguro que deseas eliminar este registro?')
    if (confirmation) {
      remove(record)
    }
  }

  const activeAccent = schema.accent ?? 'from-emerald-500/20 to-emerald-500/5'

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar tables={tableDefinitions} selected={selectedTable} onSelect={(key) => {
        setSelectedTable(key)
        setEditingRecord(null)
      }} />
      <main className="flex-1 flex flex-col">
        <header className="border-b border-white/5 p-6 bg-slate-950/40 backdrop-blur flex flex-col gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Panel maestro</p>
            <h1 className="text-3xl font-semibold">Sistema integral de farmacia</h1>
            <p className="text-slate-400 max-w-3xl">
              Administra la información corporativa de departamentos, inventarios, ventas y logística conectada a Oracle.
            </p>
            <div className="mt-4 lg:hidden">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400 block mb-2">Tabla activa</label>
              <select
                value={selectedTable}
                onChange={(event) => {
                  setSelectedTable(event.target.value)
                  setEditingRecord(null)
                }}
                className="w-full rounded-2xl bg-slate-900 border border-white/10 px-3 py-2 text-white"
              >
                {tableKeys.map((key) => (
                  <option key={key} value={key}>
                    {tableDefinitions[key].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <span
              className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${activeAccent}`}
            >
              Tabla activa: {schema.label}
            </span>
            <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-slate-100">
              Estado: {connectionState.status === 'online' ? 'Conectado a Oracle' : 'Modo demo' }
            </span>
          </div>
        </header>
        <section className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/60">
          <StatsCards schema={schema} records={records} loading={loading} />
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <TableView
                schema={schema}
                records={records}
                loading={loading}
                error={error}
                onEdit={setEditingRecord}
                onDelete={handleDelete}
                onRefresh={refresh}
              />
            </div>
            <div>
              <RecordForm
                schema={schema}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
                editingRecord={editingRecord}
                onCancelEdit={() => setEditingRecord(null)}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Dashboard
