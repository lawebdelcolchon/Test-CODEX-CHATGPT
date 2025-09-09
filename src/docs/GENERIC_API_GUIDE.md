# 🚀 Sistema Genérico de API - Guía Completa

## 📋 Descripción

Este sistema permite manejar operaciones CRUD para cualquier modelo usando una sola implementación genérica que se adapta automáticamente a diferentes endpoints REST.

**Modelos actualmente configurados:**
- **Categories**: Gestión de categorías con jerarquía (parent/child)
- **Attributes**: Atributos de productos con niveles y utilidades  
- **Options**: Opciones de configuración con posiciones y observaciones

## 🏗️ Estructura del Sistema

### 1. **Cliente HTTP** (`src/services/httpClient.js`)
- Cliente Axios configurado con interceptors
- Manejo automático de autenticación
- Headers estándar (Autorizacion: Bearer, X-API-KEY)
- Manejo centralizado de errores

### 2. **API Genérica** (`src/services/genericApi.js`)
- Métodos CRUD universales
- Construcción dinámica de URLs: `{BASE_URL}/api/{modelo}/{opciones}`
- Normalización de respuestas
- Soporte para acciones personalizadas

### 3. **Factory de Slices** (`src/store/slices/createGenericSlice.js`)
- Genera slices Redux automáticamente
- Estado consistente para todos los modelos
- Async thunks con manejo de errores
- Selectors predefinidos

### 4. **Configuración de Modelos** (`src/config/models.js`)
- Definición de modelos disponibles
- Configuración específica por modelo
- Transformaciones de campos
- Validaciones automáticas

## 🔧 Configuración

### Variables de Entorno
```env
VITE_API_BASE_URL=https://decorlujo.com/server_api/api
VITE_API_KEY=tu_api_key_aqui
VITE_STORE_ID=1
```

### Estructura de Endpoints
```
GET    /api/categories        → Listar categorías
GET    /api/categories/123    → Obtener categoría específica
POST   /api/categories        → Crear categoría
PUT    /api/categories/123    → Actualizar categoría
DELETE /api/categories/123    → Eliminar categoría

GET    /api/attributes        → Listar atributos
POST   /api/attributes        → Crear atributo
PUT    /api/attributes/456    → Actualizar atributo

GET    /api/options           → Listar opciones
POST   /api/categories/activate/123  → Activar categoría
POST   /api/options/moveUp/789       → Mover opción hacia arriba
```

## 📚 Uso Básico

### 1. **Con el Hook useGenericCRUD**
```jsx
import { useGenericCRUD } from '../hooks/useGenericCRUD';

const CategoriesComponent = () => {
  const {
    data: { items, total, isEmpty },
    loading: { isListLoading, isCreateLoading },
    errors: { listError },
    actions: { fetchList, create, update, remove, customAction },
    utils: { clearErrors }
  } = useGenericCRUD('categories');

  // Auto-carga datos al montar
  
  const handleCreate = async (categoryData) => {
    try {
      await create(categoryData);
      // Éxito: se actualiza automáticamente el estado
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleActivate = async (categoryId) => {
    try {
      await customAction('activate', categoryId, null, 'POST');
    } catch (error) {
      console.error('Error activating category:', error);
    }
  };

  return (
    <div>
      {isListLoading && <div>Cargando...</div>}
      {listError && <div>Error: {listError}</div>}
      {isEmpty && <div>No hay categorías</div>}
      
      {items.map(category => (
        <div key={category.id}>
          {category.name} - Posición: {category.position}
          <button onClick={() => handleActivate(category.id)}>
            {category.active ? 'Desactivar' : 'Activar'}
          </button>
          <button onClick={() => remove(category.id)}>
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
};
```

### 2. **Con Redux directamente**
```jsx
import { useDispatch, useSelector } from 'react-redux';
import { productsActions, productsSelectors } from '../store/slices';

const ProductsReduxComponent = () => {
  const dispatch = useDispatch();
  const items = useSelector(productsSelectors.selectItems);
  const isLoading = useSelector(productsSelectors.selectIsListLoading);

  useEffect(() => {
    dispatch(productsActions.fetchList({ page: 1, pageSize: 20 }));
  }, [dispatch]);

  const handleCreate = (productData) => {
    dispatch(productsActions.create(productData));
  };

  return (
    // UI similar al ejemplo anterior
  );
};
```

## 🔧 Configuración Avanzada

### 1. **Agregar Nuevo Modelo**
```javascript
// En src/config/models.js
export const MODELS = [
  'products',
  'orders', 
  'customers',
  'categories',
  'newModel' // ← Agregar aquí
];

export const MODEL_CONFIG = {
  // ... otros modelos
  newModel: {
    name: 'newModel',
    displayName: 'Nuevo Modelo',
    endpoints: {
      list: '/newModel',
      get: '/newModel/:id',
      create: '/newModel',
      update: '/newModel/:id',
      delete: '/newModel/:id'
    },
    transformFields: {
      price: (value) => parseFloat(value) || 0,
    },
    requiredFields: ['name'],
    defaultSort: { field: 'name', order: 'asc' },
    defaultPageSize: 20
  }
};
```

### 2. **Transformaciones de Campos**
```javascript
// En MODEL_CONFIG
transformFields: {
  price: (value) => parseFloat(value) || 0,
  email: (value) => String(value).toLowerCase().trim(),
  phone: (value) => String(value).replace(/[^\d+]/g, ''),
  active: (value) => Boolean(value),
  date: (value) => value ? new Date(value).toISOString() : null
}
```

