import { BaseAPI } from './BaseAPI.js';
import httpClient from '../httpClient.js';

/**
 * API class específica para categorías
 * Maneja todas las operaciones relacionadas con categorías
 */
export class CategoriesAPI extends BaseAPI {
  constructor() {
    super(httpClient, '/categories');
  }

  /**
   * Obtener todas las categorías con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Lista de categorías con paginación
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
        include_children: params.includeChildren,
        ...params.filters
      });

      console.log('🔍 CategoriesAPI.getAll called with params:', cleanParams);

      const response = await this.http.get(this.buildUrl(), { 
        params: cleanParams 
      });
      
      const result = this.normalizeListResponse(response);
      console.log('✅ CategoriesAPI.getAll result:', result);
      
      return result;
    } catch (error) {
      throw this.handleError(error, 'Get all categories');
    }
  }

  /**
   * Obtener una categoría por ID
   * @param {number|string} id - ID de la categoría
   * @returns {Promise<Object>} Categoría encontrada
   */
  async getById(id) {
    try {
      console.log('🔍 CategoriesAPI.getById called with id:', id);
      
      const response = await this.http.get(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ CategoriesAPI.getById result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Get category ${id}`);
    }
  }

  /**
   * Crear nueva categoría
   * @param {Object} categoryData - Datos de la categoría
   * @returns {Promise<Object>} Categoría creada
   */
  async create(categoryData) {
    try {
      console.log('✨ CategoriesAPI.create called with data:', categoryData);
      
      // Validaciones específicas para categorías
      if (!categoryData.name || !categoryData.name.trim()) {
        throw new Error('El nombre de la categoría es requerido');
      }

      // Transformar datos para la API
      const transformedData = this.transformForAPI(categoryData);
      
      const response = await this.http.post(this.buildUrl(), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ CategoriesAPI.create result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, 'Create category');
    }
  }

  /**
   * Actualizar categoría existente
   * @param {number|string} id - ID de la categoría
   * @param {Object} categoryData - Datos actualizados
   * @returns {Promise<Object>} Categoría actualizada
   */
  async update(id, categoryData) {
    try {
      // Asegurar que el ID sea un número entero
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error(`ID inválido: ${id}`);
      }
      
      console.log('📝 CategoriesAPI.update called with id:', numericId, 'original:', id, 'data:', categoryData);
      
      // Transformar datos para la API
      const transformedData = this.transformForAPI(categoryData);
      console.log('🔄 CategoriesAPI.transformForAPI result:', transformedData);
      
      const response = await this.http.put(this.buildUrl(`/${numericId}`), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ CategoriesAPI.update result:', result);
      return result;
    } catch (error) {
      console.error('❌ CategoriesAPI.update error:', error);
      throw this.handleError(error, `Update category ${id}`);
    }
  }

  /**
   * Eliminar categoría
   * @param {number|string} id - ID de la categoría
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async delete(id) {
    try {
      console.log('🗑️ CategoriesAPI.delete called with id:', id);
      
      const response = await this.http.delete(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ CategoriesAPI.delete result:', result);
      return { ...result, id: parseInt(id) };
    } catch (error) {
      throw this.handleError(error, `Delete category ${id}`);
    }
  }

  /**
   * Obtener categorías activas solamente
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de categorías activas
   */
  async getActive(params = {}) {
    return this.getAll({ ...params, active: true });
  }

  /**
   * Obtener categorías visibles solamente
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de categorías visibles
   */
  async getVisible(params = {}) {
    return this.getAll({ ...params, visible: true });
  }

  /**
   * Obtener categorías por padre
   * @param {number|string} parentId - ID del padre (null para raíz)
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de categorías hijas
   */
  async getByParent(parentId = null, params = {}) {
    return this.getAll({ 
      ...params, 
      parentId: parentId === null ? null : parentId 
    });
  }

  /**
   * Buscar categorías por nombre
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

  // Acciones personalizadas específicas para categorías

  /**
   * Activar/desactivar categoría
   * @param {number|string} id - ID de la categoría
   * @param {boolean} active - Estado activo
   * @returns {Promise<Object>} Categoría actualizada
   */
  async setActive(id, active = true) {
    return this.update(id, { active });
  }

  /**
   * Mostrar/ocultar categoría
   * @param {number|string} id - ID de la categoría
   * @param {boolean} visible - Estado visible
   * @returns {Promise<Object>} Categoría actualizada
   */
  async setVisible(id, visible = true) {
    return this.update(id, { visible });
  }

  /**
   * Mover categoría hacia arriba en el orden
   * @param {number|string} id - ID de la categoría
   * @returns {Promise<Object>} Resultado de la operación
   */
  async moveUp(id) {
    try {
      console.log('⬆️ CategoriesAPI.moveUp called with id:', id);
      
      const response = await this.http.post(this.buildUrl(`/${id}/move-up`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ CategoriesAPI.moveUp result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Move up category ${id}`);
    }
  }

