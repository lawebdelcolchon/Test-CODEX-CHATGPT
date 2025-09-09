// 🔐 Servicio de Autenticación Actualizado - DecorLujo API
// Reemplazo para src/services/auth.js

// Configuración de la API desde variables de entorno
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://decorlujo.com/server_api/api';
const API_KEY = process.env.REACT_APP_API_KEY || 'YOUR_API_KEY_HERE';

// Claves de almacenamiento
const STORAGE_KEY = 'cpanel_admin_user';
const TOKEN_KEY = 'cpanel_admin_token';
const REMEMBER_ME_KEY = 'cpanel_admin_remember';

/**
 * Obtiene los headers por defecto para las peticiones
 * @param {boolean} includeAuth - Si incluir el token de autenticación
 * @returns {Object} Headers configurados
 */
const getHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Configurar según el nombre correcto del header para ApiKeyAuth
    'X-API-Key': API_KEY, // Puede ser 'Authorization', 'X-Store-Key', etc.
  };
  
  if (includeAuth) {
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

/**
 * Obtiene el token almacenado
 * @returns {string|null} Token o null
 */
const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
  }
};

/**
 * Maneja errores de respuesta de la API
 * @param {Response} response - Respuesta de fetch
 * @param {Object} data - Datos parseados de la respuesta
 * @returns {Object} Objeto de error formateado
 */
const handleApiError = (response, data) => {
  const errorMessage = data?.message || data?.error || 'Error de conexión';
  
  switch (response.status) {
    case 401:
      return { success: false, error: 'Credenciales inválidas' };
    case 422:
      // Errores de validación Laravel
      const validationErrors = data?.errors || {};
      const firstError = Object.values(validationErrors)[0];
      return { 
        success: false, 
        error: firstError?.[0] || 'Datos inválidos',
        validationErrors 
      };
    case 404:
      return { success: false, error: 'Recurso no encontrado' };
    case 500:
      return { success: false, error: 'Error interno del servidor' };
    default:
      return { success: false, error: errorMessage };
  }
};

/**
 * Realiza una petición a la API
 * @param {string} endpoint - Endpoint de la API (sin /api)
 * @param {Object} options - Opciones de fetch
 * @returns {Promise<Object>} Respuesta procesada
 */
const apiRequest = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(options.requireAuth),
        ...options.headers,
      },
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      data = {};
    }

    if (!response.ok) {
      return handleApiError(response, data);
    }

    return { success: true, data };
  } catch (error) {
    console.error('API request error:', error);
    return { 
      success: false, 
      error: error.message || 'Error de conexión. Verifica tu conexión a internet.' 
    };
  }
};

// ==================== FUNCIONES PÚBLICAS ====================

/**
 * Inicia sesión con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @param {boolean} rememberMe - Si recordar la sesión
 * @returns {Promise<Object>} Resultado de la operación
 */
export const login = async (email, password, rememberMe = false) => {
  const result = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (result.success && result.data.status === 'success') {
    const { user, token } = result.data;
    
    // Preparar datos del usuario para almacenamiento
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      store_id: user.store_id,
      permissions: getRolePermissions(user.role),
      loginTime: new Date().toISOString(),
    };
    
    // Almacenar datos
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, token);
    
    // Gestionar "recordarme"
    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
    
    return { success: true, user: userData };
  }
  
  return result;
};

/**
 * Registra un nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} Resultado de la operación
 */
export const register = async (userData) => {
  const result = await apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      password_confirmation: userData.passwordConfirmation,
      role: userData.role || 'cliente',
      store_id: userData.storeId,
    }),
  });

  if (result.success && result.data.status === 'success') {
    const { user, token } = result.data;
    
    // Almacenar automáticamente después del registro
    const userDataForStorage = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      store_id: user.store_id,
      permissions: getRolePermissions(user.role),
      loginTime: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userDataForStorage));
    localStorage.setItem(TOKEN_KEY, token);
    
    return { success: true, user: userDataForStorage };
  }
  
  return result;
};

/**
 * Cierra la sesión del usuario
 * @returns {Promise<Object>} Resultado de la operación
 */
export const logout = async () => {
  const result = await apiRequest('/logout', {
    method: 'POST',
    requireAuth: true,
  });

  // Limpiar almacenamiento local independientemente del resultado de la API
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
  
  return { success: true };
};

/**
 * Obtiene el perfil del usuario autenticado
 * @returns {Promise<Object>} Resultado de la operación
 */
