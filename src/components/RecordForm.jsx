import React, { useEffect, useMemo, useState } from 'react';
import { Save, X, AlertCircle, CheckCircle, Plus, ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2';
import { tableDefinitions } from '../../shared/tableDefinitions';
import { fetchTable, createRecord, updateRecord } from '../services/apiClient';

const getInputType = (type) => {
  if (type === 'decimal' || type === 'number') return 'number';
  if (type === 'date') return 'date';
  return 'text';
};

const RecordForm = ({ tableName, record, onCancel, onSuccess }) => {
  const schema = tableDefinitions[tableName];

  const initialState = useMemo(() => {
    if (record) return { ...record };
    return schema.fields.reduce((acc, field) => {
      acc[field.name] = '';
      return acc;
    }, {});
  }, [schema, record]);

  const [formState, setFormState] = useState(initialState);
  const [references, setReferences] = useState({});
  const [loading, setLoading] = useState(false);

  // Inline Create State
  const [inlineModes, setInlineModes] = useState({}); // { fieldName: boolean }
  const [nestedData, setNestedData] = useState({});   // { fieldName: { nestedField: value } }

  // Fetch referenced data for dropdowns
  useEffect(() => {
    const loadReferences = async () => {
      const refs = {};
      const fieldsWithRefs = schema.fields.filter(f => f.references);

      for (const field of fieldsWithRefs) {
        try {
          const data = await fetchTable(field.references);
          const refSchema = tableDefinitions[field.references];
          refs[field.name] = data.map(item => ({
            value: item[refSchema.primaryKey],
            label: item[field.displayField]
          }));
        } catch (err) {
          console.error(`Error loading reference for ${field.name}:`, err);
        }
      }
      setReferences(refs);
    };

    loadReferences();
  }, [tableName, schema]);

  // Reset form when record changes
  useEffect(() => {
    setFormState(initialState);
    setInlineModes({});
    setNestedData({});
  }, [initialState]);

  const handleChange = (event, field) => {
    const value = field.type === 'number' || field.type === 'decimal'
      ? (event.target.value === '' ? '' : Number(event.target.value))
      : event.target.value;

    setFormState((prev) => ({ ...prev, [field.name]: value }));
  };

  const handleNestedChange = (event, parentField, nestedField) => {
    const value = nestedField.type === 'number' || nestedField.type === 'decimal'
      ? (event.target.value === '' ? '' : Number(event.target.value))
      : event.target.value;

    setNestedData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] || {}),
        [nestedField.name]: value
      }
    }));
  };

  const toggleInlineMode = (fieldName) => {
    setInlineModes(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
    // Initialize nested data if opening
    if (!inlineModes[fieldName]) {
      const fieldDef = schema.fields.find(f => f.name === fieldName);
      const refTable = fieldDef.references;
      const refSchema = tableDefinitions[refTable];
      const initialNested = refSchema.fields.reduce((acc, f) => {
        if (!f.auto) acc[f.name] = '';
        return acc;
      }, {});
      setNestedData(prev => ({ ...prev, [fieldName]: initialNested }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formState };

      // 1. Process Inline Creations first
      for (const [fieldName, isInline] of Object.entries(inlineModes)) {
        if (isInline) {
          const fieldDef = schema.fields.find(f => f.name === fieldName);
          const refTable = fieldDef.references;
          const refSchema = tableDefinitions[refTable];
          const nestedPayload = nestedData[fieldName];

          // Create the related record
          const createdRef = await createRecord(refTable, nestedPayload);

          // Get the new ID
          const newId = createdRef[refSchema.primaryKey];

          // Assign to main payload
          payload[fieldName] = newId;
        }
      }

      // 2. Prepare main payload
      if (!record) {
        schema.fields.forEach(field => {
          if (field.auto) delete payload[field.name];
        });
      }

      // Format dates
      schema.fields.forEach(field => {
        if (field.type === 'date' && payload[field.name]) {
          payload[field.name] = new Date(payload[field.name]).toISOString().split('T')[0];
        }
      });

      let response;
      if (record) {
        let id;
        if (Array.isArray(schema.primaryKey)) {
          id = schema.primaryKey.map(key => `${key}=${record[key]}`).join('|');
        } else {
          id = record[schema.primaryKey];
        }
        response = await updateRecord(tableName, encodeURIComponent(id), payload);
      } else {
        response = await createRecord(tableName, payload);
      }

      // Show success modal with SweetAlert2
      await Swal.fire({
        title: record ? '¡Actualizado!' : '¡Creado!',
        html: `<p style="color: #64748b; margin-top: 8px;">${record ? 'El registro ha sido actualizado correctamente' : 'El nuevo registro ha sido creado exitosamente'}</p>`,
        icon: 'success',
        confirmButtonColor: '#10b981',
        confirmButtonText: '<span style="display: flex; align-items: center; gap: 6px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Entendido</span>',
        timer: 2500,
        timerProgressBar: true,
        customClass: {
          popup: 'rounded-2xl shadow-2xl',
          title: 'text-xl font-bold text-slate-800',
          confirmButton: 'rounded-lg px-6 py-2.5 font-medium shadow-lg hover:shadow-xl transition-all'
        },
        showClass: {
          popup: 'animate__animated animate__bounceIn animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOut animate__faster'
        }
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);

      // Show error modal with SweetAlert2
      await Swal.fire({
        title: '¡Error!',
        html: `<p style="color: #64748b; margin-top: 8px;">${err.message || 'No se pudo guardar el registro. Intenta nuevamente.'}</p>`,
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: '<span style="display: flex; align-items: center; gap: 6px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Cerrar</span>',
        customClass: {
          popup: 'rounded-2xl shadow-2xl',
          title: 'text-xl font-bold text-slate-800',
          confirmButton: 'rounded-lg px-6 py-2.5 font-medium shadow-lg hover:shadow-xl transition-all'
        },
        showClass: {
          popup: 'animate__animated animate__shakeX animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOut animate__faster'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {record ? 'Editar Registro' : 'Nuevo Registro'}
            </h3>
            <p className="text-sm text-slate-500">{schema.label}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {schema.fields.map((field) => {
              if (field.auto && !record) return null; // Hide auto fields on create
              if (field.auto && record) { // Read-only auto fields on edit
                return (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{field.label}</label>
                    <input
                      type="text"
                      value={formState[field.name] || ''}
                      disabled
                      className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500"
                    />
                  </div>
                );
              }

              const isInline = inlineModes[field.name];

              return (
                <div key={field.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-slate-700">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>
                    {field.references && !record && (
                      <button
                        type="button"
                        onClick={() => toggleInlineMode(field.name)}
                        className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${isInline
                          ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                          }`}
                      >
                        {isInline ? <><X className="w-3 h-3" /> Cancelar</> : <><Plus className="w-3 h-3" /> Nuevo</>}
                      </button>
                    )}
                  </div>

                  {isInline ? (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Nuevo {tableDefinitions[field.references].label}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tableDefinitions[field.references].fields.map(nestedField => {
                          if (nestedField.auto) return null;
                          return (
                            <div key={nestedField.name}>
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                {nestedField.label} {nestedField.required && <span className="text-rose-500">*</span>}
                              </label>
                              <input
                                type={getInputType(nestedField.type)}
                                required={nestedField.required}
                                value={nestedData[field.name]?.[nestedField.name] || ''}
                                onChange={(e) => handleNestedChange(e, field.name, nestedField)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    field.references ? (
                      <div className="relative">
                        <select
                          value={formState[field.name] || ''}
                          onChange={(e) => handleChange(e, field)}
                          required={field.required}
                          className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
                        >
                          <option value="">Seleccione una opción</option>
                          {references[field.name]?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    ) : (
                      <input
                        type={getInputType(field.type)}
                        value={formState[field.name] || ''}
                        onChange={(e) => handleChange(e, field)}
                        required={field.required}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    )
                  )}
                </div>
              );
            })}
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordForm;
