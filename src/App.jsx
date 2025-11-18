import { useEffect, useMemo, useState } from 'react'
import './App.css'

const DEFAULT_API_URL = 'http://localhost:3000'

function App() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const apiBaseUrl = useMemo(() => {
    return import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? DEFAULT_API_URL
  }, [])

  useEffect(() => {
    async function fetchProductos() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${apiBaseUrl}/api/productos`)
        if (!response.ok) {
          throw new Error('No se pudo obtener la lista de productos')
        }
        const data = await response.json()
        setProductos(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProductos()
  }, [apiBaseUrl])

  return (
    <main className="app">
      <header>
        <h1>Sistema de farmacia</h1>
        <p>Datos obtenidos directamente desde Oracle mediante la API Express.</p>
      </header>

      {loading && <p className="status">Cargando productos...</p>}
      {error && (
        <p className="status error">
          Ocurrió un problema: <span>{error}</span>
        </p>
      )}

      {!loading && !error && (
        <section>
          {productos.length === 0 ? (
            <p className="status">No hay productos para mostrar.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr key={producto.ID_PRODUCTO ?? producto.id_producto ?? producto.id}>
                      <td>{producto.ID_PRODUCTO ?? producto.id_producto ?? producto.id}</td>
                      <td>{producto.NOMBRE ?? producto.nombre}</td>
                      <td>
                        {producto.PRECIO ?? producto.precio
                          ? Number(producto.PRECIO ?? producto.precio).toLocaleString('es-MX', {
                              style: 'currency',
                              currency: 'MXN',
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  )
}

export default App
