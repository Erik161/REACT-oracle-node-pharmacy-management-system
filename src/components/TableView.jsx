import React, { useState, useEffect, useMemo } from 'react';
import { Edit, Trash2, RefreshCw, AlertCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import { tableDefinitions } from '../../shared/tableDefinitions';
import useTableData from '../hooks/useTableData';
import { fetchTable } from '../services/apiClient';

const formatValue = (value, type) => {
  if (value === null || value === undefined || value === '') return '—';
  if (type === 'decimal') {
    return `Q ${Number(value).toFixed(2)}`;
  }
  if (type === 'date') {
    const date = new Date(value);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  return value;
};

const Badge = ({ children }) => {
  const colors = {
    'Efectivo': 'bg-emerald-100 text-emerald-700',
    'Tarjeta': 'bg-indigo-100 text-indigo-700',
    'Tarjeta de Crédito': 'bg-indigo-100 text-indigo-700',
    'Tarjeta de Débito': 'bg-sky-100 text-sky-700',
    'Entrada': 'bg-emerald-100 text-emerald-700',
    'Salida': 'bg-rose-100 text-rose-700',
    'default': 'bg-slate-100 text-slate-700'
  };

  const colorClass = colors[children] || colors['default'];

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {children}
    </span>
  );
};

const TableView = ({ tableName, onCreate, onEdit }) => {
  const schema = tableDefinitions[tableName];
  const { records, loading, error, remove, refresh } = useTableData(tableName, schema);
  const [references, setReferences] = useState({});

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Check if table has any actions
  const hasActions = schema.allowEdit !== false || schema.allowDelete !== false;

  // Fetch referenced data for foreign keys
  useEffect(() => {
    const loadReferences = async () => {
      const refs = {};
      const fieldsWithRefs = schema.fields.filter(f => f.references);

      for (const field of fieldsWithRefs) {
        try {
          const data = await fetchTable(field.references);
          const refSchema = tableDefinitions[field.references];
          refs[field.name] = data.reduce((acc, item) => {
            acc[item[refSchema.primaryKey]] = item[field.displayField];
            return acc;
          }, {});
        } catch (err) {
          console.error(`Error loading reference for ${field.name}:`, err);
        }
      }
      setReferences(refs);
    };

    loadReferences();
  }, [tableName, schema]);

  const handleDelete = async (record) => {
    const result = await Swal.fire({
      title: '¿Eliminar este registro?',
      html: `<p style="color: #64748b; margin-top: 8px;">Esta acción no se puede deshacer</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: '<span style="display: flex; align-items: center; gap: 6px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> Sí, eliminar</span>',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-xl font-bold text-slate-800',
        confirmButton: 'rounded-lg px-6 py-2.5 font-medium shadow-lg hover:shadow-xl transition-all',
        cancelButton: 'rounded-lg px-6 py-2.5 font-medium'
      },
      buttonsStyling: true,
      backdrop: `rgba(0,0,0,0.4)`,
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster'
      }
    });

    if (result.isConfirmed) {
      remove(record);

      Swal.fire({
        title: '¡Eliminado!',
        text: 'El registro ha sido eliminado correctamente',
        icon: 'success',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'Entendido',
        timer: 2000,
        timerProgressBar: true,
        customClass: {
          popup: 'rounded-2xl shadow-2xl',
          title: 'text-xl font-bold text-slate-800',
          confirmButton: 'rounded-lg px-6 py-2.5 font-medium'
        },
        showClass: {
          popup: 'animate__animated animate__zoomIn animate__faster'
        }
      });
    }
  };

  // Filtering and Pagination Logic
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();

      return schema.fields.some(field => {
        let value = record[field.name];

        // Resolve reference value for search
        if (field.references && references[field.name]) {
          value = references[field.name][value];
        }

        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchLower);
      });
    });
  }, [records, searchTerm, schema, references]);

  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rowsPerPage]);

  const colSpan = schema.fields.length + (hasActions ? 1 : 0);

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header & Toolbar */}
      <div className="p-6 border-b border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {schema.label}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{schema.description}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={refresh}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              title="Refrescar"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={onCreate}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <span className="text-lg leading-none">+</span> Nuevo {schema.label.slice(0, -1)}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Mostrar</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="border border-slate-200 rounded-md px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>registros</span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="m-6 p-4 bg-rose-50 text-rose-700 rounded-lg border border-rose-100 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              {schema.fields.map((field) => (
                <th
                  key={field.name}
                  className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap"
                >
                  {field.label}
                </th>
              ))}
              {hasActions && (
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right sticky right-0 bg-slate-50">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <p>Cargando datos...</p>
                  </div>
                </td>
              </tr>
            ) : paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="px-6 py-12 text-center text-slate-400">
                  {searchTerm ? 'No se encontraron resultados' : 'No hay registros disponibles'}
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors group">
                  {schema.fields.map((field) => {
                    let displayValue = record[field.name];

                    // Resolve reference
                    if (field.references && references[field.name]) {
                      const refValue = references[field.name][displayValue];
                      if (refValue) displayValue = refValue;
                    }

                    // Render Badge
                    if (field.badge) {
                      return (
                        <td key={field.name} className="px-6 py-4 whitespace-nowrap">
                          <Badge>{displayValue || '—'}</Badge>
                        </td>
                      );
                    }

                    return (
                      <td key={field.name} className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {formatValue(displayValue, field.type)}
                      </td>
                    );
                  })}
                  {hasActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white group-hover:bg-slate-50 border-l border-transparent group-hover:border-slate-100">
                      <div className="flex justify-end gap-2">
                        {schema.allowEdit !== false && (
                          <button
                            onClick={() => onEdit(record)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors border border-indigo-200 hover:border-indigo-300"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {schema.allowDelete !== false && (
                          <button
                            onClick={() => handleDelete(record)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors border border-rose-200 hover:border-rose-300"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="text-sm text-slate-500">
          Mostrando <span className="font-medium">{Math.min((currentPage - 1) * rowsPerPage + 1, filteredRecords.length)}</span> a <span className="font-medium">{Math.min(currentPage * rowsPerPage, filteredRecords.length)}</span> de <span className="font-medium">{filteredRecords.length}</span> registros
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded text-sm font-medium transition-colors ${currentPage === pageNum
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableView;
