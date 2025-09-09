# 🔐 Cómo Funciona el Slice de Autenticación - Integrado con Backend DecorLujo

## 📚 **Introducción**

Este documento explica el funcionamiento completo del slice de autenticación en tu proyecto **cpaneladmin**, pero ahora integrado con la **API real de DecorLujo** en lugar del sistema mock. Aprenderás cómo cada parte interactúa con el backend real para proporcionar autenticación robusta y funcional.

## 🏗️ **Arquitectura de Integración**

```mermaid
graph TD
    A[Componente Login.jsx] --> B[Redux Action: loginUser]
    B --> C[Auth Slice: loginUser.pending]
    C --> D[Auth Service: login()]
    D --> E[API Request: POST /api/login]
    E --> F[DecorLujo Backend]
    F --> G[Laravel Response]
    G --> H{Éxito?}
    H -->|Sí| I[Auth Service: Procesar Usuario]
    H -->|No| J[Auth Service: Manejar Error]
    I --> K[localStorage: Guardar Token + Usuario]
    K --> L[Redux: loginUser.fulfilled]
    J --> M[Redux: loginUser.rejected]
    L --> N[Navigate to Dashboard]
    M --> O[Mostrar Error en UI]
```

## 🗃️ **Estado del Store con Backend**

### **Estado Inicial (con API Real)**
```javascript
// src/store/slices/authSlice.js
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: authService.getUser(),               // Usuario desde localStorage (puede ser null)
    loading: false,                           // Estado de carga para requests API
    error: null,                             // Errores específicos de la API
    message: null,                           // Mensajes de éxito de la API
    isAuthenticated: authService.isAuthenticated(), // Basado en token JWT válido
  },
  // ...
});
```

**Diferencias con sistema mock:**
- `user` puede contener datos reales del backend (store_id, role real, etc.)
- `error` maneja errores específicos de Laravel (validación 422, auth 401, etc.)
- `isAuthenticated` verifica tanto usuario local como token JWT válido

## ⚡ **Async Thunks con API Real**

