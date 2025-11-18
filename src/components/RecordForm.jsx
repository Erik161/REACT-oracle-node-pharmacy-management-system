import { useEffect, useMemo, useState } from 'react'

const getInputType = (type) => {
  if (type === 'decimal') return 'number'
  if (type === 'date') return 'date'
  if (type === 'number') return 'number'
  return 'text'
}

const RecordForm = ({ schema, onCreate, onUpdate, editingRecord, onCancelEdit }) => {
  const initialState = useMemo(
    () =>
      schema.fields.reduce((acc, field) => {
        acc[field.name] = ''
        return acc
      }, {}),
    [schema.fields]
  )

  const [formState, setFormState] = useState(initialState)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    if (editingRecord) {
      setFormState(editingRecord)
    } else {
      setFormState(initialState)
    }
  }, [editingRecord, initialState])

  const handleChange = (event, field) => {
    const value = field.type === 'number' || field.type === 'decimal' ? Number(event.target.value) : event.target.value
    setFormState((prev) => ({ ...prev, [field.name]: event.target.value === '' ? '' : value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (editingRecord) {
      const response = await onUpdate(formState)
      setStatus(response)
    } else {
      const response = await onCreate(formState)
      setStatus(response)
      if (response.success) {
        setFormState(initialState)
      }
    }
  }

  const buttonLabel = editingRecord ? 'Actualizar registro' : 'Crear registro'

  return (
    <div className="bg-slate-900/80 border border-white/5 rounded-3xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        {editingRecord ? 'Editar' : 'Nuevo registro'} - {schema.label}
      </h3>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {schema.fields.map((field) => (
          <label key={field.name} className="flex flex-col gap-1 text-sm text-white/80">
            {field.label}
            <input
              type={getInputType(field.type)}
              value={formState[field.name] ?? ''}
              onChange={(event) => handleChange(event, field)}
              required={field.required}
              step={field.type === 'decimal' ? '0.01' : undefined}
              className="bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </label>
        ))}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="flex-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-200 font-semibold py-2 hover:bg-emerald-500/40"
          >
            {buttonLabel}
          </button>
          {editingRecord && (
            <button
              type="button"
              onClick={() => {
                onCancelEdit()
                setFormState(initialState)
              }}
              className="flex-1 rounded-full bg-white/5 border border-white/10 text-white font-semibold py-2 hover:bg-white/10"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
      {status && (
        <p className={`mt-4 text-sm ${status.success ? 'text-emerald-300' : 'text-amber-300'}`}>
          {status.success ? 'Cambios sincronizados.' : status.message || 'Acción realizada solo en el dashboard.'}
        </p>
      )}
    </div>
  )
}

export default RecordForm
