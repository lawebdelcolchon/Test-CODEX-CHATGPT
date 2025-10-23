// src/services/api/MarketplaceAPI.js
import { BaseAPI } from './BaseAPI.js';
import httpClient from '../httpClient.js';

/**
 * API class específica para marketplaces
 * Maneja todas las operaciones relacionadas con marketplaces
 */
export class MarketplaceAPI extends BaseAPI {
  constructor() {
    super(httpClient, '/marketplaces');
  }

  /**
   * Obtener todos los marketplaces con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Lista de marketplaces con paginación
   */
  async getAll(params = {}) {
    try {
      const cleanParams = this.buildParams({
        page: params.page || 1,
        per_page: params.pageSize || params.limit || 20,
        sort_by: this.mapSortField(params.sort || params.sort_by),
        sort_order: params.order || params.sort_order,
        // Filtros específicos de marketplace
        'filters[name]': params.search || params.q || params.name,
        'filters[code]': params.code,
        'filters[active]': params.active !== undefined ? Boolean(params.active) : undefined,
        'filters[visible]': params.visible !== undefined ? Boolean(params.visible) : undefined,
        ...params.filters
      });

      console.log('🔍 MarketplaceAPI.getAll called with params:', cleanParams);

      const response = await this.http.get(this.buildUrl(), { 
        params: cleanParams 
      });
      
      const result = this.normalizeListResponse(response);
      console.log('✅ MarketplaceAPI.getAll result:', result);
      
      return result;
    } catch (error) {
      throw this.handleError(error, 'Get all marketplaces');
    }
  }

  /**
   * Obtener un marketplace por ID
   * @param {number|string} id - ID del marketplace
   * @returns {Promise<Object>} Marketplace encontrado
   */
  async getById(id) {
    try {
      console.log('🔍 MarketplaceAPI.getById called with id:', id);
      
      const response = await this.http.get(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ MarketplaceAPI.getById result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Get marketplace ${id}`);
    }
  }

  /**
   * Crear nuevo marketplace
   * @param {Object} marketplaceData - Datos del marketplace
   * @returns {Promise<Object>} Marketplace creado
   */
  async create(marketplaceData) {
    try {
      console.log('✨ MarketplaceAPI.create called with data:', marketplaceData);
      
      // Validaciones específicas para marketplaces
      if (!marketplaceData.name || !marketplaceData.name.trim()) {
        throw new Error('El nombre del marketplace es requerido');
      }
      if (!marketplaceData.code || !marketplaceData.code.trim()) {
        throw new Error('El código del marketplace es requerido');
      }

      // Transformar datos para la API
      const transformedData = this.transformForAPI(marketplaceData);
      
      console.log('📦 Datos exactos que se envían al servidor:');
      console.log('URL:', this.buildUrl());
      console.log('Data:', JSON.stringify(transformedData, null, 2));
      
      const response = await this.http.post(this.buildUrl(), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ MarketplaceAPI.create result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, 'Create marketplace');
    }
  }

  /**
   * Actualizar marketplace existente
   * @param {number|string} id - ID del marketplace
   * @param {Object} marketplaceData - Datos actualizados
   * @returns {Promise<Object>} Marketplace actualizado
   */
  async update(id, marketplaceData) {
    try {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error(`ID inválido: ${id}`);
      }
      
      console.log('📝 MarketplaceAPI.update called with id:', numericId, 'data:', marketplaceData);
      
      const transformedData = this.transformForAPI(marketplaceData);
      console.log('🔄 MarketplaceAPI.transformForAPI result:', transformedData);
      
      const response = await this.http.put(this.buildUrl(`/${numericId}`), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ MarketplaceAPI.update result:', result);
      return result;
    } catch (error) {
      console.error('❌ MarketplaceAPI.update error:', error);
      throw this.handleError(error, `Update marketplace ${id}`);
    }
  }

  /**
   * Eliminar marketplace
   * @param {number|string} id - ID del marketplace
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async delete(id) {
    try {
      console.log('🗑️ MarketplaceAPI.delete called with id:', id);
      
      const response = await this.http.delete(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ MarketplaceAPI.delete result:', result);
      return { ...result, id: parseInt(id) };
    } catch (error) {
      throw this.handleError(error, `Delete marketplace ${id}`);
    }
  }

  /**
   * Obtener marketplaces activos solamente
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de marketplaces activos
   */
  async getActive(params = {}) {
    return this.getAll({ ...params, active: true });
  }

  /**
   * Obtener marketplaces visibles solamente
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de marketplaces visibles
   */
  async getVisible(params = {}) {
    return this.getAll({ ...params, visible: true });
  }

  /**
   * Buscar marketplaces por nombre
   * @param {string} searchTerm - Término de búsqueda
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Resultados de búsqueda
   */
  async searchByName(searchTerm, params = {}) {
    return this.getAll({ 
      ...params, 
      search: searchTerm 
    });
  }

  /**
   * Activar/desactivar marketplace
   * @param {number|string} id - ID del marketplace
   * @param {boolean} active - Estado activo
   * @returns {Promise<Object>} Marketplace actualizado
   */
  async setActive(id, active = true) {
    return this.update(id, { active });
  }

  /**
   * Mostrar/ocultar marketplace
   * @param {number|string} id - ID del marketplace
   * @param {boolean} visible - Estado visible
   * @returns {Promise<Object>} Marketplace actualizado
   */
  async setVisible(id, visible = true) {
    return this.update(id, { visible });
  }

  /**
   * Mapear campos de ordenamiento del frontend al backend
   * @param {string} field - Campo de ordenamiento del frontend
   * @returns {string} Campo mapeado para el backend
   */
  mapSortField(field) {
    if (!field) return 'id'; // Default
    
    const sortMapping = {
      'name': 'name',
      'code': 'code',
      'description': 'description',
      'url': 'url',
      'status': 'active',
      'visible': 'visible',
      'active': 'active',
      'created_at': 'created_at',
      'updated_at': 'updated_at',
      // Para compatibilidad con labels en español
      'Nombre': 'name',
      'Código': 'code',
      'Descripción': 'description',
      'URL': 'url',
      'Estado': 'active',
      'Visible': 'visible',
      'Activo': 'active',
      'Fecha de Creación': 'created_at'
    };
    
    return sortMapping[field] || field;
  }

  /**
   * Transformar datos para envío a la API
   * @param {Object} data - Datos originales
   * @returns {Object} Datos transformados
   */
  transformForAPI(data) {
    console.log('🔄 MarketplaceAPI.transformForAPI input data:', data);
    
    const transformed = {
      // Campos requeridos
      name: data.name?.trim() || '',
      code: data.code?.trim() || '',
      
      // Campos opcionales
      description: data.description?.trim() || null,
      url: data.url?.trim() || null,
      visible: data.visible !== undefined ? Boolean(data.visible) : true,
      active: data.active !== undefined ? Boolean(data.active) : true
    };
    
    // Eliminar campos undefined para no enviarlos al servidor
    Object.keys(transformed).forEach(key => {
      if (transformed[key] === undefined) {
        delete transformed[key];
      }
    });
    
    console.log('✅ MarketplaceAPI.transformForAPI output data:', transformed);
    return transformed;
  }
}

// Crear instancia única para exportar
export const marketplaceApi = new MarketplaceAPI();

// Para debugging en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.marketplaceApi = marketplaceApi;
}

export default marketplaceApi;