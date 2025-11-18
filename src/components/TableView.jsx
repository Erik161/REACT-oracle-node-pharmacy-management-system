const formatValue = (value, type) => {
  if (value === null || value === undefined || value === '') return '—'
  if (type === 'decimal') {
    return Number(value).toFixed(2)
  }
  if (type === 'date') {
    return new Date(value).toLocaleDateString('es-GT')
  }
  return value
}

const TableView = ({ schema, records, loading, error, onEdit, onDelete, onRefresh }) => {
  return (
    <div className="bg-slate-900/80 border border-white/5 rounded-3xl p-4 xl:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{schema.label}</h3>
          <p className="text-sm text-slate-400">{schema.description}</p>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 text-sm font-semibold rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          Refrescar
        </button>
      </div>
      {error && <p className="text-amber-400 text-sm mb-2">{error}</p>}
      <div className="overflow-auto flex-1">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.2em] text-slate-400">
            <tr>
              {schema.fields.map((field) => (
                <th key={field.name} className="px-3 py-2 whitespace-nowrap">
                  {field.label}
                </th>
              ))}
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-white">
            {loading ? (
              <tr>
                <td colSpan={schema.fields.length + 1} className="px-3 py-6 text-center text-slate-400">
                  Cargando registros...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={schema.fields.length + 1} className="px-3 py-6 text-center text-slate-400">
                  No hay registros. Usa el formulario para crear el primero.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={JSON.stringify(record)} className="hover:bg-white/5">
                  {schema.fields.map((field) => (
                    <td key={field.name} className="px-3 py-2 whitespace-nowrap">
                      {formatValue(record[field.name], field.type)}
                    </td>
                  ))}
                  <td className="px-3 py-2 whitespace-nowrap space-x-2">
                    <button
                      className="px-3 py-1 text-xs rounded-full border border-white/30 hover:bg-white/10"
                      onClick={() => onEdit(record)}
                    >
                      Editar
                    </button>
                    <button
                      className="px-3 py-1 text-xs rounded-full border border-rose-400 text-rose-300 hover:bg-rose-500/10"
                      onClick={() => onDelete(record)}
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TableView
