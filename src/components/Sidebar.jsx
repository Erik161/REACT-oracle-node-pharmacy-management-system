const Sidebar = ({ tables, selected, onSelect }) => {
  return (
    <aside className="hidden lg:flex w-72 flex-col border-r border-white/5 bg-slate-950/60 backdrop-blur">
      <div className="p-6 border-b border-white/5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Inventario</p>
        <h2 className="text-xl font-semibold text-white">Farmacia Oracle</h2>
        <p className="text-sm text-slate-400 mt-1">21 tablas listas para administrar.</p>
      </div>
      <nav className="flex-1 overflow-y-auto">
        {Object.entries(tables).map(([key, schema]) => (
          <button
            key={key}
            className={`w-full text-left px-6 py-4 border-b border-white/5 transition hover:bg-white/5 ${
              selected === key ? 'bg-white/5 text-white' : 'text-slate-400'
            }`}
            onClick={() => onSelect(key)}
          >
            <p className="text-sm font-semibold">{schema.label}</p>
            <p className="text-xs text-slate-400">{schema.description}</p>
          </button>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
