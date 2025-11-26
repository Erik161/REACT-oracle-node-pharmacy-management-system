# Instrucciones para PM2

## Instalación
```bash
npm install -g pm2
```

## 🎯 Servicios Configurados

### Backend (API)  
✅ **Controlado por PM2** - Siempre activo con auto-restart
- Puerto: **3000**
- Auto-reinicia cuando detecta cambios en archivos `.js`

### Frontend (Dashboard)
⚠️ **Requiere ejecución manual** - Incompatibilidad con PM2
- Puerto: **5173**
- Ejecutar: `npm run dev` en la raíz del proyecto
- **Razón**: Vite usa un servidor de desarrollo interactivo que PM2 no maneja bien en Windows

---

## Comandos Principales

### Backend (siempre activo con PM2)

### Iniciar la aplicación
```bash
pm2 start ecosystem.config.js
```

### Ver estado de los procesos
```bash
pm2 status
# o
pm2 list
```

### Ver logs en tiempo real
```bash
pm2 logs farmacia-api
```

### Detener el servidor
```bash
pm2 stop farmacia-api
```

### Reiniciar el servidor manualmente
```bash
pm2 restart farmacia-api
```

### Eliminar el proceso
```bash
pm2 delete farmacia-api
```

### Modo Monitoreo (Dashboard)
```bash
pm2 monit
```

## Auto-inicio al encender el sistema (Opcional)

### Windows
```bash
pm2 startup
pm2 save
```

### Deshabilitar auto-inicio
```bash
pm2 unstartup
```

## Notas Importantes

1. **Modo Watch**: El servidor se reiniciará automáticamente cuando detecte cambios en los archivos `.js`.
2. **Logs**: Los logs se guardan en `server/logs/`.
3. **Memoria**: Se reinicia automáticamente si usa más de 300MB.
4. **Ya no necesitas** ejecutar `npm run dev` o `node index.js` manualmente.
