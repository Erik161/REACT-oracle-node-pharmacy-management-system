# Sistema de Farmacia

Aplicación React + Vite que consume una API Express para mostrar la información real guardada en tu base de datos Oracle. Este repositorio contiene dos proyectos:

- `src/`: el frontend en React.
- `server/`: un backend mínimo en Node.js/Express que expone la base de datos mediante endpoints REST.

## Requisitos

- Node.js 20+
- Oracle Database accesible desde la máquina donde corre el backend.
- [Oracle Instant Client](https://www.oracle.com/database/technologies/instant-client.html) instalado si ejecutas el backend en Linux/macOS (necesario para el paquete `oracledb`).

## Configurar el backend

1. Copia el archivo de ejemplo y agrega tus credenciales reales:
   ```bash
   cp server/.env.example server/.env
   ```
   Edita `server/.env` y coloca los valores correctos (`ORACLE_USER`, `ORACLE_PASSWORD`, `ORACLE_CONNECT_STRING`).
2. Instala las dependencias del backend:
   ```bash
   cd server
   npm install
   ```
3. Inicia la API:
   ```bash
   npm start
   ```
   Por defecto escuchará en `http://localhost:3000` y expone el endpoint `GET /api/productos` que lee la tabla `PRODUCTOS` de Oracle.

## Ejecutar el frontend

En otra terminal:
```bash
npm install
npm run dev
```
La aplicación consultará `http://localhost:3000/api/productos`, mostrará el estado de carga y luego listará los productos reales que devuelve Oracle.

## Personalización

- Si necesitas más endpoints, agrégalos en `server/index.js` reutilizando la función `runQuery`.
- Si deseas servir ambos proyectos juntos en producción, compila el frontend con `npm run build` y sirve los archivos estáticos detrás del mismo dominio que la API (por ejemplo con Nginx o el propio Express usando `app.use(express.static(...))`).

## Seguridad

- No publiques `server/.env`. El archivo ya está incluido en `.gitignore`.
- Usa un usuario de Oracle con permisos limitados en lugar de `SYSTEM` para evitar riesgos en caso de fuga de credenciales.
