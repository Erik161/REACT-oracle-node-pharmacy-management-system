import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  Briefcase,
  Building2,
  Truck,
  Wallet,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut
} from 'lucide-react'
import { useState } from 'react'

const MENU_GROUPS = [
  {
    title: 'Principal',
    items: [
      { key: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'Operaciones',
    items: [
      { key: 'Venta', label: 'Ventas', icon: ShoppingCart },
      { key: 'Pedido', label: 'Pedidos', icon: FileText },
      { key: 'Entrega', label: 'Entregas', icon: Truck },
    ]
  },
  {
    title: 'Inventario & Catálogo',
    items: [
      { key: 'Producto', label: 'Productos', icon: Package },
      { key: 'Inventario_Sucursal', label: 'Inventario', icon: Building2 },
      { key: 'Traslado', label: 'Traslados', icon: Truck },
      { key: 'Proveedor', label: 'Proveedores', icon: Truck },
    ]
  },
  {
    title: 'Administración',
    items: [
      { key: 'Cliente', label: 'Clientes', icon: Users },
      { key: 'Empleado', label: 'Empleados', icon: Briefcase },
      { key: 'Sucursal', label: 'Sucursales', icon: Building2 },
      { key: 'Flujo_Caja', label: 'Finanzas', icon: Wallet },
      { key: 'Activo_Fijo', label: 'Activos Fijos', icon: Settings },
    ]
  },
  {
    title: 'Configuración',
    items: [
      { key: 'Tipo_Producto', label: 'Tipos de Producto', icon: Settings },
      { key: 'Tipo_Pedido', label: 'Tipos de Pedido', icon: Settings },
      { key: 'Forma_Pago', label: 'Formas de Pago', icon: Wallet },
      { key: 'Puesto', label: 'Puestos', icon: Briefcase },
      { key: 'Departamento', label: 'Departamentos', icon: Building2 },
      { key: 'Municipio', label: 'Municipios', icon: Building2 },
      { key: 'Tipo_Activo', label: 'Tipos de Activo', icon: Settings },
      { key: 'Detalle_Venta', label: 'Detalle Ventas', icon: FileText },
      { key: 'Detalle_Pedido', label: 'Detalle Pedidos', icon: FileText },
      { key: 'Detalle_Traslado', label: 'Detalle Traslados', icon: Truck },
    ]
  }
]

const Sidebar = ({ tables, selected, onSelect }) => {
  const [expandedGroups, setExpandedGroups] = useState({})

  const toggleGroup = (title) => {
    setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <aside className="w-64 bg-white text-slate-600 flex flex-col h-screen sticky top-0 overflow-y-auto border-r border-slate-200 shadow-lg z-20">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
          FS
        </div>
        <div>
          <h1 className="font-bold text-slate-800 tracking-tight">FarmaSystem</h1>
          <p className="text-xs text-slate-500 font-medium">Sistema de Gestión</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-6">
        {MENU_GROUPS.map((group) => (
          <div key={group.title}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isSelected = selected === item.key
                const Icon = item.icon

                return (
                  <li key={item.key}>
                    <button
                      onClick={() => onSelect(item.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isSelected
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                      <Icon size={18} className={isSelected ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
                      {item.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs text-white font-bold">
            EH
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">Erik Hernández</p>
            <p className="text-xs text-slate-500 truncate">Administrador</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