### **1. Login con Backend**
```javascript
// src/store/slices/authSlice.js
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password, rememberMe }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password, rememberMe);
      if (response.success) {
        return response.user; // Datos reales del backend
      } else {
        return rejectWithValue({
          message: response.error,
          validationErrors: response.validationErrors || {} // Errores Laravel
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

**Flujo de Login con Backend:**
1. **UI** → dispatch `loginUser({ email, password, rememberMe })`
2. **Slice** → `loginUser.pending` → `loading = true`
3. **Service** → `authService.login()` llamada real a API
4. **Backend** → Validación en DecorLujo Laravel API
5. **Response** → Token JWT + datos de usuario real
6. **Success** → `loginUser.fulfilled` → guardar usuario + token
7. **UI** → Navigate a dashboard con usuario autenticado

### **2. Logout con Backend**
```javascript
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.logout(); // POST /api/logout
      // Limpieza local siempre se hace, independiente de respuesta API
      return true;
    } catch (error) {
      // Incluso si falla la API, limpiamos localmente
      return rejectWithValue(error.message || 'Error de conexión');
    }
  }
);
```

**Flujo de Logout con Backend:**
1. **UI** → dispatch `logoutUser()`
2. **Service** → POST `/api/logout` con Bearer token
3. **Backend** → Revoca token en servidor DecorLujo
4. **Local** → Limpia localStorage (token + usuario)
5. **Slice** → `logoutUser.fulfilled` → reset estado
6. **UI** → Redirect a login

### **3. Nuevos Thunks con API Real**

#### **Registro de Usuario**
```javascript
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        return response.user; // Auto-login después del registro
      } else {
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

#### **Actualizar Perfil (Sync con Backend)**
```javascript
export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile(); // GET /api/profile
      if (response.success) {
        return response.user; // Datos actualizados del servidor
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error de conexión');
    }
  }
);
```

#### **Reseteo de Contraseña**
```javascript
export const forgotPasswordUser = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email); // POST /api/password/forgot
      if (response.success) {
        return response.message; // Mensaje de éxito del backend
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error de conexión');
    }
  }
);

export const resetPasswordUser = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, token, password, passwordConfirmation }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(email, token, password, passwordConfirmation);
      if (response.success) {
        return response.message;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Error de conexión');
    }
  }
);
```

## 📡 **Auth Service con Backend Real**

### **Configuración de API**
```javascript
// src/services/auth.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // https://decorlujo.com/server_api/api
const API_KEY = process.env.REACT_APP_API_KEY;           // API Key de tu tienda

const getHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-API-Key': API_KEY,  // Identifica tu tienda en DecorLujo
  };
  
  if (includeAuth) {
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`; // JWT para usuario
    }
  }
  
  return headers;
};
```

### **Función Login con API Real**
```javascript
export const login = async (email, password, rememberMe = false) => {
  // 1. Request a API real
  const result = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // 2. Procesar respuesta de DecorLujo
  if (result.success && result.data.status === 'success') {
    const { user, token } = result.data;
    
    // 3. Preparar datos para localStorage
    const userData = {
      id: user.id,                              // ID real del backend
      email: user.email,                        // Email verificado
      name: user.name,                          // Nombre real
      role: user.role,                          // Rol real (admin, cliente, etc.)
      store_id: user.store_id,                  // ID de tienda en DecorLujo
      permissions: getRolePermissions(user.role), // Permisos basados en rol real
      loginTime: new Date().toISOString(),      // Timestamp para expiración
    };
    
    // 4. Almacenar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, token);     // JWT real de DecorLujo
    
    // 5. Manejar "recordarme"
    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
    
    return { success: true, user: userData };
  }
  
  // 6. Manejar errores específicos de Laravel
  return result; // { success: false, error: "mensaje", validationErrors: {...} }
};
```

### **Manejo de Errores de Laravel**
```javascript
const handleApiError = (response, data) => {
  switch (response.status) {
    case 401:
      return { success: false, error: 'Credenciales inválidas' };
    
    case 422: // Errores de validación Laravel
      const validationErrors = data?.errors || {};
      const firstError = Object.values(validationErrors)[0];
      return { 
        success: false, 
        error: firstError?.[0] || 'Datos inválidos',
        validationErrors  // Para mostrar errores específicos por campo
      };
    
    case 404:
      return { success: false, error: 'Recurso no encontrado' };
    
    case 500:
      return { success: false, error: 'Error interno del servidor' };
    
    default:
      return { success: false, error: data?.message || 'Error de conexión' };
  }
};
```

## 🔄 **ExtraReducers con Backend**

### **Login States**
```javascript
extraReducers: (builder) => {
  builder
    // Login con API real
    .addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    })
    .addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;        // Datos reales del backend
      state.isAuthenticated = true;       // Usuario autenticado con JWT
      state.error = null;
    })
    .addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || action.payload; // Error específico
      state.validationErrors = action.payload?.validationErrors || {}; // Errores Laravel
      state.user = null;
      state.isAuthenticated = false;
    })
    
    // Logout con revocación de token
    .addCase(logoutUser.fulfilled, (state) => {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.message = null;
      // Token revocado en servidor DecorLujo
    })
    
    // Registro con auto-login
    .addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;        // Auto-login después del registro
      state.isAuthenticated = true;
      state.message = 'Usuario registrado exitosamente';
      state.error = null;
    })
    
    // Actualización de perfil sincronizada
    .addCase(updateUserProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = { ...state.user, ...action.payload }; // Merge datos del servidor
      state.message = 'Perfil actualizado exitosamente';
      state.error = null;
    });
}
```

## 🛡️ **Protección de Rutas con Backend**

```javascript
// src/components/ProtectedRoute.jsx
export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();

  useEffect(() => {
    // Verificar estado con backend cuando sea necesario
    dispatch(checkAuthStatus());      // Verifica localStorage + token
    dispatch(validateSession());      // Valida expiración de token
    
    // Opcionalmente, verificar con servidor cada X tiempo
    const interval = setInterval(() => {
      if (isAuthenticated) {
        dispatch(updateUserProfile()); // Sync periódico con backend
      }
    }, 10 * 60 * 1000); // Cada 10 minutos
    
    return () => clearInterval(interval);
  }, [dispatch, isAuthenticated]);

  // Verificar token JWT válido
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect si no hay token válido
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
```

## 🎯 **Uso en Componentes con Backend**

### **Login Component**
```javascript
// src/pages/Login.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await dispatch(loginUser({
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe
    })).unwrap();
    
    // Login exitoso con backend
    navigate("/");
  } catch (error) {
    // Manejar errores específicos de Laravel
    if (error.validationErrors) {
      // Mostrar errores de validación por campo
      setFieldErrors(error.validationErrors);
    } else {
      // Error general
      console.error("Login failed:", error.message);
    }
  }
};
```

### **Error Handling Mejorado**
```javascript
// Manejo de errores específicos de Laravel
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md txt-compact-small">
    {typeof error === 'string' ? error : error.message}
    
    {/* Mostrar errores de validación específicos */}
    {error.validationErrors && (
      <ul className="mt-2 text-sm">
        {Object.entries(error.validationErrors).map(([field, messages]) => (
          <li key={field} className="text-red-600">
            {field}: {messages[0]}
          </li>
        ))}
      </ul>
    )}
  </div>
)}
```

## 🔑 **Sistema de Permisos con Backend**

### **Permisos Basados en Roles Reales**
```javascript
// src/services/auth.js
const getRolePermissions = (role) => {
  // Roles reales de DecorLujo backend
  switch (role) {
    case 'admin':
    case 'administrator':
      return ['all']; // Acceso total
    
    case 'manager':
      return ['products', 'orders', 'customers', 'inventory', 'reports'];
    
    case 'employee':
      return ['products', 'orders', 'customers'];
    
    case 'cliente':
    case 'customer':
    default:
      return ['profile']; // Solo su perfil
  }
};

