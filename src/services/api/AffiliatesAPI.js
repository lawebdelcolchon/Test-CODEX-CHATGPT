// src/services/api/AffiliatesAPI.js
import { BaseAPI } from './BaseAPI.js';
import httpClient from '../httpClient.js';

/**
 * API class específica para afiliados
 * Maneja todas las operaciones relacionadas con afiliados
 */
export class AffiliatesAPI extends BaseAPI {
  constructor() {
    super(httpClient, '/affiliates');
  }

  /**
   * Obtener todos los afiliados activos para selectores
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Lista de afiliados
   */
  async getAll(params = {}) {
    try {
      const cleanParams = this.buildParams({
        page: params.page || 1,
        per_page: params.pageSize || params.limit || 50, // Más items para selectores
        sort_by: 'name',
        sort_order: 'asc',
        'filters[active]': true, // Solo activos por defecto
        ...params.filters
      });

      console.log('🔍 AffiliatesAPI.getAll called with params:', cleanParams);

      const response = await this.http.get(this.buildUrl(), { 
        params: cleanParams 
      });
      
      const result = this.normalizeListResponse(response);
      console.log('✅ AffiliatesAPI.getAll result:', result);
      
      return result;
    } catch (error) {
      throw this.handleError(error, 'Get all affiliates');
    }
  }

  /**
   * Obtener un afiliado por ID
   * @param {number|string} id - ID del afiliado
   * @returns {Promise<Object>} Afiliado encontrado
   */
  async getById(id) {
    try {
      console.log('🔍 AffiliatesAPI.getById called with id:', id);
      
      const response = await this.http.get(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ AffiliatesAPI.getById result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Get affiliate ${id}`);
    }
  }

  /**
   * Obtener afiliados activos solamente
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de afiliados activos
   */
  async getActive(params = {}) {
    return this.getAll({ ...params, filters: { active: true } });
  }

  /**
   * Mapear campos de ordenamiento del frontend al backend
   * @param {string} field - Campo de ordenamiento del frontend
   * @returns {string} Campo mapeado para el backend
   */
  mapSortField(field) {
    if (!field) return 'name'; // Default
    
    const sortMapping = {
      'name': 'name',
      'email': 'email',
      'phone': 'phone',
      'status': 'active',
      'created_at': 'created_at'
    };
    
    return sortMapping[field] || field;
  }
}

// Crear instancia única para exportar
export const affiliatesApi = new AffiliatesAPI();

// Para debugging en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.affiliatesApi = affiliatesApi;
}

export default affiliatesApi;