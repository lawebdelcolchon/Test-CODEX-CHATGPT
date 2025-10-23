// src/services/api/ClientsAPI.js
import { BaseAPI } from './BaseAPI.js';
import httpClient from '../httpClient.js';

/**
 * API class específica para clientes
 * Maneja todas las operaciones relacionadas con clientes
 */
export class ClientsAPI extends BaseAPI {
  constructor() {
    super(httpClient, '/clients');
  }

  /**
   * Obtener todos los clientes con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Lista de clientes con paginación
   */
  async getAll(params = {}) {
    try {
      const cleanParams = this.buildParams({
        page: params.page || 1,
        per_page: params.pageSize || params.limit || 20,
        // Ordenamiento con mapeo correcto de campos
        sort_by: this.mapSortField(params.sort || params.sort_by),
        sort_order: params.order || params.sort_order,
        // Filtros específicos para clientes
        'filters[name]': params.search || params.q || params.name,
        'filters[email]': params.email,
        'filters[phone]': params.phone,
        'filters[active]': params.active !== undefined ? Boolean(params.active) : undefined,
        'filters[id_store]': params.id_store,
        'filters[id_affiliate]': params.id_affiliate,
        // Relaciones a incluir si existen
        'with[]': params.with || [],
        ...params.filters
      });

      console.log('🔍 ClientsAPI.getAll called with params:', cleanParams);

      const response = await this.http.get(this.buildUrl(), { 
        params: cleanParams 
      });
      
      const result = this.normalizeListResponse(response);
      console.log('✅ ClientsAPI.getAll result:', result);
      
      return result;
    } catch (error) {
      throw this.handleError(error, 'Get all clients');
    }
  }

