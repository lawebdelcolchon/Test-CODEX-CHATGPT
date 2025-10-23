// src/services/api/SuppliersAPI.js
import { BaseAPI } from './BaseAPI.js';
import httpClient from '../httpClient.js';

/**
 * API class específica para suppliers (proveedores)
 * Maneja todas las operaciones relacionadas con proveedores
 */
export class SuppliersAPI extends BaseAPI {
  constructor() {
    super(httpClient, '/suppliers');
  }

  /**
   * Obtener todos los suppliers con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Lista de suppliers con paginación
   */
  async getAll(params = {}) {
    try {
      const cleanParams = this.buildParams({
        page: params.page || 1,
        per_page: params.pageSize || params.limit || 20,
        sort_by: this.mapSortField(params.sort || params.sort_by),
        sort_order: params.order || params.sort_order,
        // Filtros específicos de suppliers
        'filters[name]': params.search || params.q || params.name,
        'filters[tax_code]': params.tax_code,
        'filters[email]': params.email,
        'filters[city]': params.city,
        'filters[active]': params.active !== undefined ? Boolean(params.active) : undefined,
        'filters[is_company]': params.is_company !== undefined ? Boolean(params.is_company) : undefined,
        // Relaciones a incluir
        'with[]': params.with || [],
        ...params.filters
      });

      console.log('🔍 SuppliersAPI.getAll called with params:', cleanParams);

      const response = await this.http.get(this.buildUrl(), { 
        params: cleanParams 
      });
      
      const result = this.normalizeListResponse(response);
      console.log('✅ SuppliersAPI.getAll result:', result);
      
      return result;
    } catch (error) {
      throw this.handleError(error, 'Get all suppliers');
    }
  }

  /**
   * Obtener un supplier por ID
   * @param {number|string} id - ID del supplier
   * @returns {Promise<Object>} Supplier encontrado
   */
  async getById(id) {
    try {
      console.log('🔍 SuppliersAPI.getById called with id:', id);
      
      const response = await this.http.get(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ SuppliersAPI.getById result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Get supplier ${id}`);
    }
  }

  /**
   * Crear nuevo supplier
   * @param {Object} supplierData - Datos del supplier
   * @returns {Promise<Object>} Supplier creado
   */
  async create(supplierData) {
    try {
      console.log('✨ SuppliersAPI.create called with data:', supplierData);
      
      // Validaciones específicas para suppliers
      if (!supplierData.name || !supplierData.name.trim()) {
        throw new Error('El nombre del proveedor es requerido');
      }
      if (!supplierData.tax_code || !supplierData.tax_code.trim()) {
        throw new Error('El código fiscal es requerido');
      }
      if (!supplierData.email || !supplierData.email.trim()) {
        throw new Error('El email es requerido');
      }
      if (!supplierData.phone || !supplierData.phone.trim()) {
        throw new Error('El teléfono es requerido');
      }
      if (!supplierData.address || !supplierData.address.trim()) {
        throw new Error('La dirección es requerida');
      }
      if (!supplierData.zipcode || !supplierData.zipcode.trim()) {
        throw new Error('El código postal es requerido');
      }
      if (!supplierData.city || !supplierData.city.trim()) {
        throw new Error('La ciudad es requerida');
      }

      // Transformar datos para la API
      const transformedData = this.transformForAPI(supplierData);
      
      console.log('📦 Datos exactos que se envían al servidor:');
      console.log('URL:', this.buildUrl());
      console.log('Data:', JSON.stringify(transformedData, null, 2));
      
      const response = await this.http.post(this.buildUrl(), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ SuppliersAPI.create result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, 'Create supplier');
    }
  }

  /**
   * Actualizar supplier existente
   * @param {number|string} id - ID del supplier
   * @param {Object} supplierData - Datos actualizados
   * @returns {Promise<Object>} Supplier actualizado
   */
  async update(id, supplierData) {
    try {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error(`ID inválido: ${id}`);
      }
      
      console.log('📝 SuppliersAPI.update called with id:', numericId, 'data:', supplierData);
      
      const transformedData = this.transformForAPI(supplierData);
      console.log('🔄 SuppliersAPI.transformForAPI result:', transformedData);
      
      const response = await this.http.put(this.buildUrl(`/${numericId}`), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ SuppliersAPI.update result:', result);
      return result;
    } catch (error) {
      console.error('❌ SuppliersAPI.update error:', error);
      throw this.handleError(error, `Update supplier ${id}`);
    }
  }

  /**
   * Eliminar supplier
   * @param {number|string} id - ID del supplier
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async delete(id) {
    try {
      console.log('🗑️ SuppliersAPI.delete called with id:', id);
      
      const response = await this.http.delete(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ SuppliersAPI.delete result:', result);
      return { ...result, id: parseInt(id) };
    } catch (error) {
      throw this.handleError(error, `Delete supplier ${id}`);
    }
  }

  /**
   * Obtener suppliers activos solamente
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de suppliers activos
   */
  async getActive(params = {}) {
    return this.getAll({ ...params, active: true });
  }

  /**
   * Obtener suppliers que son empresas
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de suppliers empresas
   */
  async getCompanies(params = {}) {
    return this.getAll({ ...params, is_company: true });
  }

  /**
   * Buscar suppliers por nombre
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
   * Activar/desactivar supplier
   * @param {number|string} id - ID del supplier
   * @param {boolean} active - Estado activo
   * @returns {Promise<Object>} Supplier actualizado
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
      'name': 'name',
      'tax_code': 'tax_code',
      'email': 'email',
      'phone': 'phone',
      'city': 'city',
      'is_company': 'is_company',
      'status': 'active',
      'active': 'active',
      'created_at': 'created_at',
      'updated_at': 'updated_at',
      // Para compatibilidad con labels en español
      'Nombre': 'name',
      'Código Fiscal': 'tax_code',
      'Email': 'email',
      'Teléfono': 'phone',
      'Ciudad': 'city',
      'Tipo': 'is_company',
      'Estado': 'active',
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
    console.log('🔄 SuppliersAPI.transformForAPI input data:', data);
    
    const transformed = {
      // Campos requeridos según el modelo
      name: data.name?.trim() || '',
      tax_code: data.tax_code?.trim() || '',
      email: data.email?.trim() || '',
      phone: data.phone?.trim() || '',
      address: data.address?.trim() || '',
      zipcode: data.zipcode?.trim() || '',
      city: data.city?.trim() || '',
      
      // Campos opcionales específicos del modelo Supplier
      code_shipping: data.code_shipping?.trim() || '',
      code_control: data.code_control?.trim() || '',
      fax: data.fax?.trim() || '',
      
      // Estados booleanos
      is_company: data.is_company !== undefined ? Boolean(data.is_company) : false,
      active: data.active !== undefined ? Boolean(data.active) : true
    };
    
    // Eliminar campos undefined para no enviarlos al servidor
    Object.keys(transformed).forEach(key => {
      if (transformed[key] === undefined) {
        delete transformed[key];
      }
    });
    
    console.log('✅ SuppliersAPI.transformForAPI output data:', transformed);
    return transformed;
  }
}

// Crear instancia única para exportar
export const suppliersApi = new SuppliersAPI();

// Para debugging en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.suppliersApi = suppliersApi;
}

export default suppliersApi;