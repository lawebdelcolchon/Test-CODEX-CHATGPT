import { BaseAPI } from './BaseAPI.js';
import httpClient from '../httpClient.js';

/**
 * API class específica para opciones
 * Maneja todas las operaciones relacionadas con opciones
 */
export class OptionsAPI extends BaseAPI {
  constructor() {
    super(httpClient, '/options');
  }

  /**
   * Obtener todas las opciones con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Lista de opciones con paginación
   */
  async getAll(params = {}) {
    try {
      const cleanParams = this.buildParams({
        page: params.page || 1,
        per_page: params.pageSize || params.limit || 20, // Laravel usa per_page
        sort: params.sort,
        order: params.order,
        search: params.search || params.q,
        active: params.active,
        id_category: params.categoryId || params.id_category,
        position: params.position,
        ...params.filters
      });

      console.log('🔍 OptionsAPI.getAll called with params:', cleanParams);

      const response = await this.http.get(this.buildUrl(), { 
        params: cleanParams 
      });
      
      const result = this.normalizeListResponse(response);
      console.log('✅ OptionsAPI.getAll result:', result);
      
      return result;
    } catch (error) {
      throw this.handleError(error, 'Get all options');
    }
  }

  /**
   * Obtener una opción por ID
   * @param {number|string} id - ID de la opción
   * @returns {Promise<Object>} Opción encontrada
   */
  async getById(id) {
    try {
      console.log('🔍 OptionsAPI.getById called with id:', id);
      
      const response = await this.http.get(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ OptionsAPI.getById result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Get option ${id}`);
    }
  }

  /**
   * Crear nueva opción
   * @param {Object} optionData - Datos de la opción
   * @returns {Promise<Object>} Opción creada
   */
  async create(optionData) {
    try {
      console.log('✨ OptionsAPI.create called with data:', optionData);
      
      // Validaciones específicas para opciones
      if (!optionData.name || !optionData.name.trim()) {
        throw new Error('El nombre de la opción es requerido');
      }

      // Transformar datos para la API
      const transformedData = this.transformForAPI(optionData);
      
      const response = await this.http.post(this.buildUrl(), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ OptionsAPI.create result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, 'Create option');
    }
  }

  /**
   * Actualizar opción existente
   * @param {number|string} id - ID de la opción
   * @param {Object} optionData - Datos actualizados
   * @returns {Promise<Object>} Opción actualizada
   */
  async update(id, optionData) {
    try {
      console.log('📝 OptionsAPI.update called with id:', id, 'data:', optionData);
      
      // Transformar datos para la API
      const transformedData = this.transformForAPI(optionData);
      console.log('🔄 OptionsAPI.transformForAPI result:', transformedData);
      
      const response = await this.http.put(this.buildUrl(`/${id}`), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ OptionsAPI.update result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Update option ${id}`);
    }
  }

  /**
   * Eliminar opción
   * @param {number|string} id - ID de la opción
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async delete(id) {
    try {
      console.log('🗑️ OptionsAPI.delete called with id:', id);
      
      const response = await this.http.delete(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ OptionsAPI.delete result:', result);
      return { ...result, id: parseInt(id) };
    } catch (error) {
      throw this.handleError(error, `Delete option ${id}`);
    }
  }

  /**
   * Obtener opciones activas solamente
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de opciones activas
   */
  async getActive(params = {}) {
    return this.getAll({ ...params, active: true });
  }

  /**
   * Obtener opciones por categoría
   * @param {number|string} categoryId - ID de la categoría
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de opciones de la categoría
   */
  async getByCategory(categoryId, params = {}) {
    return this.getAll({ 
      ...params, 
      categoryId: categoryId 
    });
  }

  /**
   * Buscar opciones por nombre
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Resultados de búsqueda
   */
  async search(searchTerm, params = {}) {
    return this.getAll({ 
      ...params, 
      search: searchTerm 
    });
  }

  // Acciones personalizadas específicas para opciones

  /**
   * Activar/desactivar opción
   * @param {number|string} id - ID de la opción
   * @param {boolean} active - Estado activo
   * @returns {Promise<Object>} Opción actualizada
   */
  async setActive(id, active = true) {
    return this.update(id, { active });
  }

  /**
   * Reordenar posición de opción
   * @param {number|string} id - ID de la opción
   * @param {number} position - Nueva posición
   * @returns {Promise<Object>} Opción actualizada
   */
  async setPosition(id, position) {
    return this.update(id, { position });
  }

  /**
   * Actualizar observaciones de opción
   * @param {number|string} id - ID de la opción
   * @param {string} observations - Nuevas observaciones
   * @returns {Promise<Object>} Opción actualizada
   */
  async updateObservations(id, observations) {
    return this.update(id, { observations });
  }

  /**
   * Transformar datos específicos de opciones para la API
   * @param {Object} data - Datos a transformar
   * @returns {Object} Datos transformados
   */
  transformForAPI(data) {
    const transformed = { ...data };

    // Limpiar campos vacíos específicos de opciones
    if (transformed.position === '' || transformed.position === null) {
      transformed.position = 0;
    }
    
    if (transformed.id_category === '' || transformed.id_category === null) {
      delete transformed.id_category;
    }

    // Convertir números
    if (typeof transformed.position === 'string') {
      transformed.position = parseInt(transformed.position) || 0;
    }
    
    if (transformed.id_category && typeof transformed.id_category === 'string') {
      transformed.id_category = parseInt(transformed.id_category) || null;
    }

    // Limpiar strings
    ['name', 'utilities', 'caption', 'observations'].forEach(field => {
      if (typeof transformed[field] === 'string') {
        transformed[field] = transformed[field].trim() || null;
      }
    });

    // Asegurar boolean
    if (typeof transformed.active !== 'undefined') {
      transformed.active = Boolean(transformed.active);
    }

    console.log('🔄 OptionsAPI.transformForAPI:', { original: data, transformed });
    return transformed;
  }
}

// Instancia exportada
export const optionsApi = new OptionsAPI();
