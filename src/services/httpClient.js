import axios from 'axios';

// Configuración desde variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');
const TOKEN_KEY = 'cpanel_admin_token';

// Función para debuggear el token
const debugToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = localStorage.getItem('cpanel_admin_user');
  console.log('🔍 Token Debug:', {
    tokenExists: !!token,
    tokenLength: token ? token.length : 0,
    tokenStart: token ? token.substring(0, 20) + '...' : 'No token',
    userExists: !!user,
    userInfo: user ? JSON.parse(user) : 'No user'
  });
  return token;
};

// Crear instancia de Axios
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-API-KEY': API_KEY,
  },
});

// Interceptor para agregar token de autenticación automáticamente
httpClient.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage con debugging
    const token = debugToken();
    
    if (token) {
      // Usar "Autorizacion" como especifica la API DecorLujo
      config.headers['Autorizacion'] = `Bearer ${token}`;
    } else {
      console.warn('🔐 No authentication token found in localStorage[' + TOKEN_KEY + ']');
    }
    
    // Debug en desarrollo
    if (import.meta.env.DEV) {
      console.log('🚀 HTTP Request:', {
        method: config.method?.toUpperCase(),
        url: config.baseURL + config.url,
        headers: {
          'Content-Type': config.headers['Content-Type'],
          'Accept': config.headers['Accept'],
          'X-API-KEY': config.headers['X-API-KEY'] ? config.headers['X-API-KEY'].substring(0, 8) + '...' : 'Missing',
          'Autorizacion': token ? `Bearer ${token.substring(0, 10)}...` : 'No token'
        },
        hasToken: !!token,
        tokenSource: 'localStorage[cpanel_admin_token]',
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
httpClient.interceptors.response.use(
  (response) => {
    // Debug en desarrollo
    if (import.meta.env.DEV) {
      console.log('✅ HTTP Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        data: response.data
      });
    }
    
    return response;
  },
  (error) => {
    // Manejo específico de errores HTTP
    if (error.response) {
      const { status, data } = error.response;
      
      console.error('❌ HTTP Error Response:', {
        status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data
      });
      
      // Manejar errores específicos
      switch (status) {
        case 401:
          // Token expirado o inválido - NO redirigir automáticamente
          console.warn('🔐 Authentication error - Token invalid or expired');
          console.warn('🔍 Current token:', localStorage.getItem(TOKEN_KEY) ? 'Present' : 'Missing');
          // NO removemos el token ni redirigimos automáticamente para debugging
          // localStorage.removeItem(TOKEN_KEY);
          // localStorage.removeItem('cpanel_admin_user');
          // window.location.href = '/login';
          break;
          
        case 403:
          console.warn('🚫 Permission denied');
          break;
          
        case 404:
          console.warn('🔍 Resource not found');
          break;
          
        case 422:
          console.warn('📝 Validation errors:', data?.errors);
          break;
          
        case 500:
          console.error('💥 Server error');
          break;
      }
      
      // Crear error personalizado con información estructurada
      const customError = new Error(data?.message || `HTTP Error ${status}`);
      customError.status = status;
      customError.data = data;
      customError.validationErrors = data?.errors;
      
      return Promise.reject(customError);
    } else if (error.request) {
      // Error de red - no hay respuesta del servidor
      console.error('🌐 Network Error:', error.message);
      const networkError = new Error('Error de conexión con el servidor');
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    } else {
      // Error en configuración de la petición
      console.error('⚙️ Request Configuration Error:', error.message);
      return Promise.reject(error);
    }
  }
);

// Función helper para construir URLs de endpoints
export const buildEndpointUrl = (model, options = '') => {
  const basePath = `/${model}`;
  return options ? `${basePath}/${options}` : basePath;
};

// Función helper para manejar parámetros de consulta
export const buildQueryParams = (params = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, value);
    }
  });
  
  return queryParams.toString();
};

// Función wrapper para peticiones con retry automático
export const requestWithRetry = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // No reintentar en errores de autenticación o validación
      if (error.status === 401 || error.status === 403 || error.status === 422) {
        throw error;
      }
      
      // No reintentar si es el último intento
      if (attempt === maxRetries) {
        break;
      }
      
      // Esperar antes del siguiente intento
      console.warn(`🔄 Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

export default httpClient;
