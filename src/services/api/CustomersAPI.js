import { BaseAPI } from './BaseAPI.js';
import httpClient from '../httpClient.js';

/**
 * API class específica para clientes
 * Maneja todas las operaciones relacionadas con clientes
 */
export class CustomersAPI extends BaseAPI {
  constructor() {
    super(httpClient, '/customers');
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
        per_page: params.pageSize || params.limit || 20, // Laravel usa per_page
        sort: params.sort,
        order: params.order,
        search: params.search || params.q,
        has_account: params.hasAccount || params.has_account,
        active: params.active,
        company_name: params.companyName || params.company_name,
        email: params.email,
        ...params.filters
      });

      console.log('🔍 CustomersAPI.getAll called with params:', cleanParams);

      const response = await this.http.get(this.buildUrl(), { 
        params: cleanParams 
      });
      
      const result = this.normalizeListResponse(response);
      console.log('✅ CustomersAPI.getAll result:', result);
      
      return result;
    } catch (error) {
      throw this.handleError(error, 'Get all customers');
    }
  }

  /**
   * Obtener un cliente por ID
   * @param {number|string} id - ID del cliente
   * @returns {Promise<Object>} Cliente encontrado
   */
  async getById(id) {
    try {
      console.log('🔍 CustomersAPI.getById called with id:', id);
      
      const response = await this.http.get(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ CustomersAPI.getById result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Get customer ${id}`);
    }
  }

  /**
   * Crear nuevo cliente
   * @param {Object} customerData - Datos del cliente
   * @returns {Promise<Object>} Cliente creado
   */
  async create(customerData) {
    try {
      console.log('✨ CustomersAPI.create called with data:', customerData);
      
      // Validaciones específicas para clientes
      if (!customerData.email || !customerData.email.trim()) {
        throw new Error('El email del cliente es requerido');
      }

      if (!this.isValidEmail(customerData.email)) {
        throw new Error('El email no tiene un formato válido');
      }

      // Transformar datos para la API
      const transformedData = this.transformForAPI(customerData);
      
      const response = await this.http.post(this.buildUrl(), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ CustomersAPI.create result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, 'Create customer');
    }
  }

  /**
   * Actualizar cliente existente
   * @param {number|string} id - ID del cliente
   * @param {Object} customerData - Datos actualizados
   * @returns {Promise<Object>} Cliente actualizado
   */
  async update(id, customerData) {
    try {
      console.log('📝 CustomersAPI.update called with id:', id, 'data:', customerData);
      
      // Validaciones para actualización
      if (customerData.email && !this.isValidEmail(customerData.email)) {
        throw new Error('El email no tiene un formato válido');
      }

      // Transformar datos para la API
      const transformedData = this.transformForAPI(customerData);
      console.log('🔄 CustomersAPI.transformForAPI result:', transformedData);
      
      const response = await this.http.put(this.buildUrl(`/${id}`), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ CustomersAPI.update result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Update customer ${id}`);
    }
  }

  /**
   * Eliminar cliente
   * @param {number|string} id - ID del cliente
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async delete(id) {
    try {
      console.log('🗑️ CustomersAPI.delete called with id:', id);
      
      const response = await this.http.delete(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ CustomersAPI.delete result:', result);
      return { ...result, id: parseInt(id) };
    } catch (error) {
      throw this.handleError(error, `Delete customer ${id}`);
    }
  }

  /**
   * Obtener clientes con cuenta registrada
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de clientes con cuenta
   */
  async getWithAccount(params = {}) {
    return this.getAll({ ...params, hasAccount: true });
  }

  /**
   * Obtener clientes invitados (sin cuenta)
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de clientes invitados
   */
  async getGuests(params = {}) {
    return this.getAll({ ...params, hasAccount: false });
  }

  /**
   * Obtener clientes activos
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de clientes activos
   */
  async getActive(params = {}) {
    return this.getAll({ ...params, active: true });
  }

  /**
   * Buscar clientes por email
   * @param {string} email - Email a buscar
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Resultados de búsqueda
   */
  async searchByEmail(email, params = {}) {
    return this.getAll({ 
      ...params, 
      email: email 
    });
  }

  /**
   * Buscar clientes por nombre o compañía
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

  // Acciones específicas de clientes

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
   * Actualizar información de contacto
   * @param {number|string} id - ID del cliente
   * @param {Object} contactData - Datos de contacto
   * @returns {Promise<Object>} Cliente actualizado
   */
  async updateContactInfo(id, contactData) {
    const allowedFields = ['first_name', 'last_name', 'email', 'phone', 'company_name'];
    const filteredData = Object.fromEntries(
      Object.entries(contactData).filter(([key]) => allowedFields.includes(key))
    );
    return this.update(id, filteredData);
  }

  /**
   * Obtener pedidos de un cliente
   * @param {number|string} customerId - ID del cliente
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Lista de pedidos del cliente
   */
  async getOrders(customerId, params = {}) {
    try {
      console.log('🛍️ CustomersAPI.getOrders called with customerId:', customerId);
      
      const response = await this.http.get(this.buildUrl(`/${customerId}/orders`), {
        params: this.buildParams(params)
      });
      
      const result = this.normalizeListResponse(response);
      console.log('✅ CustomersAPI.getOrders result:', result);
      
      return result;
    } catch (error) {
      throw this.handleError(error, `Get orders for customer ${customerId}`);
    }
  }

  /**
   * Obtener direcciones de un cliente
   * @param {number|string} customerId - ID del cliente
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Lista de direcciones del cliente
   */
  async getAddresses(customerId, params = {}) {
    try {
      console.log('🏠 CustomersAPI.getAddresses called with customerId:', customerId);
      
      const response = await this.http.get(this.buildUrl(`/${customerId}/addresses`), {
        params: this.buildParams(params)
      });
      
      const result = this.normalizeListResponse(response);
      console.log('✅ CustomersAPI.getAddresses result:', result);
      
      return result;
    } catch (error) {
      throw this.handleError(error, `Get addresses for customer ${customerId}`);
    }
  }

  /**
   * Validar formato de email
   * @param {string} email - Email a validar
   * @returns {boolean} True si es válido
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Transformar datos específicos de clientes para la API
   * @param {Object} data - Datos a transformar
   * @returns {Object} Datos transformados
   */
  transformForAPI(data) {
    const transformed = { ...data };

    // Limpiar strings
    ['first_name', 'last_name', 'email', 'company_name', 'phone'].forEach(field => {
      if (typeof transformed[field] === 'string') {
        transformed[field] = transformed[field].trim() || null;
      }
    });

    // Asegurar email en minúsculas
    if (transformed.email) {
      transformed.email = transformed.email.toLowerCase();
    }

    // Asegurar boolean
    if (typeof transformed.has_account !== 'undefined') {
      transformed.has_account = Boolean(transformed.has_account);
    }

    if (typeof transformed.active !== 'undefined') {
      transformed.active = Boolean(transformed.active);
    }

    // Remover campos vacíos
    Object.keys(transformed).forEach(key => {
      if (transformed[key] === '' || transformed[key] === null) {
        if (['email'].includes(key)) {
          // Email es requerido, no eliminar
          return;
        }
        delete transformed[key];
      }
    });

    console.log('🔄 CustomersAPI.transformForAPI:', { original: data, transformed });
    return transformed;
  }
}

// Instancia exportada
export const customersApi = new CustomersAPI();
