# Sistema de farmacia con Oracle

Dashboard administrativo construido con React + Vite y Tailwind CSS para gestionar las 21 tablas del modelo de farmacia (departamentos, clientes, inventario, ventas, logística y activos). Incluye un servidor Express de referencia para exponer CRUDs conectados a Oracle Database.





![Dashboard Farmacia](https://github.com/user-attachments/assets/a712d9fe-f9df-4072-ac1a-76b155c8cfd0)





## Características principales

- **Dashboard responsivo** con navegación lateral, métricas rápidas y formulario/tabla editable para cada entidad.
- **Metadatos centralizados** en [`shared/tableDefinitions.js`](shared/tableDefinitions.js) para reutilizar descripciones, columnas y llaves primarias tanto en el front como en la API.
- **Hook `useTableData`** que consume la API REST (`/api/:tabla`) y cae automáticamente a datos de ejemplo cuando la conexión con Oracle no está disponible.
- **Formularios dinámicos** generados con Tailwind CSS (vía CDN) para crear/actualizar registros sin escribir JSX adicional por tabla.
- **Servidor Express** (`server/index.js`) listo para conectarse a Oracle usando el driver oficial (`oracledb`) y exponer endpoints genéricos de CRUD.

## Requisitos previos

- Node.js 18+
- Oracle Client/Instant Client disponible en el host para que el paquete `oracledb` pueda conectarse.

## Ejecutar el frontend

```bash
npm install # instala dependencias del dashboard
npm run dev
```

El dashboard usará Tailwind desde CDN automáticamente y escuchará en `http://localhost:5173`.

## Ejecutar la API de Oracle

1. Copia el archivo de ejemplo y ajusta tus credenciales:

   ```bash
   cd server
   cp .env.example .env
   # edita .env y coloca usuario, contraseña y cadena de conexión
   ```

2. Instala dependencias y levanta el servicio:

   ```bash
   npm install
   npm run dev
   ```

3. El API quedará disponible en `http://localhost:4000/api`. El frontend busca esa URL por defecto; puedes sobreescribirla mediante la variable `VITE_API_URL`.

## Endpoints disponibles

Todos los recursos comparten la misma convención:

- `GET    /api/<Tabla>` – Lista registros (máximo controlado por Oracle).
- `POST   /api/<Tabla>` – Inserta un registro. Se esperan los campos definidos en `tableDefinitions`.
- `PUT    /api/<Tabla>/<PK>` – Actualiza un registro. Para llaves compuestas se envían como `CAMPO1=valor|CAMPO2=valor`.
- `DELETE /api/<Tabla>/<PK>` – Elimina un registro.

## Datos de ejemplo
# Sistema de farmacia con Oracle

Dashboard administrativo construido con React + Vite y Tailwind CSS para gestionar las 21 tablas del modelo de farmacia (departamentos, clientes, inventario, ventas, logística y activos). Incluye un servidor Express de referencia para exponer CRUDs conectados a Oracle Database.

## Características principales

- **Dashboard responsivo** con navegación lateral, métricas rápidas y formulario/tabla editable para cada entidad.
- **Metadatos centralizados** en [`shared/tableDefinitions.js`](shared/tableDefinitions.js) para reutilizar descripciones, columnas y llaves primarias tanto en el front como en la API.
- **Hook `useTableData`** que consume la API REST (`/api/:tabla`) y cae automáticamente a datos de ejemplo cuando la conexión con Oracle no está disponible.
- **Formularios dinámicos** generados con Tailwind CSS (vía CDN) para crear/actualizar registros sin escribir JSX adicional por tabla.
- **Servidor Express** (`server/index.js`) listo para conectarse a Oracle usando el driver oficial (`oracledb`) y exponer endpoints genéricos de CRUD.

## Requisitos previos

- Node.js 18+
- Oracle Client/Instant Client disponible en el host para que el paquete `oracledb` pueda conectarse.

## Ejecutar el frontend

```bash
npm install # instala dependencias del dashboard
npm run dev
```

El dashboard usará Tailwind desde CDN automáticamente y escuchará en `http://localhost:5173`.

## Ejecutar la API de Oracle

1. Copia el archivo de ejemplo y ajusta tus credenciales:

   ```bash
   cd server
   cp .env.example .env
   # edita .env y coloca usuario, contraseña y cadena de conexión
   ```

2. Instala dependencias y levanta el servicio:

   ```bash
   npm install
   npm run dev
   ```

3. El API quedará disponible en `http://localhost:4000/api`. El frontend busca esa URL por defecto; puedes sobreescribirla mediante la variable `VITE_API_URL`.

## Endpoints disponibles

Todos los recursos comparten la misma convención:

- `GET    /api/<Tabla>` – Lista registros (máximo controlado por Oracle).
- `POST   /api/<Tabla>` – Inserta un registro. Se esperan los campos definidos en `tableDefinitions`.
- `PUT    /api/<Tabla>/<PK>` – Actualiza un registro. Para llaves compuestas se envían como `CAMPO1=valor|CAMPO2=valor`.
- `DELETE /api/<Tabla>/<PK>` – Elimina un registro.

## Datos de ejemplo

Mientras la API no esté disponible, el hook `useTableData` renderiza datos mock definidos en [`src/data/mockData.js`](src/data/mockData.js). Esto permite validar la interfaz y los estilos sin depender de Oracle.

## Personalización

- Ajusta la apariencia editando las clases de Tailwind directamente en los componentes.
- Agrega validaciones adicionales o selects para llaves foráneas modificando `shared/tableDefinitions.js` (por ejemplo, agregando propiedades `options`).
- Para conectar el dashboard a otro backend basta con actualizar `src/services/apiClient.js`.

## Scripts útiles

- `npm run dev` – Servidor de desarrollo del dashboard.
- `npm run build` – Compila la app para producción.
- `npm run preview` – Sirve la compilación.

## Estructura de carpetas relevante

```
├── shared/tableDefinitions.js   # catálogo de tablas reutilizable
├── src/
│   ├── components/              # dashboard, sidebar, tabla y formularios
│   ├── data/mockData.js         # datos de respaldo
│   ├── hooks/useTableData.js    # lógica de consumo y fallback
│   └── services/apiClient.js    # cliente REST
└── server/
    ├── index.js                 # servidor Express + rutas CRUD
    ├── routes/crudRoutes.js     # endpoints dinámicos por tabla
    └── db/oracleClient.js       # pool de conexiones Oracle
```

## Notas

- El driver `oracledb` requiere las librerías nativas de Oracle; instala el Instant Client adecuado antes de ejecutar el servidor.
- Si trabajas en otro puerto u host, define `VITE_API_URL` en un archivo `.env` en la raíz del proyecto para que el frontend apunte al nuevo endpoint.
- **Seguridad:** No publiques `server/.env`. Usa un usuario de Oracle con permisos limitados en lugar de `SYSTEM` para evitar riesgos.
