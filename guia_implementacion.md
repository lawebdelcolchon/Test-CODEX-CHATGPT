# Guía para Implementar una Nueva Entidad con API REST en el Panel de Administración

## Contexto del Proyecto
Estás trabajando en un panel de administración React con Vite que utiliza Redux Toolkit, un sistema genérico de slices, y una API REST real. El proyecto tiene una estructura establecida para manejar entidades de forma consistente.

## Objetivo
Implementar una nueva entidad (por ejemplo: "suppliers", "brands", "tags", etc.) completa con datos mock, vistas, funcionalidades CRUD y integración con la API REST real.

## Pasos a Seguir

### 1. **Crear el archivo JSON mock**
```
Ubicación: src/mocks/{entidad}.json
```
- Crear un array de objetos con datos de ejemplo
- Incluir campos básicos como: id, name, created_at, updated_at, active
- Agregar campos específicos de la entidad según sea necesario
- Usar al menos 5-10 registros de ejemplo con datos realistas

### 2. **Registrar la entidad en el sistema de configuración**
```
Archivo: src/config/models.js
```
- Agregar el nombre de la entidad al array `MODELS`
- Configurar las propiedades específicas de la entidad en `MODEL_CONFIG`
- Definir campos requeridos, transformaciones y operaciones soportadas

### 3. **Crear la página principal (lista)**
```
Ubicación: src/pages/{Entidad}.jsx (con primera letra mayúscula)
```
- Importar las dependencias necesarias: React, Redux, ContainerLayout
- Configurar el selector Redux para obtener datos del estado
- Implementar verificación de permisos usando `hasPermission`
- Definir las columnas de la tabla con sus respectivos renderers
- Configurar el ContainerLayout con los parámetros correctos
- Incluir manejo de estados de carga y error

### 4. **Implementar el feature de detalle**
```
Ubicación: src/features/{entidad}/index.jsx
```
- Crear componente para mostrar y editar detalles de un elemento
- Implementar formularios reactivos con estado local
- Agregar verificaciones de permisos para editar y eliminar
- Configurar handlers personalizados para las acciones
- Usar DataLayout para estructura consistente
- Implementar navegación y manejo de URLs

### 5. **Crear el feature de creación**
```
Ubicación: src/features/{entidad}/new.jsx
```
- Implementar modal o página para crear nuevos elementos
- Configurar formulario con validación
- Agregar verificación de permisos para crear
- Implementar navegación y cierre de modales
- Conectar con las acciones Redux correspondientes

### 6. **Configurar las rutas**
```
Archivo: src/App.jsx o el archivo de rutas principal
```
- Agregar rutas para:
  - Lista: `/{entidad}`
  - Detalle: `/{entidad}/:id`
  - Creación: `/{entidad}/create`
  - Edición: `/{entidad}/:id?edit=true`
  - Eliminación: `/{entidad}/:id?delete=true`

### 7. **Actualizar la navegación**
```
Archivo: Componente de navegación principal
```
- Agregar enlace en el menú de navegación
- Configurar icono y etiqueta apropiados
- Verificar permisos para mostrar/ocultar el enlace

### 8. **Implementar sistema de permisos**
```
Archivos afectados: Todos los componentes creados
```
- Usar `hasPermission(user, ['all', '{entidad}'])` en todos los componentes
- Proteger acciones de crear, editar y eliminar
- Mostrar mensajes de acceso denegado cuando corresponda
- Configurar props de permisos en tablas y componentes

### 9. **Configurar integración con API REST**
Los endpoints de la API REST ya están configurados automáticamente:
- **GET** `/api/{entidad}` - Listar elementos
- **GET** `/api/{entidad}/{id}` - Obtener elemento específico  
- **POST** `/api/{entidad}` - Crear nuevo elemento
- **PUT** `/api/{entidad}/{id}` - Actualizar elemento
- **DELETE** `/api/{entidad}/{id}` - Eliminar elemento

### 10. **Verificar funcionalidades Redux**
El sistema genérico de slices automáticamente proporciona:
- Acciones: `fetchList`, `fetchById`, `create`, `update`, `remove`
- Selectors: estado, elementos, carga, errores
- Reducers: manejo de estados async

## Estructura de Archivos Final
```
src/
├── mocks/
│   └── {entidad}.json
├── pages/
│   └── {Entidad}.jsx
├── features/
│   └── {entidad}/
│       ├── index.jsx
│       └── new.jsx
└── config/
    └── models.js (actualizado)
```

