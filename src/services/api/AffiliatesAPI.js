// src/services/api/AffiliatesAPI.js
import { BaseAPI } from './BaseAPI.js';
import httpClient from '../httpClient.js';

/**
 * API class específica para afiliados
 * Maneja todas las operaciones relacionadas con afiliados, contactos y zonas
 */
export class AffiliatesAPI extends BaseAPI {
  constructor() {
    super(httpClient, '/affiliates');
  }

  /**
   * Obtener todos los afiliados con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Lista de afiliados con paginación
   */
  async getAll(params = {}) {
    try {
      const cleanParams = this.buildParams({
        page: params.page || 1,
        per_page: params.pageSize || params.limit || 20,
        sort_by: this.mapSortField(params.sort || params.sort_by),
        sort_order: params.order || params.sort_order,
        'filters[name]': params.search || params.q || params.name,
        'filters[email]': params.email,
        'filters[active]': params.active !== undefined ? Boolean(params.active) : undefined,
        'with[]': params.with || ['contacts', 'zones'],
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
   * Crear nuevo afiliado
   * @param {Object} affiliateData - Datos del afiliado
   * @returns {Promise<Object>} Afiliado creado
   */
  async create(affiliateData) {
    try {
      console.log('✨ AffiliatesAPI.create called with data:', affiliateData);
      
      // Validaciones básicas
      if (!affiliateData.name || !affiliateData.name.trim()) {
        throw new Error('El nombre del afiliado es requerido');
      }
      if (!affiliateData.email || !affiliateData.email.trim()) {
        throw new Error('El email del afiliado es requerido');
      }
      
      const transformedData = this.transformForAPI(affiliateData);
      
      console.log('📦 Datos que se envían al servidor:', transformedData);
      
      const response = await this.http.post(this.buildUrl(), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ AffiliatesAPI.create result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, 'Create affiliate');
    }
  }

  /**
   * Actualizar afiliado existente
   * @param {number|string} id - ID del afiliado
   * @param {Object} affiliateData - Datos actualizados
   * @returns {Promise<Object>} Afiliado actualizado
   */
  async update(id, affiliateData) {
    try {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error(`ID inválido: ${id}`);
      }
      
      console.log('📝 AffiliatesAPI.update called with id:', numericId, 'data:', affiliateData);
      
      const transformedData = this.transformForAPI(affiliateData);
      console.log('🔄 Datos transformados:', transformedData);
      
      const response = await this.http.put(this.buildUrl(`/${numericId}`), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ AffiliatesAPI.update result:', result);
      return result;
    } catch (error) {
      console.error('❌ AffiliatesAPI.update error:', error);
      throw this.handleError(error, `Update affiliate ${id}`);
    }
  }

  /**
   * Eliminar afiliado
   * @param {number|string} id - ID del afiliado
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async delete(id) {
    try {
      console.log('🗑️ AffiliatesAPI.delete called with id:', id);
      
      const response = await this.http.delete(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ AffiliatesAPI.delete result:', result);
      return { ...result, id: parseInt(id) };
    } catch (error) {
      throw this.handleError(error, `Delete affiliate ${id}`);
    }
  }

  /**
   * Obtener afiliados activos solamente
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de afiliados activos
   */
  async getActive(params = {}) {
    return this.getAll({ ...params, active: true });
  }

  // ==================== CONTACTOS ====================
  
  /**
   * Obtener contactos de un afiliado
   * @param {number|string} affiliateId - ID del afiliado
   * @returns {Promise<Array>} Lista de contactos
   */
  async getContacts(affiliateId) {
    try {
      console.log('🔍 AffiliatesAPI.getContacts for affiliate:', affiliateId);
      
      const response = await this.http.get(this.buildUrl(`/${affiliateId}/contacts`));
      const result = this.normalizeListResponse(response);
      
      console.log('✅ AffiliatesAPI.getContacts result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Get contacts for affiliate ${affiliateId}`);
    }
  }

  /**
   * Crear contacto para un afiliado
   * @param {number|string} affiliateId - ID del afiliado
   * @param {Object} contactData - Datos del contacto
   * @returns {Promise<Object>} Contacto creado
   */
  async createContact(affiliateId, contactData) {
    try {
      console.log('✨ AffiliatesAPI.createContact for affiliate:', affiliateId, 'data:', contactData);
      
      const response = await this.http.post(
        this.buildUrl(`/${affiliateId}/contacts`), 
        contactData
      );
      const result = this.normalizeResponse(response);
      
      console.log('✅ AffiliatesAPI.createContact result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Create contact for affiliate ${affiliateId}`);
    }
  }

  /**
   * Actualizar contacto de un afiliado
   * @param {number|string} affiliateId - ID del afiliado
   * @param {number|string} contactId - ID del contacto
   * @param {Object} contactData - Datos actualizados
   * @returns {Promise<Object>} Contacto actualizado
   */
  async updateContact(affiliateId, contactId, contactData) {
    try {
      console.log('📝 AffiliatesAPI.updateContact:', { affiliateId, contactId, contactData });
      
      const response = await this.http.put(
        this.buildUrl(`/${affiliateId}/contacts/${contactId}`),
        contactData
      );
      const result = this.normalizeResponse(response);
      
      console.log('✅ AffiliatesAPI.updateContact result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Update contact ${contactId} for affiliate ${affiliateId}`);
    }
  }

  /**
   * Eliminar contacto de un afiliado
   * @param {number|string} affiliateId - ID del afiliado
   * @param {number|string} contactId - ID del contacto
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async deleteContact(affiliateId, contactId) {
    try {
      console.log('🗑️ AffiliatesAPI.deleteContact:', { affiliateId, contactId });
      
      const response = await this.http.delete(
        this.buildUrl(`/${affiliateId}/contacts/${contactId}`)
      );
      const result = this.normalizeResponse(response);
      
      console.log('✅ AffiliatesAPI.deleteContact result:', result);
      return { ...result, id: parseInt(contactId) };
    } catch (error) {
      throw this.handleError(error, `Delete contact ${contactId} for affiliate ${affiliateId}`);
    }
  }

  // ==================== ZONAS ====================
  
  /**
   * Obtener zonas de un afiliado
   * @param {number|string} affiliateId - ID del afiliado
   * @returns {Promise<Array>} Lista de zonas
   */
  async getZones(affiliateId) {
    try {
      console.log('🔍 AffiliatesAPI.getZones for affiliate:', affiliateId);
      
      const response = await this.http.get(this.buildUrl(`/${affiliateId}/zones`));
      const result = this.normalizeListResponse(response);
      
      console.log('✅ AffiliatesAPI.getZones result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Get zones for affiliate ${affiliateId}`);
    }
  }

  /**
   * Crear zona para un afiliado
   * @param {number|string} affiliateId - ID del afiliado
   * @param {Object} zoneData - Datos de la zona
   * @returns {Promise<Object>} Zona creada
   */
  async createZone(affiliateId, zoneData) {
    try {
      console.log('✨ AffiliatesAPI.createZone for affiliate:', affiliateId, 'data:', zoneData);
      
      const response = await this.http.post(
        this.buildUrl(`/${affiliateId}/zones`), 
        zoneData
      );
      const result = this.normalizeResponse(response);
      
      console.log('✅ AffiliatesAPI.createZone result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Create zone for affiliate ${affiliateId}`);
    }
  }

  /**
   * Actualizar zona de un afiliado
   * @param {number|string} affiliateId - ID del afiliado
   * @param {number|string} zoneId - ID de la zona
   * @param {Object} zoneData - Datos actualizados
   * @returns {Promise<Object>} Zona actualizada
   */
  async updateZone(affiliateId, zoneId, zoneData) {
    try {
      console.log('📝 AffiliatesAPI.updateZone:', { affiliateId, zoneId, zoneData });
      
      const response = await this.http.put(
        this.buildUrl(`/${affiliateId}/zones/${zoneId}`),
        zoneData
      );
      const result = this.normalizeResponse(response);
      
      console.log('✅ AffiliatesAPI.updateZone result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Update zone ${zoneId} for affiliate ${affiliateId}`);
    }
  }

  /**
   * Eliminar zona de un afiliado
   * @param {number|string} affiliateId - ID del afiliado
   * @param {number|string} zoneId - ID de la zona
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async deleteZone(affiliateId, zoneId) {
    try {
      console.log('🗑️ AffiliatesAPI.deleteZone:', { affiliateId, zoneId });
      
      const response = await this.http.delete(
        this.buildUrl(`/${affiliateId}/zones/${zoneId}`)
      );
      const result = this.normalizeResponse(response);
      
      console.log('✅ AffiliatesAPI.deleteZone result:', result);
      return { ...result, id: parseInt(zoneId) };
    } catch (error) {
      throw this.handleError(error, `Delete zone ${zoneId} for affiliate ${affiliateId}`);
    }
  }

  /**
   * Mapear campos de ordenamiento del frontend al backend
   * @param {string} field - Campo de ordenamiento del frontend
   * @returns {string} Campo mapeado para el backend
   */
  mapSortField(field) {
    if (!field) return 'name';
    
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