  /**
   * Obtener un cliente por ID
   * @param {number|string} id - ID del cliente
   * @returns {Promise<Object>} Cliente encontrado
   */
  async getById(id) {
    try {
      console.log('🔍 ClientsAPI.getById called with id:', id);
      
      const response = await this.http.get(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ ClientsAPI.getById result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Get client ${id}`);
    }
  }

  /**
   * Crear nuevo cliente
   * @param {Object} clientData - Datos del cliente
   * @returns {Promise<Object>} Cliente creado
   */
  async create(clientData) {
    try {
      console.log('✨ ClientsAPI.create called with data:', clientData);
      
      // Validaciones básicas para clientes
      if (!clientData.name || !clientData.name.trim()) {
        throw new Error('El nombre del cliente es requerido');
      }
      if (!clientData.email || !clientData.email.trim()) {
        throw new Error('El email del cliente es requerido');
      }
      if (!/\S+@\S+\.\S+/.test(clientData.email)) {
        throw new Error('El email debe tener un formato válido');
      }

      // Transformar datos para la API
      const transformedData = this.transformForAPI(clientData);
      
      console.log('📦 Datos exactos que se envían al servidor:');
      console.log('URL:', this.buildUrl());
      console.log('Data:', JSON.stringify(transformedData, null, 2));
      
      const response = await this.http.post(this.buildUrl(), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ ClientsAPI.create result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, 'Create client');
    }
  }

  /**
   * Actualizar cliente existente
   * @param {number|string} id - ID del cliente
   * @param {Object} clientData - Datos actualizados
   * @returns {Promise<Object>} Cliente actualizado
   */
  async update(id, clientData) {
    try {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error(`ID inválido: ${id}`);
      }
      
      console.log('📝 ClientsAPI.update called with id:', numericId, 'original:', id, 'data:', clientData);
      
      const transformedData = this.transformForAPI(clientData);
      console.log('🔄 ClientsAPI.transformForAPI result:', transformedData);
      
      const response = await this.http.put(this.buildUrl(`/${numericId}`), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ ClientsAPI.update result:', result);
      return result;
    } catch (error) {
      console.error('❌ ClientsAPI.update error:', error);
      throw this.handleError(error, `Update client ${id}`);
    }
  }

  /**
   * Eliminar cliente
   * @param {number|string} id - ID del cliente
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async delete(id) {
    try {
      console.log('🗑️ ClientsAPI.delete called with id:', id);
      
      const response = await this.http.delete(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ ClientsAPI.delete result:', result);
      return { ...result, id: parseInt(id) };
    } catch (error) {
      throw this.handleError(error, `Delete client ${id}`);
    }
  }

  /**
   * Obtener clientes activos solamente
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de clientes activos
   */
  async getActive(params = {}) {
    return this.getAll({ ...params, active: true });
  }

  /**
   * Buscar clientes por nombre o email
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
   * Activar/desactivar cliente
   * @param {number|string} id - ID del cliente
   * @param {boolean} active - Estado activo
   * @returns {Promise<Object>} Cliente actualizado
   */
  async setActive(id, active = true) {
    return this.update(id, { active });
  }

  /**
   * Mapear campos de ordenamiento del frontend al backend
   * @param {string} field - Campo de ordenamiento del frontend
   * @returns {string} Campo mapeado para el backend
   */
  mapSortField(field) {
    if (!field) return 'id'; // Default
    
    const sortMapping = {
      // Mapeo de nombres de columnas del frontend a campos de la BD
      'name': 'name',
      'email': 'email',
      'phone': 'phone',
      'address': 'address',
      'city': 'city',
      'status': 'active',
      'date_client': 'date_client',
      'created_at': 'date_client', // Mapear created_at a date_client como fallback
      'updated_at': 'date_client',
      // Para compatibilidad con labels en español si llegan
      'Nombre': 'name',
      'Email': 'email',
      'Teléfono': 'phone',
      'Dirección': 'address',
      'Ciudad': 'city',
      'Estado': 'active',
      'Fecha de Cliente': 'date_client',
      'Fecha de Creación': 'date_client'
    };
    
    return sortMapping[field] || field;
  }

  /**
   * Transformar datos para envío a la API
   * @param {Object} data - Datos originales
   * @returns {Object} Datos transformados
   */
  transformForAPI(data) {
    console.log('🔄 ClientsAPI.transformForAPI input data:', data);
    
    // Construir objeto transformado solo con campos necesarios
    const transformed = {};
    
    // Campos obligatorios - siempre se incluyen
    transformed.id_store = parseInt(data.id_store);
    transformed.name = data.name?.trim();
    transformed.lastname = data.lastname?.trim();
    transformed.tax_code = data.tax_code?.trim();
    transformed.email = data.email?.trim();
    transformed.amz_email = data.amz_email?.trim() || data.email?.trim();
    transformed.phone = data.phone?.trim();
    transformed.road = data.road?.trim();
    transformed.address = data.address?.trim();
    transformed.zipcode = data.zipcode?.trim();
    transformed.city = data.city?.trim();
    transformed.user = data.user?.trim();
    transformed.password = data.password?.trim();
    
    // Campos opcionales - solo se incluyen si tienen valor
    if (data.id_affiliate && data.id_affiliate !== '' && data.id_affiliate !== 'none') {
      transformed.id_affiliate = parseInt(data.id_affiliate);
    }
    
    if (data.via && data.via.trim() !== '') {
      transformed.via = data.via.trim();
    }
    
    if (data.accounting_plan && data.accounting_plan !== '') {
      transformed.accounting_plan = parseInt(data.accounting_plan);
    }
    
    if (data.fax && data.fax.trim() !== '') {
      transformed.fax = data.fax.trim();
    }
    
    if (data.idcity && data.idcity !== '') {
      transformed.idcity = parseInt(data.idcity);
    }
    
    // Campos booleanos - solo se incluyen explícitamente si se configuran
    // El backend les pondrá valores por defecto en prepareForValidation()
    if (data.is_company !== undefined) {
      transformed.is_company = Boolean(data.is_company);
    }
    
    if (data.active !== undefined) {
      transformed.active = Boolean(data.active);
    }
    
    if (data.level !== undefined) {
      transformed.level = Boolean(data.level);
    }
    
    if (data.privacy !== undefined) {
      transformed.privacy = Boolean(data.privacy);
    }
    
    if (data.advertising !== undefined) {
      transformed.advertising = Boolean(data.advertising);
    }
    
    if (data.send !== undefined) {
      transformed.send = Boolean(data.send);
    }
    
    // date_client solo se incluye si se proporciona
    // El backend le pondrá now() por defecto en prepareForValidation()
    if (data.date_client && data.date_client !== '') {
      transformed.date_client = data.date_client;
    }
    
    console.log('✅ ClientsAPI.transformForAPI output data:', transformed);
    return transformed;
  }
}

// Crear instancia única para exportar
export const clientsApi = new ClientsAPI();

// Para debugging en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.clientsApi = clientsApi;
}

export default clientsApi;