  /**
   * Mover categoría hacia abajo en el orden
   * @param {number|string} id - ID de la categoría
   * @returns {Promise<Object>} Resultado de la operación
   */
  async moveDown(id) {
    try {
      console.log('⬇️ CategoriesAPI.moveDown called with id:', id);
      
      const response = await this.http.post(this.buildUrl(`/${id}/move-down`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ CategoriesAPI.moveDown result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Move down category ${id}`);
    }
  }

  /**
   * Duplicar categoría
   * @param {number|string} id - ID de la categoría a duplicar
   * @returns {Promise<Object>} Nueva categoría creada
   */
  async duplicate(id) {
    try {
      console.log('📄 CategoriesAPI.duplicate called with id:', id);
      
      const response = await this.http.post(this.buildUrl(`/${id}/duplicate`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ CategoriesAPI.duplicate result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Duplicate category ${id}`);
    }
  }

  /**
   * Transformar datos para envío a la API
   * @param {Object} data - Datos originales
   * @returns {Object} Datos transformados
   */
  transformForAPI(data) {
    console.log('🔄 CategoriesAPI.transformForAPI input data:', data);
    
    // Determinar parent_id (usar parent si parent_id no está definido)
    let parentId = undefined;
    if (data.parent_id !== undefined) {
      parentId = data.parent_id === null || data.parent_id === '' ? null : parseInt(data.parent_id) || null;
    } else if (data.parent !== undefined) {
      parentId = data.parent === null || data.parent === '' ? null : parseInt(data.parent) || null;
    }
    
    const transformed = {
      name: data.name?.trim(),
      active: data.active !== undefined ? Boolean(data.active) : undefined,
      visible: data.visible !== undefined ? Boolean(data.visible) : undefined,
      position: data.position !== undefined ? (data.position === null ? 0 : parseInt(data.position) || 0) : undefined,
      parent_id: parentId,
      // Atributos de categoría
      id_attribute_first: data.id_attribute_first !== undefined ? (data.id_attribute_first === null || data.id_attribute_first === '' ? null : parseInt(data.id_attribute_first) || null) : undefined,
      id_attribute_second: data.id_attribute_second !== undefined ? (data.id_attribute_second === null || data.id_attribute_second === '' ? null : parseInt(data.id_attribute_second) || null) : undefined,
      // Limpiar campos opcionales
      description: data.description?.trim() || null,
      meta_title: data.meta_title?.trim() || null,
      meta_description: data.meta_description?.trim() || null,
      meta_keywords: data.meta_keywords?.trim() || null
    };
    
    // Eliminar campos undefined para no enviarlos al servidor
    Object.keys(transformed).forEach(key => {
      if (transformed[key] === undefined) {
        delete transformed[key];
      }
    });
    
    console.log('✅ CategoriesAPI.transformForAPI output data:', transformed);
    return transformed;
  }
}

// Crear instancia única para exportar
export const categoriesApi = new CategoriesAPI();

// Para debugging en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.categoriesApi = categoriesApi;
}

export default categoriesApi;
