const StatCard = ({ title, value, helper }) => (
  <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-5 flex flex-col gap-1">
    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{title}</p>
    <p className="text-3xl font-semibold text-white">{value}</p>
    {helper && <p className="text-xs text-slate-400">{helper}</p>}
  </div>
)

const StatsCards = ({ schema, records, loading }) => {
  const total = loading ? '...' : records.length
  const numericFields = schema.fields.filter((field) => field.type === 'number' || field.type === 'decimal')
  const lastUpdate = loading
    ? '...' 
    : records.length
      ? new Date().toLocaleString('es-GT', { hour12: false })
      : 'Sin registros'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard title="Registros" value={total} helper={`Tabla ${schema.label}`} />
      <StatCard title="Campos" value={schema.fields.length} helper="Columnas configuradas" />
      <StatCard title="Campos numéricos" value={numericFields.length} helper="Para KPIs financieros" />
      <StatCard title="Última actualización" value={lastUpdate} helper="Se actualiza al refrescar" />
    </div>
  )
}

export default StatsCards
