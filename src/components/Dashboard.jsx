import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  DollarSign, Users, ShoppingCart, AlertCircle, TrendingUp, TrendingDown,
  Clock, Package, Activity, Calendar, Filter, ChevronRight
} from 'lucide-react';
import TableView from './TableView';
import RecordForm from './RecordForm';

// Enhanced mock data
const salesData = [
  { name: 'Lun', ventas: 4000, proyectado: 3800 },
  { name: 'Mar', ventas: 3000, proyectado: 3200 },
  { name: 'Mié', ventas: 2000, proyectado: 2500 },
  { name: 'Jue', ventas: 2780, proyectado: 2600 },
  { name: 'Vie', ventas: 1890, proyectado: 2000 },
  { name: 'Sáb', ventas: 2390, proyectado: 2300 },
  { name: 'Dom', ventas: 3490, proyectado: 3300 },
];

const monthlyTrend = [
  { mes: 'Ene', ingresos: 45231 },
  { mes: 'Feb', ingresos: 52134 },
  { mes: 'Mar', ingresos: 48721 },
  { mes: 'Abr', ingresos: 61245 },
  { mes: 'May', ingresos: 58932 },
  { mes: 'Jun', ingresos: 67421 },
];

const categoryData = [
  { name: 'Medicamentos', value: 400, color: '#10b981' },
  { name: 'Cuidado Personal', value: 300, color: '#3b82f6' },
  { name: 'Equipo Médico', value: 300, color: '#f59e0b' },
  { name: 'Suplementos', value: 200, color: '#ef4444' },
];

const topProducts = [
  { name: 'Aspirina 500mg', sales: 145, trend: 'up', change: 12 },
  { name: 'Ibuprofeno 400mg', sales: 132, trend: 'up', change: 8 },
  { name: 'Paracetamol 1g', sales: 118, trend: 'down', change: -3 },
  { name: 'Amoxicilina 500mg', sales: 95, trend: 'up', change: 15 },
  { name: 'Vitamina C', sales: 87, trend: 'up', change: 5 },
];

const recentActivity = [
  { type: 'venta', desc: 'Venta completada #1234', time: 'Hace 5 minutos', icon: ShoppingCart, color: 'text-emerald-600 bg-emerald-50' },
  { type: 'pedido', desc: 'Nuevo pedido recibido', time: 'Hace 12 minutos', icon: Package, color: 'text-blue-600 bg-blue-50' },
  { type: 'alerta', desc: 'Stock bajo: Aspirina 500mg', time: 'Hace 25 minutos', icon: AlertCircle, color: 'text-orange-600 bg-orange-50' },
  { type: 'cliente', desc: 'Nuevo cliente registrado', time: 'Hace 1 hora', icon: Users, color: 'text-violet-600 bg-violet-50' },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const startValue = 0;
    const endValue = typeof end === 'string' ? parseFloat(end.replace(/[^0-9.-]+/g, '')) : end;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(startValue + (endValue - startValue) * easeOutQuart);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  const formattedCount = typeof end === 'string' && end.includes(',')
    ? count.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : Math.round(count).toLocaleString('es-GT');

  return <span>{prefix}{formattedCount}{suffix}</span>;
};

// Enhanced Stats Card with Animation
const StatsCard = ({ title, value, change, icon: Icon, color, gradient }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform ${isHovered ? 'scale-105' : 'scale-100'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-1">
            <AnimatedCounter end={value} prefix={value.includes('Q') ? 'Q ' : ''} />
          </h3>
        </div>
        <div className={`p-4 rounded-xl ${gradient} shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        {change >= 0 ? (
          <TrendingUp className="w-4 h-4 text-emerald-600 mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 text-rose-600 mr-1" />
        )}
        <span className={`font-semibold ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
        <span className="text-slate-400 ml-2">vs mes anterior</span>
      </div>
    </div>
  );
};

// Progress Ring Component
const ProgressRing = ({ progress, size = 120, strokeWidth = 8, color = '#10b981' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-2xl font-bold text-slate-800">{progress}%</span>
      </div>
    </div>
  );
};

const Dashboard = ({ activeTab }) => {
  const [view, setView] = useState('list');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [dateFilter, setDateFilter] = useState('week'); // 'day', 'week', 'month'
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    setView('list');
    setSelectedRecord(null);
  }, [activeTab]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (!activeTab) {
    return (
      <div className="space-y-6 animate-in fade-in duration-700">
        {/* Header with Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-50 to-white p-6 rounded-2xl border border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-7 h-7 text-indigo-600" />
              Panel de Control
            </h2>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Última actualización: {lastUpdate.toLocaleTimeString('es-GT')}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button
              onClick={() => setDateFilter('day')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${dateFilter === 'day'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setDateFilter('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${dateFilter === 'week'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              Semana
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${dateFilter === 'month'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              Mes
            </button>
          </div>
        </div>

        {/* Stats Cards with Animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Ventas Totales"
            value="45,231.89"
            change={12.5}
            icon={DollarSign}
            gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <StatsCard
            title="Pedidos Activos"
            value="23"
            change={-2.4}
            icon={ShoppingCart}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatsCard
            title="Nuevos Clientes"
            value="12"
            change={8.2}
            icon={Users}
            gradient="bg-gradient-to-br from-violet-500 to-violet-600"
          />
          <StatsCard
            title="Productos Bajo Stock"
            value="5"
            change={-20}
            icon={AlertCircle}
            gradient="bg-gradient-to-br from-rose-500 to-rose-600"
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Ventas Semanales - Bar Chart */}
          <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Ventas vs Proyección</h3>
              <span className="text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-full">Esta semana</span>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Bar dataKey="proyectado" fill="#e2e8f0" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="ventas" fill="url(#colorVentas)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Productos Top</h3>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className={`w-10 h-10 rounded-lg ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                      index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                          'bg-gradient-to-br from-slate-200 to-slate-300'
                    } flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">{product.sales} unidades</span>
                      <span className={`text-xs font-medium flex items-center gap-0.5 ${product.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                        {product.trend === 'up' ? '↑' : '↓'} {Math.abs(product.change)}%
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Tendencia Mensual */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Tendencia de Ingresos</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ingresos"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fill="url(#colorIngresos)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution with Progress Rings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Distribución por Categoría</h3>
            <div className="space-y-4">
              {categoryData.map((category, index) => {
                const total = categoryData.reduce((sum, item) => sum + item.value, 0);
                const percentage = Math.round((category.value / total) * 100);
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">{category.name}</span>
                        <span className="text-sm font-bold text-slate-800">{percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-2.5 rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: category.color
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Actividad Reciente
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex gap-3 group cursor-pointer">
                  <div className={`w-10 h-10 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{activity.desc}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleCreate = () => {
    setSelectedRecord(null);
    setView('form');
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setView('form');
  };

  const handleCancel = () => {
    setView('list');
    setSelectedRecord(null);
  };

  const handleSuccess = () => {
    setView('list');
    setSelectedRecord(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {view === 'list' ? (
        <TableView
          tableName={activeTab}
          onCreate={handleCreate}
          onEdit={handleEdit}
        />
      ) : (
        view === 'form' && (
          <RecordForm
            tableName={activeTab}
            record={selectedRecord}
            onCancel={handleCancel}
            onSuccess={handleSuccess}
          />
        )
      )}
    </div>
  );
};

export default Dashboard;
