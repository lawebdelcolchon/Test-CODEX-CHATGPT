# 🚀 Guía de Integración con API Real - DecorLujo

## 📋 Resumen

Esta guía te ayudará a migrar tu sistema de autenticación mock actual a la API real de DecorLujo en **https://decorlujo.com/server_api/api/documentation**

## 🔧 **Paso 1: Configuración de Variables de Entorno**

### 1.1 Crear archivo .env
```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

### 1.2 Configurar variables en .env
```env
# URL base de la API
REACT_APP_API_BASE_URL=https://decorlujo.com/server_api/api

# API Key de tu tienda (obtener de DecorLujo)
REACT_APP_API_KEY=tu_api_key_aqui

# ID de la tienda (opcional)
REACT_APP_STORE_ID=1
```

### 1.3 Verificar .gitignore
```gitignore
# Ya debería estar incluido
.env
.env.local
.env.production
```

## 🔄 **Paso 2: Reemplazar Servicio de Autenticación**

### 2.1 Respaldar servicio actual
```bash
# Respaldar el servicio actual
mv src/services/auth.js src/services/auth-mock.js.bak
```

### 2.2 Instalar nuevo servicio
```bash
# Copiar el servicio actualizado
cp auth-service-updated.js src/services/auth.js
```

## 📡 **Paso 3: Actualizar AuthSlice (si es necesario)**

El `authSlice.js` actual debería seguir funcionando, pero puedes necesitar pequeños ajustes:

### 3.1 Verificar manejo de errores mejorado
```javascript
// src/store/slices/authSlice.js
// Actualizar si necesitas manejar errores de validación específicos

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password, rememberMe }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password, rememberMe);
      if (response.success) {
        return response.user;
      } else {
        // Ahora maneja errores de validación de Laravel
        return rejectWithValue({
          message: response.error,
          validationErrors: response.validationErrors || {}
        });
      }
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Error de conexión'
      });
    }
  }
);
```

## 🧪 **Paso 4: Testing y Verificación**

### 4.1 Verificar configuración
```javascript
// En la consola del navegador (modo desarrollo)
import { getConfig } from './src/services/auth.js';
console.log(getConfig());

// Debería mostrar:
// {
//   apiBaseUrl: "https://decorlujo.com/server_api/api",
//   apiKey: "***xyz123", // últimos 4 caracteres
//   isConfigured: true
// }
```

### 4.2 Probar endpoints básicos
```bash
# Probar que la API responde (PowerShell)
Invoke-WebRequest -Uri "https://decorlujo.com/server_api/api/login" -Method POST -ContentType "application/json"
# Debería devolver 401 (no credenciales) en lugar de 404
```

## 🔑 **Paso 5: Obtener API Key Real**

### 5.1 Contactar DecorLujo
- Necesitarás contactar al equipo de DecorLujo para obtener:
  - **API Key** válida para tu tienda
  - **Store ID** (si aplica)
  - Documentación adicional específica

### 5.2 Configurar headers correctos
Puede que necesites ajustar el nombre del header para la API Key:

```javascript
// En src/services/auth.js, línea ~23
const getHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Ajustar según la documentación real:
    'X-API-Key': API_KEY,        // Opción 1
    // 'X-Store-Key': API_KEY,   // Opción 2
    // 'Authorization': `Api ${API_KEY}`, // Opción 3
  };
  // ...
};
```

## 🐛 **Paso 6: Debugging y Troubleshooting**

### 6.1 Verificar network requests
1. Abrir DevTools → Network
2. Intentar login
3. Verificar:
   - ✅ Request URL correcta
   - ✅ Headers incluyen API Key
   - ✅ Response format correcto

### 6.2 Logs de desarrollo
El servicio incluye logs automáticos en modo desarrollo:
```javascript
// Aparecerá en consola automáticamente
🔧 API Configuration: {
  baseUrl: "https://decorlujo.com/server_api/api",
  hasApiKey: true,
  apiKeyPreview: "***xyz123"
}
```

### 6.3 Errores comunes y soluciones

#### Error 401: "Unauthorized"
```bash
Solución:
- Verificar que REACT_APP_API_KEY está configurada
- Verificar que el header name es correcto
- Contactar DecorLujo para validar la API Key
```

#### Error 422: "Validation Error"
```bash
Solución:
- Verificar format de email
- Verificar campos requeridos (password, etc.)
- Ver response.validationErrors para detalles específicos
```

#### Error CORS
```bash
Solución:
- DecorLujo debe configurar CORS para tu dominio
- En desarrollo: http://localhost:3000
- En producción: tu dominio real
```

## 📊 **Paso 7: Funciones Disponibles**

### 7.1 Funciones de Autenticación
```javascript
import * as authService from '../services/auth.js';

// Login
const result = await authService.login(email, password, rememberMe);

// Register (si tienes permisos)
const result = await authService.register({
  name: 'Juan Pérez',
  email: 'juan@example.com', 
  password: 'password123',
  passwordConfirmation: 'password123',
  role: 'cliente',
  storeId: 1
});

// Logout
const result = await authService.logout();

// Get Profile
const result = await authService.getProfile();

// Forgot Password
const result = await authService.forgotPassword(email);

// Reset Password
const result = await authService.resetPassword(email, token, password, confirmPassword);
```

### 7.2 Funciones de Utilidad
```javascript
// Verificar autenticación
const isAuth = authService.isAuthenticated();

// Obtener usuario actual
const user = authService.getUser();

// Verificar permisos
const canEdit = authService.hasPermission('products');

// Validar sesión
const isValid = authService.validateSession();

// Obtener configuración
const config = authService.getConfig();
```

## 🔄 **Paso 8: Rollback (si es necesario)**

Si algo sale mal, puedes revertir fácilmente:

```bash
# Restaurar servicio original
mv src/services/auth-mock.js.bak src/services/auth.js

# Eliminar configuración
rm .env
```

## ⚡ **Paso 9: Optimizaciones Post-Integración**

### 9.1 Interceptor para token expirado
```javascript
// Agregar en apiRequest() si es necesario
if (response.status === 401 && includeAuth) {
  // Token expirado, redirect a login
  localStorage.clear();
  window.location.href = '/login';
}
```

### 9.2 Cache de perfil
```javascript
// Implementar cache para evitar llamadas innecesarias a /profile
const PROFILE_CACHE_KEY = 'cached_profile';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
```

### 9.3 Retry automático
```javascript
// Agregar retry para requests que fallan por red
const retryRequest = async (url, options, maxRetries = 3) => {
  // Implementación con retry exponential backoff
};
```

## 🎯 **Checklist Final**

- [ ] Variables de entorno configuradas
- [ ] API Key obtenida de DecorLujo
- [ ] Servicio auth.js reemplazado
- [ ] Login funciona correctamente
- [ ] Headers correctos configurados
- [ ] Errores manejados apropiadamente
- [ ] Logs de desarrollo visibles
- [ ] CORS configurado por DecorLujo
- [ ] Testing en diferentes escenarios
- [ ] Backup del código original

## 🆘 **Soporte**

Si encuentras problemas:

1. **Revisar logs de consola** para errores específicos
2. **Verificar Network tab** para ver requests/responses
3. **Contactar DecorLujo** para soporte de API
4. **Revisar documentación** en https://decorlujo.com/server_api/api/documentation

---

¡Con esta integración tendrás un sistema de autenticación completamente funcional conectado a la API real de DecorLujo! 🚀
