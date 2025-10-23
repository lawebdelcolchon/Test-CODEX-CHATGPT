import { BaseAPI } from './BaseAPI.js';
import httpClient from '../httpClient.js';

/**
 * API class específica para atributos
 * Maneja todas las operaciones relacionadas con atributos
 */
export class AttributesAPI extends BaseAPI {
  constructor() {
    super(httpClient, '/attributes');
  }

  /**
   * Obtener todos los atributos con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Lista de atributos con paginación
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
        visible: params.visible,
        parent_id: params.parentId || params.parent_id,
        level: params.level,
        utilities: params.utilities,
        ...params.filters
      });

      console.log('🔍 AttributesAPI.getAll called with params:', cleanParams);

      const response = await this.http.get(this.buildUrl(), { 
        params: cleanParams 
      });
      
      const result = this.normalizeListResponse(response);
      console.log('✅ AttributesAPI.getAll result:', result);
      
      return result;
    } catch (error) {
      throw this.handleError(error, 'Get all attributes');
    }
  }

  /**
   * Obtener un atributo por ID
   * @param {number|string} id - ID del atributo
   * @returns {Promise<Object>} Atributo encontrado
   */
  async getById(id) {
    try {
      console.log('🔍 AttributesAPI.getById called with id:', id);
      
      const response = await this.http.get(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ AttributesAPI.getById result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Get attribute ${id}`);
    }
  }

  /**
   * Crear nuevo atributo
   * @param {Object} attributeData - Datos del atributo
   * @returns {Promise<Object>} Atributo creado
   */
  async create(attributeData) {
    try {
      console.log('✨ AttributesAPI.create called with data:', attributeData);
      
      // Validaciones específicas para atributos
      if (!attributeData.name || !attributeData.name.trim()) {
        throw new Error('El nombre del atributo es requerido');
      }

      // Transformar datos para la API
      const transformedData = this.transformForAPI(attributeData);
      
      const response = await this.http.post(this.buildUrl(), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ AttributesAPI.create result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, 'Create attribute');
    }
  }

  /**
   * Actualizar atributo existente
   * @param {number|string} id - ID del atributo
   * @param {Object} attributeData - Datos actualizados
   * @returns {Promise<Object>} Atributo actualizado
   */
  async update(id, attributeData) {
    try {
      console.log('📝 AttributesAPI.update called with id:', id, 'data:', attributeData);
      
      // Transformar datos para la API
      const transformedData = this.transformForAPI(attributeData);
      
      const response = await this.http.put(this.buildUrl(`/${id}`), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ AttributesAPI.update result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Update attribute ${id}`);
    }
  }

  /**
   * Eliminar atributo
   * @param {number|string} id - ID del atributo
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async delete(id) {
    try {
      console.log('🗑️ AttributesAPI.delete called with id:', id);
      
      const response = await this.http.delete(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ AttributesAPI.delete result:', result);
      return { ...result, id: parseInt(id) };
    } catch (error) {
      throw this.handleError(error, `Delete attribute ${id}`);
    }
  }

  /**
   * Obtener atributos activos solamente
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de atributos activos
   */
  async getActive(params = {}) {
    return this.getAll({ ...params, active: true });
  }

  /**
   * Obtener atributos visibles solamente
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de atributos visibles
   */
  async getVisible(params = {}) {
    return this.getAll({ ...params, visible: true });
  }

  /**
   * Obtener atributos por nivel
   * @param {number} level - Nivel del atributo (0 para raíz, 1+ para hijos)
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de atributos por nivel
   */
  async getByLevel(level = 0, params = {}) {
    return this.getAll({ 
      ...params, 
      level: level 
    });
  }

  /**
   * Obtener atributos por padre
   * @param {number|string} parentId - ID del padre (null para raíz)
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de atributos hijos
   */
  async getByParent(parentId = null, params = {}) {
    return this.getAll({ 
      ...params, 
      parent_id: parentId === null ? null : parentId 
    });
  }

  /**
   * Obtener atributos raíz (nivel 0, sin padre)
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de atributos raíz
   */
  async getRootAttributes(params = {}) {
    return this.getAll({ 
      ...params, 
      level: 0,
      parent_id: null
    });
  }

  /**
   * Buscar atributos por nombre
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

  /**
   * Buscar atributos por utilidades
   * @param {string} utilities - Utilidades del atributo
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Atributos filtrados por utilidades
   */
  async getByUtilities(utilities, params = {}) {
    return this.getAll({ 
      ...params, 
      utilities: utilities 
    });
  }

  /**
   * Obtener atributos relacionados con una categoría específica
   * Incluye atributos de la categoría y su árbol jerárquico
   * @param {number|string} categoryId - ID de la categoría
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de atributos relacionados
   */
  async getByCategory(categoryId, params = {}) {
    try {
      console.log('🔍 AttributesAPI.getByCategory called with categoryId:', categoryId, 'params:', params);
      
      // Usar endpoint específico si está disponible, sino filtrar por id_category
      const cleanParams = this.buildParams({
        page: params.page || 1,
        per_page: params.pageSize || params.limit || 100, // Más elementos para selectores
        sort: params.sort || 'name',
        order: params.order || 'asc',
        active: params.active !== undefined ? params.active : true, // Por defecto solo activos
        id_category: categoryId,
        ...params.filters
      });
      
      const response = await this.http.get(this.buildUrl(), { 
        params: cleanParams 
      });
      
      const result = this.normalizeListResponse(response);
      console.log('✅ AttributesAPI.getByCategory result:', result);
      
      return result;
    } catch (error) {
      throw this.handleError(error, `Get attributes by category ${categoryId}`);
    }
  }

  // Acciones personalizadas específicas para atributos

  /**
   * Activar/desactivar atributo
   * @param {number|string} id - ID del atributo
   * @param {boolean} active - Estado activo
   * @returns {Promise<Object>} Atributo actualizado
   */
  async setActive(id, active = true) {
    return this.update(id, { active });
  }

  /**
   * Mostrar/ocultar atributo
   * @param {number|string} id - ID del atributo
   * @param {boolean} visible - Estado visible
   * @returns {Promise<Object>} Atributo actualizado
   */
  async setVisible(id, visible = true) {
    return this.update(id, { visible });
  }

  /**
   * Transformar datos para envío a la API
   * @param {Object} data - Datos originales
   * @returns {Object} Datos transformados
   */
  transformForAPI(data) {
    return {
      ...data,
      active: data.active !== undefined ? Boolean(data.active) : undefined,
      visible: data.visible !== undefined ? Boolean(data.visible) : undefined,
      level: data.level !== undefined ? parseInt(data.level) : undefined,
      parent: data.parent === null || data.parent === '' ? null : parseInt(data.parent) || null,
      parent_id: data.parent_id === null || data.parent_id === '' ? null : parseInt(data.parent_id) || null,
      id_category: data.id_category === null || data.id_category === '' ? null : parseInt(data.id_category) || null,
      // Limpiar campos vacíos
      name: data.name?.trim(),
      utilities: data.utilities?.trim() || null,
      caption: data.caption?.trim() || null
    };
  }
}

// Crear instancia única para exportar
export const attributesApi = new AttributesAPI();

export default attributesApi;
