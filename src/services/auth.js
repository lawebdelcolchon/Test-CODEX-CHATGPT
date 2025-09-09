const STORAGE_KEY = 'cpanel_admin_user';
const REMEMBER_ME_KEY = 'cpanel_admin_remember';
const TOKEN_KEY = 'cpanel_admin_token';

// Configuración API DecorLujo
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const STORE_ID = import.meta.env.VITE_STORE_ID;

// Debug: Verificar configuración
console.log('Auth Service Config:', {
  API_BASE_URL,
  API_KEY: API_KEY ? API_KEY.substring(0, 8) + '...' : 'NOT FOUND',
  STORE_ID,
  viteEnv: import.meta.env,
  hasViteVars: !!import.meta.env.VITE_API_BASE_URL
});

// Obtener token JWT almacenado
const getStoredToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Función para construir los headers de la API
const getHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-API-KEY': API_KEY,  // Identifica tu tienda en DecorLujo (usar mayúsculas como Postman)
  };
  
  if (includeAuth) {
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`; // JWT para usuario
    }
  }
  
  return headers;
};

// Manejo de errores específicos de Laravel
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

// Función para manejo genérico de peticiones API
const apiRequest = async (endpoint, options = {}) => {
  console.log('🚀 API REQUEST: Called with:', { endpoint, method: options.method || 'GET', API_BASE_URL });
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const includeAuth = options.requireAuth !== false;
    const headers = getHeaders(includeAuth);
    
    console.log('🎯 API REQUEST: Full request details:', {
      url,
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.parse(options.body) : null
    });
    
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body,
    });
    
    const data = await response.json();
    
    console.log('📡 API REQUEST: Response details:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      data
    });
    
    if (response.ok) {
      return {
        success: true,
        data,
        status: response.status
      };
    }
    
    return handleApiError(response, data);
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      error: error.message || 'Error de conexión con el servidor'
    };
  }
};

// Permisos basados en rol del backend DecorLujo
const getRolePermissions = (role) => {
  switch (role) {
    case 'admin':
    case 'administrator':
      return ['all']; // Acceso total
    
    case 'super_admin':
      return ['all', 'system']; // Super administrador
    
    case 'manager':
      return ['products', 'orders', 'customers', 'inventory', 'reports'];
    
    case 'employee':
    case 'user':
      return ['products', 'orders', 'customers'];
    
    case 'cliente':
    case 'customer':
    default:
      return ['profile']; // Solo su perfil
  }
};

export const login = async (user, password, rememberMe = false) => {
  console.log('🔐 AUTH SERVICE: login() called with:', { user, rememberMe });
  
  // Request a API real de DecorLujo
  console.log('🌐 AUTH SERVICE: Making API request to /login');
  const result = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ 
      user, 
      password,
      device_name: 'mi_dispositivo'
    }),
    requireAuth: false
  });

  console.log('📝 AUTH SERVICE: API Response:', result);

  // Procesar respuesta de DecorLujo
  if (result.success && result.data.status === 'success') {
    const user = result.data.data.user; // Estructura correcta: data.data.user
    const token = result.data.token;
    
    console.log('👤 AUTH SERVICE: User data from API:', user);
    
    // Preparar datos para localStorage
    const userData = {
      id: user.id,                                    // ID real del backend
      email: user.email,                              // Email verificado
      name: user.name,                                // Nombre real
      user: user.user,                                // Username
      role: user.profile?.admin ? 'admin' : 'user',   // Determinar rol basado en perfil
      store_id: user.store?.id || parseInt(STORE_ID), // ID de tienda del usuario
      store_name: user.store?.name || 'Unknown Store', // Nombre de la tienda
      avatar: user.avatar || null,                    // Avatar del usuario
      profile: user.profile,                          // Perfil completo
      permissions: getRolePermissions(user.profile?.admin ? 'admin' : 'user'), // Permisos basados en rol
      loginTime: new Date().toISOString(),            // Timestamp para expiración
    };
    
    // Almacenar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, token);     // JWT real de DecorLujo
    
    // Manejar "recordarme"
    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
    
    return { success: true, user: userData };
  }
  
  // Manejar errores específicos de la API
  return result;
};

export const logout = async () => {
  try {
    // Intentar revocar el token en el servidor
    const token = getStoredToken();
    if (token) {
      await apiRequest('/logout', {
        method: 'POST',
        requireAuth: true
      });
    }
  } catch (error) {
    console.warn('Error al cerrar sesión en el servidor:', error);
  } finally {
    // Siempre limpiar el localStorage, incluso si falla la API
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }
  
  return { success: true };
};

export const getUser = () => {
  try {
    const user = localStorage.getItem(STORAGE_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const isAuthenticated = () => {
  // Verificar tanto el usuario como el token JWT
  return !!getUser() && !!getStoredToken();
};

export const isRemembered = () => {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
};

export const hasPermission = (permission) => {
  const user = getUser();
  if (!user || !user.permissions) return false;
  
  return user.permissions.includes('all') || user.permissions.includes(permission);
};

export const forgotPassword = async (email) => {
  // Enviar solicitud de recuperación de contraseña a la API real
  const result = await apiRequest('/password/forgot', {
    method: 'POST',
    body: JSON.stringify({ 
      email,
      store_id: STORE_ID 
    }),
    requireAuth: false
  });

  if (result.success) {
    return { 
      success: true, 
      message: result.data.message || 'Se ha enviado un enlace de recuperación a tu correo electrónico' 
    };
  }
  
  return result;
};

export const updateProfile = async (userData) => {
  const currentUser = getUser();
  if (!currentUser) {
    return { success: false, error: 'Usuario no autenticado' };
  }
  
  // Enviar actualización a la API
  const result = await apiRequest('/profile/update', {
    method: 'POST',
    body: JSON.stringify({
      ...userData,
      store_id: STORE_ID
    }),
    requireAuth: true
  });

  if (result.success) {
    // Actualizar datos en localStorage manteniendo información crítica
    const updatedUser = {
      ...currentUser,
      ...result.data.user,
      id: currentUser.id, // Mantener ID original
      role: currentUser.role, // Mantener rol original
      permissions: currentUser.permissions, // Mantener permisos originales
      loginTime: currentUser.loginTime // Mantener tiempo de inicio de sesión
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    
    return { success: true, user: updatedUser };
  }
  
  return result;
};

export const changePassword = async (currentPassword, newPassword, passwordConfirmation) => {
  const currentUser = getUser();
  if (!currentUser) {
    return { success: false, error: 'Usuario no autenticado' };
  }
  
  // Enviar cambio de contraseña a la API
  const result = await apiRequest('/password/change', {
    method: 'POST',
    body: JSON.stringify({
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: passwordConfirmation || newPassword,
      store_id: STORE_ID
    }),
    requireAuth: true
  });

  return result.success 
    ? { success: true, message: result.data.message || 'Contraseña actualizada exitosamente' }
    : result;
};

export const validateSession = () => {
  const user = getUser();
  const token = getStoredToken();
  
  if (!user || !token) return false;
  
  // Verificar si la sesión no es muy antigua (opcional)
  const loginTime = new Date(user.loginTime);
  const now = new Date();
  const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
  
  // Obtener los tiempos de expiración de variables de entorno o usar valores por defecto
  const sessionTimeout = parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '8');
  const rememberTimeout = parseInt(import.meta.env.VITE_REMEMBER_TIMEOUT || '720');
  
  // Si no está marcado "recordarme" y han pasado más de X horas, cerrar sesión
  if (!isRemembered() && hoursSinceLogin > sessionTimeout) {
    logout();
    return false;
  }
  
  // Si está marcado "recordarme" pero han pasado más de Y días, cerrar sesión
  if (isRemembered() && hoursSinceLogin > rememberTimeout) {
    logout();
    return false;
  }
  
  return true;
};

// Validación de token con el servidor
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
    console.warn('No se pudo validar el token con el servidor:', error);
    return validateSession(); // Caer en validación local
  }
};

// Obtener perfil actualizado del servidor
export const getProfile = async () => {
  return await apiRequest('/profile', {
    method: 'GET',
    requireAuth: true
  });
};

// Registro de usuario
export const register = async (userData) => {
  return await apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify({
      ...userData,
      store_id: STORE_ID
    }),
    requireAuth: false
  });
};

// Reseteo de contraseña
export const resetPassword = async (email, token, password, passwordConfirmation) => {
  return await apiRequest('/password/reset', {
    method: 'POST',
    body: JSON.stringify({
      email,
      token,
      password,
      password_confirmation: passwordConfirmation,
      store_id: STORE_ID
    }),
    requireAuth: false
  });
};

// Función legacy para compatibilidad
export const currentUser = getUser;