export const getProfile = async () => {
  const result = await apiRequest('/profile', {
    method: 'GET',
    requireAuth: true,
  });

  if (result.success && result.data.status === 'success') {
    const { user } = result.data;
    
    // Actualizar datos almacenados
    const currentUser = getUser();
    const updatedUser = {
      ...currentUser,
      ...user,
      permissions: getRolePermissions(user.role),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    
    return { success: true, user: updatedUser };
  }
  
  return result;
};

/**
 * Solicita reseteo de contraseña
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} Resultado de la operación
 */
export const forgotPassword = async (email) => {
  const result = await apiRequest('/password/forgot', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  if (result.success) {
    return { 
      success: true, 
      message: result.data.message || 'Se ha enviado un enlace de recuperación a tu correo electrónico' 
    };
  }
  
  return result;
};

/**
 * Restablece la contraseña usando un token
 * @param {string} email - Email del usuario
 * @param {string} token - Token de reseteo
 * @param {string} password - Nueva contraseña
 * @param {string} passwordConfirmation - Confirmación de contraseña
 * @returns {Promise<Object>} Resultado de la operación
 */
export const resetPassword = async (email, token, password, passwordConfirmation) => {
  const result = await apiRequest('/password/reset', {
    method: 'POST',
    body: JSON.stringify({
      email,
      token,
      password,
      password_confirmation: passwordConfirmation,
    }),
  });

  if (result.success) {
    return { 
      success: true, 
      message: result.data.message || 'Contraseña restablecida exitosamente' 
    };
  }
  
  return result;
};

/**
 * Actualiza el perfil del usuario
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise<Object>} Resultado de la operación
 */
export const updateProfile = async (userData) => {
  // Esta función podría necesitar un endpoint específico en la API
  // Por ahora, simular actualizando solo localmente
  const currentUser = getUser();
  if (!currentUser) {
    return { success: false, error: 'Usuario no autenticado' };
  }
  
  const updatedUser = {
    ...currentUser,
    ...userData,
    id: currentUser.id, // No permitir cambio de ID
    role: currentUser.role, // No permitir cambio de rol
    store_id: currentUser.store_id, // No permitir cambio de tienda
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
  
  return { success: true, user: updatedUser };
};

/**
 * Cambia la contraseña del usuario
 * @param {string} currentPassword - Contraseña actual
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<Object>} Resultado de la operación
 */
export const changePassword = async (currentPassword, newPassword) => {
  // Esta función necesitaría un endpoint específico en la API
  // Por ahora, retornar error indicando que no está implementado
  return { 
    success: false, 
    error: 'Cambio de contraseña no implementado. Usa el reseteo de contraseña.' 
  };
};

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Obtiene el usuario almacenado
 * @returns {Object|null} Usuario o null
 */
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

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} True si está autenticado
 */
export const isAuthenticated = () => {
  const user = getUser();
  const token = getStoredToken();
  return !!(user && token);
};

/**
 * Verifica si está marcado "recordarme"
 * @returns {boolean} True si está marcado
 */
export const isRemembered = () => {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
};

/**
 * Verifica si el usuario tiene un permiso específico
 * @param {string} permission - Permiso a verificar
 * @returns {boolean} True si tiene el permiso
 */
export const hasPermission = (permission) => {
  const user = getUser();
  if (!user || !user.permissions) return false;
  
  return user.permissions.includes('all') || user.permissions.includes(permission);
};

/**
 * Obtiene los permisos según el rol
 * @param {string} role - Rol del usuario
 * @returns {Array<string>} Array de permisos
 */
const getRolePermissions = (role) => {
  switch (role) {
    case 'admin':
    case 'administrator':
      return ['all'];
    case 'manager':
      return ['products', 'orders', 'customers', 'inventory', 'reports'];
    case 'employee':
      return ['products', 'orders', 'customers'];
    case 'cliente':
    case 'customer':
    default:
      return ['profile'];
  }
};

/**
 * Valida la sesión actual
 * @returns {boolean} True si la sesión es válida
 */
export const validateSession = () => {
  const user = getUser();
  const token = getStoredToken();
  
  if (!user || !token) {
    return false;
  }
  
  // Verificar expiración basada en tiempo de login
  const loginTime = new Date(user.loginTime);
  const now = new Date();
  const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
  
  // Si no está marcado "recordarme" y han pasado más de 8 horas
  if (!isRemembered() && hoursSinceLogin > 8) {
    logout();
    return false;
  }
  
  // Si está marcado "recordarme" pero han pasado más de 30 días
  if (isRemembered() && hoursSinceLogin > (30 * 24)) {
    logout();
    return false;
  }
  
  return true;
};

// Función legacy para compatibilidad
export const currentUser = getUser;

// ==================== CONFIGURACIÓN ====================

/**
 * Obtiene la configuración actual
 * @returns {Object} Configuración actual
 */
export const getConfig = () => {
  return {
    apiBaseUrl: API_BASE_URL,
    apiKey: API_KEY ? '***' + API_KEY.slice(-4) : 'No configurada',
    isConfigured: !!(API_BASE_URL && API_KEY && API_KEY !== 'YOUR_API_KEY_HERE'),
  };
};

/**
 * Verifica si la configuración de la API está completa
 * @returns {boolean} True si está configurada
 */
export const isApiConfigured = () => {
  return !!(API_BASE_URL && API_KEY && API_KEY !== 'YOUR_API_KEY_HERE');
};

// Log de configuración para desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:', {
    baseUrl: API_BASE_URL,
    hasApiKey: !!API_KEY && API_KEY !== 'YOUR_API_KEY_HERE',
    apiKeyPreview: API_KEY ? `***${API_KEY.slice(-4)}` : 'No configurada'
  });
}
