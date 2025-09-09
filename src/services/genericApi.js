import httpClient, { buildEndpointUrl, buildQueryParams, requestWithRetry } from './httpClient.js';

/**
 * Servicio API genérico que maneja operaciones CRUD para cualquier modelo
 * Estructura de endpoints: {BASE_URL}/api/{modelo}/{opciones}
 */
class GenericApiService {
  constructor() {
    this.httpClient = httpClient;
  }

  /**
   * Listar elementos de un modelo con filtros y paginación
   * GET /api/{modelo}?params
   * 
   * @param {string} modelo - Nombre del modelo (products, orders, etc.)
   * @param {Object} params - Parámetros de consulta (filtros, paginación, ordenamiento)
   * @returns {Promise} Respuesta con lista de elementos
   */
  async list(modelo, params = {}) {
    try {
      const endpoint = buildEndpointUrl(modelo);
      const queryString = buildQueryParams(params);
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;
      
      console.log(`🔍 GenericAPI: Listing ${modelo}`, { url, params });
      
      const response = await requestWithRetry(
        () => this.httpClient.get(url)
      );
      
      // Normalizar la respuesta para que sea compatible con el formato esperado
      const data = response.data;
      
      console.log('🗺️ GenericAPI: Raw response structure:', {
        hasData: !!data.data,
        hasDataItems: !!data.data?.items,
        hasDataPagination: !!data.data?.pagination,
        itemsLength: data.data?.items?.length || 0
      });
      
      // Si la respuesta tiene formato de DecorLujo con data.data.items
      if (data.data && data.data.items && Array.isArray(data.data.items)) {
        const pagination = data.data.pagination || {};
        return {
          items: data.data.items,
          total: pagination.total || data.data.items.length,
          page: pagination.current_page || params.page || 1,
          pageSize: pagination.per_page || params.pageSize || 20,
          totalPages: pagination.last_page || Math.ceil((pagination.total || data.data.items.length) / (params.pageSize || 20))
        };
      }
      
      // Si la respuesta tiene formato de paginación Laravel estándar (data.data es array)
      if (data.data && Array.isArray(data.data)) {
        return {
          items: data.data,
          total: data.total || data.data.length,
          page: data.current_page || params.page || 1,
          pageSize: data.per_page || params.pageSize || 20,
          totalPages: data.last_page || Math.ceil((data.total || data.data.length) / (params.pageSize || 20))
        };
      }
      
      // Si la respuesta es un array simple
      if (Array.isArray(data)) {
        return {
          items: data,
          total: data.length,
          page: params.page || 1,
          pageSize: params.pageSize || data.length
        };
      }
      
      // Si la respuesta tiene otro formato, intentar adaptarla
      return {
        items: data.items || data.results || [data],
        total: data.total || data.count || 1,
        page: data.page || params.page || 1,
        pageSize: data.pageSize || data.per_page || params.pageSize || 20
      };
      
    } catch (error) {
      console.error(`❌ GenericAPI: Error listing ${modelo}:`, error);
      throw this.handleError(error, `Error al listar ${modelo}`);
    }
  }

  /**
   * Obtener un elemento específico por ID
   * GET /api/{modelo}/{id}
   * 
   * @param {string} modelo - Nombre del modelo
   * @param {string|number} id - ID del elemento
   * @returns {Promise} Elemento encontrado
   */
  async get(modelo, id) {
    try {
      const endpoint = buildEndpointUrl(modelo, id);
      
      console.log(`🔍 GenericAPI: Getting ${modelo} with ID ${id}`);
      
      const response = await requestWithRetry(
        () => this.httpClient.get(endpoint)
      );
      
      // Retornar directamente los datos o el objeto anidado
      return response.data.data || response.data;
      
    } catch (error) {
      console.error(`❌ GenericAPI: Error getting ${modelo} ${id}:`, error);
      throw this.handleError(error, `Error al obtener ${modelo}`);
    }
  }

  /**
   * Crear un nuevo elemento
   * POST /api/{modelo}
   * 
   * @param {string} modelo - Nombre del modelo
   * @param {Object} payload - Datos del nuevo elemento
   * @returns {Promise} Elemento creado
   */
  async create(modelo, payload) {
    try {
      const endpoint = buildEndpointUrl(modelo);
      
      console.log(`✨ GenericAPI: Creating ${modelo}`, { payload });
      
      const response = await requestWithRetry(
        () => this.httpClient.post(endpoint, payload)
      );
      
      // Retornar el elemento creado
      return response.data.data || response.data;
      
    } catch (error) {
      console.error(`❌ GenericAPI: Error creating ${modelo}:`, error);
      throw this.handleError(error, `Error al crear ${modelo}`);
    }
  }

  /**
   * Actualizar un elemento existente
   * PUT /api/{modelo}/{id}
   * 
   * @param {string} modelo - Nombre del modelo
   * @param {string|number} id - ID del elemento
   * @param {Object} payload - Datos actualizados
   * @returns {Promise} Elemento actualizado
   */
  async update(modelo, id, payload) {
    try {
      const endpoint = buildEndpointUrl(modelo, id);
      
      console.log(`📝 GenericAPI: Updating ${modelo} ${id}`, { payload });
      
      const response = await requestWithRetry(
        () => this.httpClient.put(endpoint, payload)
      );
      
      // Retornar el elemento actualizado
      return response.data.data || response.data;
      
    } catch (error) {
      console.error(`❌ GenericAPI: Error updating ${modelo} ${id}:`, error);
      throw this.handleError(error, `Error al actualizar ${modelo}`);
    }
  }