### 3. **Acciones Personalizadas**
```javascript
// Definir en configuración del modelo
customActions: ['approve', 'cancel', 'duplicate']

// Usar en componente
const { actions } = useGenericCRUD('orders');
await actions.customAction('approve', orderId, null, 'POST');
```

### 4. **Hook Personalizado con Opciones**
```javascript
const { data, actions } = useGenericCRUD('products', {
  autoFetch: true,
  fetchParams: { category: 'electronics' },
  enableOptimisticUpdates: true,
  onError: (operation, error) => {
    console.error(`Error in ${operation}:`, error);
    toast.error(`Error: ${error.message}`);
  },
  onSuccess: (operation, result) => {
    if (operation === 'create') {
      toast.success('Producto creado exitosamente');
    }
  }
});
```

## 📊 Estados Disponibles

### Datos
- `items`: Array de elementos
- `currentItem`: Elemento seleccionado actualmente
- `total`: Total de elementos
- `pagination`: Información de paginación
- `isEmpty`: Boolean si no hay datos

### Estados de Loading
- `isListLoading`: Cargando lista
- `isCreateLoading`: Creando elemento
- `isUpdateLoading`: Actualizando elemento
- `isDeleteLoading`: Eliminando elemento
- `isFetchByIdLoading`: Cargando elemento específico
- `isCustomActionLoading`: Ejecutando acción personalizada

### Errores
- `listError`: Error al cargar lista
- `createError`: Error al crear
- `updateError`: Error al actualizar
- `deleteError`: Error al eliminar
- `fetchByIdError`: Error al cargar elemento
- `customActionError`: Error en acción personalizada

## 🔍 Selectors Disponibles

```javascript
// Usando los selectors
const items = useSelector(productsSelectors.selectItems);
const total = useSelector(productsSelectors.selectTotal);
const isLoading = useSelector(productsSelectors.selectIsLoading);
const pagination = useSelector(productsSelectors.selectPagination);
const error = useSelector(productsSelectors.selectError);
const currentFilters = useSelector(productsSelectors.selectCurrentFilters);
const currentSort = useSelector(productsSelectors.selectCurrentSort);

// Selector con parámetros
const product = useSelector(state => 
  productsSelectors.selectItemById(state, productId)
);
```

## 🚀 Acciones Disponibles

### CRUD Básico
- `fetchList(params)`: Cargar lista con filtros/paginación
- `fetchById(id)`: Cargar elemento específico
- `create(payload)`: Crear nuevo elemento
- `update({ id, payload })`: Actualizar elemento
- `remove(id)`: Eliminar elemento

### Utilidades
- `clearErrors()`: Limpiar errores
- `clearCurrentItem()`: Limpiar elemento actual
- `setFilters(filters)`: Establecer filtros
- `setSort(sortConfig)`: Establecer ordenamiento
- `resetState()`: Reset completo del estado
- `updateItemOptimistic({ id, changes })`: Actualización optimista

### Personalizadas
- `customAction({ action, id, payload, method })`: Ejecutar acción personalizada

## 🔄 Migración desde mockApi

### Antes (mockApi)
```javascript
import { mockApi } from '../services/api.js';

const fetchProducts = createAsyncThunk('products/list', async (params) => {
  return await mockApi.list('products', params);
});
```

### Después (Sistema Genérico)
```javascript
// Ya está disponible automáticamente
import { productsActions } from '../store/slices';

// O usando el hook
const { actions } = useGenericCRUD('products');
```

## 🐛 Debugging

### Ver información de slices generados
```javascript
import { debugSlicesInfo } from '../store/slices';
debugSlicesInfo(); // En consola de desarrollo
```

### Verificar estado en Redux DevTools
- Todos los slices aparecen como: `products`, `orders`, `customers`, etc.
- Cada slice tiene la misma estructura consistente
- Acciones nombradas como: `products/fetchList/pending`, etc.

## 📝 Ejemplos Completos

### Componente con Paginación
```jsx
const ProductsList = () => {
  const {
    data: { items, pagination },
    loading: { isListLoading },
    actions: { fetchList }
  } = useGenericCRUD('products');

  const handlePageChange = (page) => {
    fetchList({ page, pageSize: pagination.pageSize });
  };

  return (
    <div>
      <ProductTable 
        items={items} 
        loading={isListLoading} 
      />
      <Pagination 
        {...pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
```

### Componente con Filtros
```jsx
const ProductsWithFilters = () => {
  const {
    data: { items },
    filters: { setFilters, currentFilters },
    actions: { fetchList }
  } = useGenericCRUD('products');

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    fetchList({ ...newFilters, page: 1 });
  };

  return (
    <div>
      <FilterForm 
        filters={currentFilters}
        onFilter={handleFilter}
      />
      <ProductList items={items} />
    </div>
  );
};
```

## 🔐 Seguridad

- Headers de autenticación automáticos
- Validación de campos requeridos
- Manejo de errores 401/403 con redirect automático
- API Key incluida en todas las peticiones

## 🚀 Performance

- Actualización optimista para mejor UX
- Retry automático en errores de red
- Estado de loading granular por operación
- Normalización automática de respuestas

## 📈 Escalabilidad

- Agregar nuevos modelos solo requiere configuración
- Reutilización completa de lógica
- Mantiene compatibilidad con código existente
- Fácil testing y debugging
