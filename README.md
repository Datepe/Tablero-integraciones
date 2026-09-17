# Panel de Gestión de Requerimientos

Tablero interactivo para el seguimiento y gestión de requerimientos, tareas e integraciones con soporte para interfaz web y sincronización.

## 🚀 Características

- **Gestión de Requerimientos**: Tarjetas con resumen de estado, tareas pendientes, completadas y fechas clave.
- **Espacio de Trabajo Interactivo**:
  - Tareas por hacer (con fecha límite y etiqueta para gestión de plataforma).
  - Tareas completadas.
  - Tareas recurrentes compartidas.
  - Fechas e hitos importantes.
  - Movimiento rápido de tareas mediante *Drag & Drop* o selectores directos.
- **Banners de Acción Inmediata**:
  - 📅 **Pendientes para Mañana**: Visualización inmediata de tareas que vencen al día siguiente.
  - ⚡ **Tareas con Plataforma**: Filtro rápido de tareas marcadas para gestión en plataforma.
- **Plantilla de Recurrentes**: Sincronización de tareas repetitivas en todos los requerimientos.

## 📁 Estructura del Proyecto

- `tablero.html`: Interfaz de usuario completa (SPA) en modo oscuro.
- `app.py`: Servidor HTTP ligero en Python para servir la aplicación y endpoints API locales.
- `.gitignore`: Archivos y carpetas ignorados por control de versiones.

## 🛠️ Ejecución Local

1. Asegúrate de tener Python instalado.
2. Inicia el servidor ejecutando:
   ```bash
   python app.py
   ```
3. Abre tu navegador en [http://localhost:8000/tablero.html](http://localhost:8000/tablero.html).