  /**
   * Eliminar un elemento
   * DELETE /api/{modelo}/{id}
   * 
   * @param {string} modelo - Nombre del modelo
   * @param {string|number} id - ID del elemento
   * @returns {Promise} Elemento eliminado o confirmación
   */
  async remove(modelo, id) {
    try {
      const endpoint = buildEndpointUrl(modelo, id);
      
      console.log(`🗑️ GenericAPI: Removing ${modelo} ${id}`);
      
      const response = await requestWithRetry(
        () => this.httpClient.delete(endpoint)
      );
      
      // Retornar confirmación o el elemento eliminado
      return response.data.data || response.data || { id, deleted: true };
      
    } catch (error) {
      console.error(`❌ GenericAPI: Error removing ${modelo} ${id}:`, error);
      throw this.handleError(error, `Error al eliminar ${modelo}`);
    }
  }

  /**
   * Acción personalizada en un modelo
   * GET/POST /api/{modelo}/{accion}/{id?}
   * 
   * @param {string} modelo - Nombre del modelo
   * @param {string} accion - Acción a realizar
   * @param {string|number} id - ID del elemento (opcional)
   * @param {Object} payload - Datos para POST (opcional)
   * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
   * @returns {Promise} Resultado de la acción
   */
  async customAction(modelo, accion, id = null, payload = null, method = 'GET') {
    try {
      const options = id ? `${accion}/${id}` : accion;
      const endpoint = buildEndpointUrl(modelo, options);
      
      console.log(`🔧 GenericAPI: Custom action ${accion} on ${modelo}`, { 
        endpoint, 
        method, 
        id, 
        payload 
      });
      
      let response;
      const requestMethod = method.toLowerCase();
      
      switch (requestMethod) {
        case 'post':
          response = await requestWithRetry(
            () => this.httpClient.post(endpoint, payload)
          );
          break;
        case 'put':
          response = await requestWithRetry(
            () => this.httpClient.put(endpoint, payload)
          );
          break;
        case 'delete':
          response = await requestWithRetry(
            () => this.httpClient.delete(endpoint)
          );
          break;
        case 'get':
        default:
          response = await requestWithRetry(
            () => this.httpClient.get(endpoint)
          );
          break;
      }
      
      return response.data.data || response.data;
      
    } catch (error) {
      console.error(`❌ GenericAPI: Error in custom action ${accion} on ${modelo}:`, error);
      throw this.handleError(error, `Error en acción ${accion} de ${modelo}`);
    }
  }

  /**
   * Búsqueda especializada
   * GET /api/{modelo}/search/{termino}
   * 
   * @param {string} modelo - Nombre del modelo
   * @param {string} termino - Término de búsqueda
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise} Resultados de búsqueda
   */
  async search(modelo, termino, params = {}) {
    return this.customAction(modelo, 'search', termino, null, 'GET');
  }

  /**
   * Manejar errores de forma consistente
   * 
   * @param {Error} error - Error original
   * @param {string} defaultMessage - Mensaje por defecto
   * @returns {Error} Error procesado
   */
  handleError(error, defaultMessage) {
    // Si ya es un error estructurado de httpClient, pasarlo directamente
    if (error.status && error.data) {
      return error;
    }
    
    // Si es un error de red
    if (error.isNetworkError) {
      return error;
    }
    
    // Crear error genérico
    const processedError = new Error(error.message || defaultMessage);
    processedError.originalError = error;
    processedError.status = error.status || 500;
    
    return processedError;
  }

  /**
   * Método para probar la conexión con un endpoint
   * 
   * @param {string} modelo - Nombre del modelo a probar
   * @returns {Promise} Estado de la conexión
   */
  async testEndpoint(modelo) {
    try {
      await this.list(modelo, { page: 1, pageSize: 1 });
      return { 
        success: true, 
        message: `Endpoint /${modelo} disponible` 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Endpoint /${modelo} no disponible: ${error.message}`,
        error 
      };
    }
  }
}

// Crear instancia única del servicio
const genericApi = new GenericApiService();

// Exportar métodos individuales para compatibilidad con mockApi
export const list = (modelo, params) => genericApi.list(modelo, params);
export const get = (modelo, id) => genericApi.get(modelo, id);
export const create = (modelo, payload) => genericApi.create(modelo, payload);
export const update = (modelo, id, payload) => genericApi.update(modelo, id, payload);
export const remove = (modelo, id) => genericApi.remove(modelo, id);
export const customAction = (modelo, accion, id, payload, method) => 
  genericApi.customAction(modelo, accion, id, payload, method);
export const search = (modelo, termino, params) => genericApi.search(modelo, termino, params);
export const testEndpoint = (modelo) => genericApi.testEndpoint(modelo);

// Exportar la instancia completa
export default genericApi;