## Consideraciones Importantes

1. **Consistencia de Nombres**: Usar singular en minúsculas para carpetas/archivos, plural para datos
2. **Permisos**: Implementar verificaciones en todos los niveles (UI, handlers, navegación)
3. **Estados de Carga**: Manejar loading, success, error en todos los componentes
4. **Navegación**: Configurar correctamente las rutas y parámetros URL
5. **Validación**: Implementar validaciones de formularios según sea necesario
6. **Responsive**: Asegurar que las vistas funcionen en diferentes dispositivos

## Ejemplo de Implementación - Entidad "Suppliers"

### 1. src/mocks/suppliers.json
```json
[
  {
    "id": 1,
    "name": "Proveedor ABC",
    "email": "contacto@proveedorabc.com",
    "phone": "+1 234 567 8900",
    "address": "123 Calle Principal",
    "city": "Ciudad Principal",
    "country": "País",
    "active": true,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

### 2. src/config/models.js (agregar)
```javascript
'suppliers', // Agregar al array MODELS

// Agregar en MODEL_CONFIG:
suppliers: {
  displayName: 'Proveedores',
  fields: {
    name: { required: true, type: 'string' },
    email: { required: true, type: 'email' },
    phone: { required: false, type: 'string' },
    address: { required: false, type: 'string' }
  },
  operations: ['create', 'read', 'update', 'delete']
}
```

### 3. src/pages/Suppliers.jsx
```javascript
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ContainerLayout from "../layouts/ContainerLayout.jsx";
import { useStatusBadge } from "../hooks/useStatusBadge.jsx";
import { suppliersActions } from "../store/slices/index.js";
import { hasPermission } from "../utils/permissions.js";

function StatusBadge({ isActive }) {
  return useStatusBadge(isActive, isActive ? "Activo" : "Inactivo");
}

export default function Suppliers() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.suppliers);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const userHasAccess = hasPermission(user, ['all', 'suppliers']);

  useEffect(() => {
    if (isAuthenticated && userHasAccess && status === 'idle') {
      dispatch(suppliersActions.fetchList());
    }
  }, [dispatch, status, isAuthenticated, user, userHasAccess]);

  if (isAuthenticated && !userHasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Acceso Denegado</h2>
        <p className="text-gray-500 mb-4">No tienes permisos para acceder a los proveedores.</p>
      </div>
    );
  }

  const columnsData = [
    {
      key: "name",
      label: "Nombre",
      accessor: "name",
      render: (row) => <span className="truncate">{row.name || "-"}</span>,
    },
    {
      key: "email",
      label: "Email",
      accessor: "email",
      render: (row) => <span className="truncate">{row.email || "-"}</span>,
    },
    {
      key: "active",
      label: "Estado",
      accessor: "active",
      render: (row) => <StatusBadge isActive={row.active} />,
    },
    {
      key: "created_at",
      label: "Fecha de Creación",
      accessor: "created_at",
      render: (row) => row.created_at
        ? new Date(row.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
        : "-",
    },
  ];

  return (
    <ContainerLayout
      entityName="suppliers"
      columnsData={columnsData}
      orderKeys={["Nombre", "Email", "Estado", "Fecha de Creación"]}
      reduxState={{ items, status, error }}
      emptyMessage="No se encontraron proveedores"
    />
  );
}
```

## Resultado Esperado
Al completar estos pasos, tendrás una entidad completamente funcional con:
- ✅ Listado con paginación, filtros y ordenamiento
- ✅ Vista de detalle con capacidad de edición
- ✅ Creación de nuevos elementos
- ✅ Eliminación con confirmación
- ✅ Integración completa con API REST
- ✅ Sistema de permisos implementado
- ✅ Estados de carga y error manejados
- ✅ Navegación y rutas configuradas

Este prompt te permitirá implementar cualquier nueva entidad de forma consistente con la arquitectura existente del proyecto.

## Notas Adicionales

### Debugging y Testing
- Usa las herramientas de desarrollo de Redux para monitorear el estado
- Verifica que los endpoints de la API respondan correctamente
- Prueba todos los escenarios de permisos (con y sin acceso)
- Valida el comportamiento en diferentes estados (carga, error, éxito)

### Mejores Prácticas
- Mantén consistencia en el naming de archivos y componentes
- Documenta cualquier lógica de negocio específica
- Implementa mensajes de error user-friendly
- Optimiza las re-renders usando React.memo cuando sea necesario
- Valida los props con PropTypes o TypeScript si está disponible
