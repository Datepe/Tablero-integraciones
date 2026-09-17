# Panel de Gestión de Requerimientos (Angular)

Panel interactivo para el seguimiento y gestión de requerimientos, tareas e integraciones. Migrado a **Angular moderno** con arquitectura de componentes Standalone, Signals reactivos, Angular CDK Drag & Drop y despliegue continuo (CI/CD) con GitHub Actions hacia GitHub Pages.

---

## 🚀 Características y Arquitectura

- **Angular Moderno (v19)**:
  - **Standalone Components**: Modularidad limpia sin `NgModule`.
  - **Signals Reactivos (`signal`, `computed`)**: Estado derivado eficiente para filtros de búsqueda, conteos en tiempo real y banners de alerta.
  - **Angular CDK (`@angular/cdk/drag-drop`)**: Movimiento fluido de tareas entre columnas mediante arrastrar y soltar, además de selectores de cambio rápido.
  - **TypeScript Estricto**: Modelos e interfaces tipados (`Requirement`, `TaskItem`, `Milestone`, etc.).
- **Persistencia en la Nube y Local**:
  - Conexión sincronizada con la API de Google Drive / Google Apps Script.
  - Guardado con *debouncing* automático (400ms) para evitar llamadas innecesarias.
  - Caché de respaldo automático en `localStorage` ante desconexiones.
- **Banners Inteligentes**:
  - 📅 **Pendientes para Mañana**: Detección y listado automático de tareas con vencimiento al día siguiente y completado rápido con checkbox.
  - ⚡ **Tareas con Plataforma**: Filtro rápido de tareas que requieren gestión en plataforma.
- **Espacio de Trabajo Completo**:
  - Columnas: *Tareas por Hacer*, *Completadas*, *Recurrentes* y *Fechas Importantes*.
  - Edición en modal para modificar descripción, fecha o marca de plataforma.
  - Plantilla de tareas recurrentes sincronizada en todos los requerimientos.

---

## 📁 Estructura del Proyecto

```text
├── .github/workflows/
│   └── deploy.yml            # CI/CD: Compilación y despliegue a GitHub Pages
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── banners/      # Banners de alerta (Mañana y Plataforma)
│   │   │   ├── dashboard/    # Grid de requerimientos y tarjetas estadísticas
│   │   │   ├── header/       # Cabecera, buscador y estado de sincronización
│   │   │   ├── modals/       # Modales (Crear, Recurrentes, Edición)
│   │   │   └── workspace/    # Espacio de trabajo detallado con Drag & Drop
│   │   ├── models/           # Interfaces TypeScript (requirement.model.ts)
│   │   ├── services/         # RequirementService con Signals y persistencia
│   │   ├── app.component.ts  # Componente raíz
│   │   └── app.config.ts     # Configuración de la aplicación
│   ├── styles.scss           # Estilos globales y variables de diseño oscuro
│   └── index.html            # Entrypoint HTML
├── angular.json              # Configuración de compilación Angular
├── package.json              # Dependencias y scripts
└── index.legacy.html         # Respaldo de la versión monolítica anterior
```

---

## 🛠️ Comandos de Desarrollo

### Instalar Dependencias
```bash
npm install
```

### Iniciar Servidor Local de Desarrollo
```bash
npm start
```
Abre tu navegador en `http://localhost:4200/`. La aplicación se recarga automáticamente al guardar cambios.

### Compilar para Producción
```bash
npm run build
```

### Compilar para GitHub Pages
```bash
npm run build:gh
```

---

## 🌐 Despliegue en GitHub Pages

El proyecto cuenta con un flujo automatizado en **GitHub Actions** (`.github/workflows/deploy.yml`).

Para activarlo en GitHub:
1. Ve a **Settings** > **Pages** en tu repositorio.
2. En **Build and deployment > Source**, selecciona **GitHub Actions**.
3. Cada vez que hagas `git push` a la rama `main`, la aplicación se compilará y desplegará automáticamente en:
   👉 **https://datepe.github.io/Tablero-integraciones/**
