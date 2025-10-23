// src/services/api/StoresAPI.js
import { BaseAPI } from './BaseAPI.js';
import httpClient from '../httpClient.js';

/**
 * API class específica para tiendas
 * Maneja todas las operaciones relacionadas con tiendas
 */
export class StoresAPI extends BaseAPI {
  constructor() {
    super(httpClient, '/stores');
  }
  /**
   * Obtener todas las tiendas con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Lista de tiendas con paginación
   */
  async getAll(params = {}) {
    try {
      const cleanParams = this.buildParams({
        page: params.page || 1,
        per_page: params.pageSize || params.limit || 15, // Laravel usa per_page, default 15
        sort_by: params.sort || 'id',
        sort_order: params.order || 'asc',
        filters: {
          name: params.search || params.q,
          active: params.active,
          city: params.city,
          is_company: params.is_company,
          ...params.filters
        }
      });

      console.log('🔍 StoresAPI.getAll called with params:', cleanParams);

      const response = await this.http.get(this.buildUrl(), { 
        params: cleanParams 
      });
      
      const result = this.normalizeListResponse(response);
      console.log('✅ StoresAPI.getAll result:', result);
      
      return result;
    } catch (error) {
      throw this.handleError(error, 'Get all stores');
    }
  }

  /**
   * Obtener una tienda por ID
   * @param {number|string} id - ID de la tienda
   * @returns {Promise<Object>} Tienda encontrada
   */
  async getById(id) {
    try {
      console.log('🔍 StoresAPI.getById called with id:', id);
      
      const response = await this.http.get(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ StoresAPI.getById result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Get store ${id}`);
    }
  }

  /**
   * Crear nueva tienda
   * @param {Object} storeData - Datos de la tienda
   * @returns {Promise<Object>} Tienda creada
   */
  async create(storeData) {
    try {
      console.log('✨ StoresAPI.create called with data:', storeData);
      
      // Validaciones específicas para tiendas
      if (!storeData.name || !storeData.name.trim()) {
        throw new Error('El nombre de la tienda es requerido');
      }

      // Transformar datos para la API
      const transformedData = this.transformForAPI(storeData);
      
      const response = await this.http.post(this.buildUrl(), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ StoresAPI.create result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, 'Create store');
    }
  }

  /**
   * Actualizar tienda existente
   * @param {number|string} id - ID de la tienda
   * @param {Object} storeData - Datos actualizados
   * @returns {Promise<Object>} Tienda actualizada
   */
  async update(id, storeData) {
    try {
      // Asegurar que el ID sea un número entero
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error(`ID inválido: ${id}`);
      }
      
      console.log('📝 StoresAPI.update called with id:', numericId, 'original:', id, 'data:', storeData);
      
      // Transformar datos para la API
      const transformedData = this.transformForAPI(storeData);
      console.log('🔄 StoresAPI.transformForAPI result:', transformedData);
      
      const response = await this.http.put(this.buildUrl(`/${numericId}`), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ StoresAPI.update result:', result);
      return result;
    } catch (error) {
      console.error('❌ StoresAPI.update error:', error);
      throw this.handleError(error, `Update store ${id}`);
    }
  }

  /**
   * Eliminar tienda
   * @param {number|string} id - ID de la tienda
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async delete(id) {
    try {
      console.log('🗑️ StoresAPI.delete called with id:', id);
      
      const response = await this.http.delete(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ StoresAPI.delete result:', result);
      return { ...result, id: parseInt(id) };
    } catch (error) {
      throw this.handleError(error, `Delete store ${id}`);
    }
  }

  /**
   * Obtener tiendas activas solamente
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de tiendas activas
   */
  async getActive(params = {}) {
    return this.getAll({ ...params, active: true });
  }

  /**
   * Buscar tiendas por ciudad
   * @param {string} city - Ciudad a buscar
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de tiendas de la ciudad especificada
   */
  async getByCity(city, params = {}) {
    if (!city) {
      throw new Error('Ciudad es requerida');
    }
    return this.getAll({ ...params, city });
  }

  /**
   * Obtener tiendas empresas
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de tiendas que son empresas
   */
  async getCompanies(params = {}) {
    return this.getAll({ ...params, is_company: true });
  }

  // Acciones personalizadas específicas para tiendas

  /**
   * Activar/desactivar tienda
   * @param {number|string} id - ID de la tienda
   * @param {boolean} active - Estado activo
   * @returns {Promise<Object>} Tienda actualizada
   */
  async setActive(id, active = true) {
    return this.update(id, { active });
  }

  /**
   * Establecer como empresa
   * @param {number|string} id - ID de la tienda
   * @param {boolean} isCompany - Si es empresa
   * @returns {Promise<Object>} Tienda actualizada
   */
  async setCompany(id, isCompany = true) {
    return this.update(id, { is_company: isCompany });
  }

  /**
   * Transformar datos para envío a la API
   * @param {Object} data - Datos originales
   * @returns {Object} Datos transformados
   */
  transformForAPI(data) {
    console.log('🔄 StoresAPI.transformForAPI input data:', data);
    
    const transformed = {
      name: data.name?.trim(),
      short_name: data.short_name?.trim(),
      is_company: data.is_company !== undefined ? Boolean(data.is_company) : undefined,
      tax_code: data.tax_code?.trim() || null,
      code_shipping: data.code_shipping?.trim() || null,
      code_control: data.code_control?.trim() || null,
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      fax: data.fax !== undefined ? (data.fax?.trim() || "-") : "-", // Siempre enviar fax con un valor válido
      address: data.address?.trim() || null,
      zipcode: data.zipcode?.trim() || null,
      city: data.city?.trim() || null,
      active: data.active !== undefined ? Boolean(data.active) : undefined
    };
    
    // Eliminar campos undefined para no enviarlos al servidor
    // EXCEPTO fax que siempre debe enviarse
    Object.keys(transformed).forEach(key => {
      if (transformed[key] === undefined && key !== 'fax') {
        delete transformed[key];
      }
    });
    
    console.log('✅ StoresAPI.transformForAPI output data:', transformed);
    return transformed;
  }
}

// Crear instancia única para exportar
export const storesApi = new StoresAPI();

// Para debugging en desarrollo
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.storesApi = storesApi;
}

export default storesApi;
