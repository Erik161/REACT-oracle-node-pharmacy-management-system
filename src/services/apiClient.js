const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

const handleResponse = async (response) => {
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Error en la API de Oracle')
  }
  if (response.status === 204) {
    return null
  }
  return response.json()
}

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  })
  return handleResponse(response)
}

export const fetchTable = (table) => request(`/${table}`)

export const createRecord = (table, payload) =>
  request(`/${table}`, { method: 'POST', body: JSON.stringify(payload) })

export const updateRecord = (table, id, payload) =>
  request(`/${table}/${id}`, { method: 'PUT', body: JSON.stringify(payload) })

export const deleteRecord = (table, id) =>
  request(`/${table}/${id}`, { method: 'DELETE' })
