/**
 * Clase base para todas las API classes
 * Proporciona funcionalidad común y manejo de errores consistente
 */
export class BaseAPI {
  constructor(httpClient, basePath) {
    this.http = httpClient;
    this.basePath = basePath;
  }

  /**
   * Construir URL completa con el basePath
   * @param {string} endpoint - Endpoint específico
   * @returns {string} URL completa
   */
  buildUrl(endpoint = '') {
    return `${this.basePath}${endpoint}`;
  }

  /**
   * Manejo consistente de errores
   * @param {Error} error - Error original
   * @param {string} operation - Operación que falló
   * @returns {Error} Error procesado
   */
  handleError(error, operation = 'API operation') {
    console.error(`❌ ${operation} failed:`, error);
    
    // Si es un error de respuesta HTTP
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      const apiError = new Error(
        data?.message || 
        data?.error || 
        `${operation} failed with status ${status}`
      );
      
      apiError.status = status;
      apiError.data = data;
      apiError.originalError = error;
      
      return apiError;
    }
    
    // Si es un error de red
    if (error.request) {
      const networkError = new Error('Network error - please check your connection');
      networkError.isNetworkError = true;
      networkError.originalError = error;
      return networkError;
    }
    
    // Error genérico
    const genericError = new Error(error.message || `${operation} failed`);
    genericError.originalError = error;
    return genericError;
  }

  /**
   * Normalizar respuesta de la API
   * @param {Object} response - Respuesta de axios
   * @returns {Object} Datos normalizados
   */
  normalizeResponse(response) {
    const data = response.data;
    
    // Si la respuesta tiene formato de DecorLujo con data.data
    if (data.data && typeof data.data === 'object') {
      return data.data;
    }
    
    // Si la respuesta es directa
    return data;
  }

  /**
   * Normalizar respuesta de lista con paginación
   * @param {Object} response - Respuesta de axios
   * @returns {Object} Lista normalizada con paginación
   */
  normalizeListResponse(response) {
    const data = response.data;
    
    // Si la respuesta tiene formato de DecorLujo con data.data.items
    if (data.data && data.data.items && Array.isArray(data.data.items)) {
      const pagination = data.data.pagination || {};
      return {
        items: data.data.items,
        pagination: {
          total: pagination.total || data.data.items.length,
          page: pagination.current_page || 1,
          pageSize: pagination.per_page || 20,
          totalPages: pagination.last_page || Math.ceil((pagination.total || data.data.items.length) / (pagination.per_page || 20))
        }
      };
    }
    
    // Si la respuesta tiene formato de paginación Laravel estándar
    if (data.data && Array.isArray(data.data)) {
      return {
        items: data.data,
        pagination: {
          total: data.total || data.data.length,
          page: data.current_page || 1,
          pageSize: data.per_page || 20,
          totalPages: data.last_page || Math.ceil((data.total || data.data.length) / (data.per_page || 20))
        }
      };
    }
    
    // Si la respuesta es un array simple
    if (Array.isArray(data)) {
      return {
        items: data,
        pagination: {
          total: data.length,
          page: 1,
          pageSize: data.length,
          totalPages: 1
        }
      };
    }
    
    // Fallback - intentar adaptarse a cualquier formato
    return {
      items: data.items || data.results || [data],
      pagination: {
        total: data.total || data.count || 1,
        page: data.page || data.current_page || 1,
        pageSize: data.pageSize || data.per_page || 20,
        totalPages: data.totalPages || data.last_page || 1
      }
    };
  }

  /**
   * Construir parámetros de query
   * @param {Object} params - Parámetros
   * @returns {Object} Parámetros limpios
   */
  buildParams(params = {}) {
    const cleanParams = {};
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        cleanParams[key] = value;
      }
    });
    
    return cleanParams;
  }
}

export default BaseAPI;
