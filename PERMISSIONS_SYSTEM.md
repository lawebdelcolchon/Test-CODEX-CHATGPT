# 🔐 Sistema de Permisos con Switch

## 📋 Resumen
Sistema implementado para habilitar/deshabilitar la verificación de permisos en la aplicación mediante una variable de entorno.

## 🎛️ Switch de Control

### Variable de Entorno:
```bash
# En .env
VITE_ENABLE_PERMISSIONS=0   # OFF - Acceso libre para todos los usuarios
VITE_ENABLE_PERMISSIONS=1   # ON  - Solo usuarios con permisos específicos
```

### Estados del Switch:
- **OFF (0)**: 🔓 Todos los usuarios pueden acceder a todas las secciones
- **ON (1)**: 🔒 Solo usuarios con permisos específicos pueden acceder

## 🔧 Implementación

### 1. Helper Principal (`src/utils/permissions.js`)
```javascript
import { hasPermission } from '../utils/permissions.js';

// Verificar si un usuario tiene acceso
const canAccess = hasPermission(user, 'categories');
```

### 2. Uso en Componentes
```javascript
// En Categories.jsx
import { hasPermission } from '../utils/permissions.js';

const userHasAccess = hasPermission(user, 'categories');

if (isAuthenticated && userHasAccess) {
  // Cargar datos
}
```

### 3. Componente Condicional
```javascript
import { PermissionGate } from '../utils/permissions.js';

<PermissionGate requires="categories" user={user}>
  <CategoriesTable />
</PermissionGate>
```

## 🧪 Debug y Testing

### Funciones de Debug Disponibles:
```javascript
// En la consola del navegador:
window.permissionsDebug.info()     // Estado del sistema
window.permissionsDebug.enabled()  // Si están habilitados
window.permissionsDebug.check(user, 'categories') // Verificar permiso
```

### Logs del Sistema:
```javascript
// Con permisos OFF:
🔓 Permissions disabled - allowing access to all users

// Con permisos ON:
✅ Permission check: {
  required: ['categories'],
  userPermissions: ['products', 'orders'],
  hasAccess: false
}
```

## 🔄 Cómo Cambiar el Estado

### Para Desarrollo:
1. **Deshabilitar permisos** (acceso libre):
   ```bash
   # .env
   VITE_ENABLE_PERMISSIONS=0
   ```

2. **Habilitar permisos** (verificación estricta):
   ```bash
   # .env
   VITE_ENABLE_PERMISSIONS=1
   ```

3. **Reiniciar servidor**:
   ```bash
   npm run dev
   ```

### Para Producción:
- Generalmente debe estar en `VITE_ENABLE_PERMISSIONS=1`
- Solo deshabilitar temporalmente para debugging

## 📍 Archivos Modificados

### 1. `.env`
- Agregada variable `VITE_ENABLE_PERMISSIONS=0`

### 2. `src/utils/permissions.js`
- Helper principal con todas las funciones
- Switch de control centralizado
- Funciones de debug

### 3. `src/pages/Categories.jsx`
- Implementación del nuevo sistema
- Logs informativos
- Mensaje de debug con estado del switch

### 4. `src/services/auth.js`
- Función `hasPermission()` actualizada
- Verificación del switch antes de validar permisos

### 5. `src/main.jsx`
- Import del sistema de permisos
- Disponibilidad de funciones de debug

## 🎯 Beneficios

### ✅ Para Desarrollo:
- Testing sin restricciones de permisos
- Debug fácil del sistema de autenticación
- Desarrollo rápido de funcionalidades

### ✅ Para Producción:
- Control granular de acceso
- Seguridad basada en roles de usuario
- Sistema robusto de permisos

### ✅ Para Testing:
- Cambio rápido entre modos
- Logs detallados del comportamiento
- Funciones de debug en consola

## 🚨 Importante

1. **En desarrollo**: Mantener en `0` para acceso libre
2. **En producción**: Cambiar a `1` para verificación real
3. **Debug**: Usar funciones `window.permissionsDebug` para testing
4. **Logs**: Verificar consola para entender el comportamiento

## 📝 Ejemplo de Uso

```javascript
// Verificar si el usuario puede ver categories
const user = useSelector(state => state.auth.user);
const canViewCategories = hasPermission(user, 'categories');

if (canViewCategories) {
  // Mostrar categorías
} else {
  // Mostrar mensaje de acceso denegado
}
```

---

**Estado Actual**: ✅ Permisos DESHABILITADOS (`VITE_ENABLE_PERMISSIONS=0`)  
**Comportamiento**: 🔓 Todos los usuarios pueden acceder a todas las secciones