export const hasPermission = (permission) => {
  const user = getUser();
  if (!user || !user.permissions) return false;
  
  return user.permissions.includes('all') || user.permissions.includes(permission);
};
```

### **Uso en Componentes**
```javascript
// Verificar permisos basados en rol del backend
const canManageProducts = hasPermission('products');
const isAdmin = hasPermission('all');

return (
  <div>
    {canManageProducts && (
      <Link to="/products/create">
        <Button>Crear Producto</Button>
      </Link>
    )}
    
    {isAdmin && (
      <Link to="/settings">
        <Button>Configuración</Button>
      </Link>
    )}
  </div>
);
```

## 🔄 **Validación de Sesiones**

### **Validación Local + Backend**
```javascript
// src/services/auth.js
export const validateSession = () => {
  const user = getUser();
  const token = getStoredToken();
  
  if (!user || !token) {
    return false;
  }
  
  // Validación de tiempo local
  const loginTime = new Date(user.loginTime);
  const now = new Date();
  const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
  
  // Políticas de expiración
  if (!isRemembered() && hoursSinceLogin > 8) {
    logout(); // Revoca token en backend también
    return false;
  }
  
  if (isRemembered() && hoursSinceLogin > (30 * 24)) {
    logout(); // Revoca token en backend también
    return false;
  }
  
  return true;
};

// Validación periódica con backend
export const validateTokenWithServer = async () => {
  try {
    const result = await apiRequest('/profile', {
      method: 'GET',
      requireAuth: true,
    });
    
    if (result.success) {
      return true; // Token válido en servidor
    } else {
      // Token expirado o inválido
      logout();
      return false;
    }
  } catch (error) {
    // Error de red, mantener token local temporalmente
    console.warn('Could not validate token with server:', error);
    return true;
  }
};
```

## 📊 **Datos del Usuario con Backend**

### **Estructura de Usuario Real**
```javascript
// Datos reales del backend DecorLujo
const user = {
  id: 123,                           // ID único en base de datos
  email: "admin@tienda.com",         // Email verificado
  name: "Juan Pérez",                // Nombre real
  role: "admin",                     // Rol asignado en backend
  store_id: 1,                       // ID de la tienda en DecorLujo
  permissions: ["all"],              // Permisos calculados
  loginTime: "2025-01-08T11:56:28Z", // Timestamp de login
  created_at: "2024-01-15T09:30:00Z", // Fecha de creación en backend
  updated_at: "2025-01-08T11:56:28Z", // Última actualización
};
```

### **Sincronización con Backend**
```javascript
// Sincronizar datos periódicamente
useEffect(() => {
  if (isAuthenticated) {
    // Actualizar perfil cada 30 minutos
    const interval = setInterval(() => {
      dispatch(updateUserProfile());
    }, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }
}, [isAuthenticated, dispatch]);
```

## 🚀 **Flujo Completo con Backend**

### **1. Inicio de Aplicación**
```javascript
// App initialization
1. Check localStorage for user + token
2. If exists: validateSession() → check expiration
3. If valid: dispatch(checkAuthStatus()) → update Redux state
4. If invalid: clear localStorage → redirect to login
```

### **2. Login Process**
```javascript
// Login flow
1. User submits form → dispatch(loginUser())
2. authService.login() → POST /api/login to DecorLujo
3. Backend validates credentials → returns JWT + user data
4. Store token + user in localStorage
5. Update Redux state → isAuthenticated: true
6. Navigate to dashboard
```

### **3. Protected Navigation**
```javascript
// Navigation flow
1. ProtectedRoute checks isAuthenticated
2. If false → redirect to login
3. If true → render protected component
4. Component may check hasPermission() for specific features
```

### **4. Logout Process**
```javascript
// Logout flow
1. User clicks logout → dispatch(logoutUser())
2. authService.logout() → POST /api/logout to revoke token
3. Clear localStorage (token + user)
4. Update Redux state → isAuthenticated: false
5. Redirect to login page
```

## 🔧 **Configuración Requerida**

### **Variables de Entorno (.env)**
```env
# API de DecorLujo
REACT_APP_API_BASE_URL=https://decorlujo.com/server_api/api
REACT_APP_API_KEY=tu_api_key_de_decorlujo
REACT_APP_STORE_ID=1

# Configuración de sesión
REACT_APP_SESSION_TIMEOUT=8
REACT_APP_REMEMBER_TIMEOUT=720
```

### **Headers de API**
```javascript
// Headers para todas las requests
{
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-API-Key': 'api_key_de_tu_tienda',    // Identifica la tienda
  'Authorization': 'Bearer jwt_token'      // Autentica al usuario
}
```

## 🎉 **Beneficios de la Integración**

### ✅ **Autenticación Real**
- Validación contra base de datos de DecorLujo
- Tokens JWT seguros con expiración real
- Roles y permisos reales del backend

### ✅ **Sincronización**
- Datos de usuario actualizados desde servidor
- Revocación de tokens en tiempo real
- Validación de sesiones server-side

### ✅ **Seguridad Mejorada**
- Doble autenticación (API Key + JWT)
- Expiración automática de tokens
- Validación de permisos en tiempo real

### ✅ **Funciones Avanzadas**
- Registro de usuarios reales
- Reseteo de contraseña por email
- Actualización de perfil sincronizada

---

**¡Con esta integración tienes un sistema de autenticación completamente funcional conectado al backend real de DecorLujo!** 🚀

El slice mantiene su simplicidad de uso pero ahora proporciona autenticación real, seguridad robusta y todas las funciones avanzadas del backend de DecorLujo.
