// src/services/api/InvoicesAPI.js
import { BaseAPI } from './BaseAPI.js';
import httpClient from '../httpClient.js';

/**
 * API class específica para facturas
 * Maneja operaciones CRUD y acciones especiales como anular y transmitir a AEAT
 */
export class InvoicesAPI extends BaseAPI {
  constructor() {
    super(httpClient, '/invoices');
  }

  /**
   * Obtener todas las facturas con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Lista de facturas con paginación
   */
  async getAll(params = {}) {
    try {
      const cleanParams = this.buildParams({
        page: params.page || 1,
        per_page: params.pageSize || params.limit || 20,
        sort_by: this.mapSortField(params.sort || params.sort_by),
        sort_order: params.order || params.sort_order,
        'filters[serie]': params.search || params.q || params.serie,
        'filters[number]': params.number,
        'filters[id_client]': params.id_client,
        'filters[id_order]': params.id_order,
        'filters[payed]': params.payed,
        'with[]': params.with || ['client', 'store', 'order'],
        ...params.filters
      });

      console.log('🔍 InvoicesAPI.getAll called with params:', cleanParams);

      const response = await this.http.get(this.buildUrl(), { 
        params: cleanParams 
      });
      
      const result = this.normalizeListResponse(response);
      console.log('✅ InvoicesAPI.getAll result:', result);
      
      return result;
    } catch (error) {
      throw this.handleError(error, 'Get all invoices');
    }
  }

  /**
   * Obtener una factura por ID
   * @param {number|string} id - ID de la factura
   * @returns {Promise<Object>} Factura encontrada
   */
  async getById(id) {
    try {
      console.log('🔍 InvoicesAPI.getById called with id:', id);
      
      const response = await this.http.get(this.buildUrl(`/${id}`), {
        params: {
          'with[]': ['client', 'store', 'order']
        }
      });
      const result = this.normalizeResponse(response);
      
      console.log('✅ InvoicesAPI.getById result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Get invoice ${id}`);
    }
  }

  /**
   * Crear nueva factura
   * @param {Object} invoiceData - Datos de la factura
   * @returns {Promise<Object>} Factura creada
   */
  async create(invoiceData) {
    try {
      console.log('✨ InvoicesAPI.create called with data:', invoiceData);
      
      const transformedData = this.transformForAPI(invoiceData);
      
      console.log('📦 Datos que se envían al servidor:', transformedData);
      
      const response = await this.http.post(this.buildUrl(), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ InvoicesAPI.create result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, 'Create invoice');
    }
  }

  /**
   * Actualizar factura existente
   * @param {number|string} id - ID de la factura
   * @param {Object} invoiceData - Datos actualizados
   * @returns {Promise<Object>} Factura actualizada
   */
  async update(id, invoiceData) {
    try {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error(`ID inválido: ${id}`);
      }
      
      console.log('📝 InvoicesAPI.update called with id:', numericId, 'data:', invoiceData);
      
      const transformedData = this.transformForAPI(invoiceData);
      console.log('🔄 Datos transformados:', transformedData);
      
      const response = await this.http.put(this.buildUrl(`/${numericId}`), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ InvoicesAPI.update result:', result);
      return result;
    } catch (error) {
      console.error('❌ InvoicesAPI.update error:', error);
      throw this.handleError(error, `Update invoice ${id}`);
    }
  }

  /**
   * Eliminar factura
   * @param {number|string} id - ID de la factura
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async delete(id) {
    try {
      console.log('🗑️ InvoicesAPI.delete called with id:', id);
      
      const response = await this.http.delete(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ InvoicesAPI.delete result:', result);
      return { ...result, id: parseInt(id) };
    } catch (error) {
      throw this.handleError(error, `Delete invoice ${id}`);
    }
  }

  // ==================== ACCIONES ESPECIALES VERIFACTU ====================
  
  /**
   * Transmitir factura a AEAT
   * @param {number|string} invoiceId - ID de la factura
   * @returns {Promise<Object>} Resultado de la transmisión
   */
  async sendToAeat(invoiceId) {
    try {
      console.log('📤 InvoicesAPI.sendToAeat for invoice:', invoiceId);
      
      const response = await this.http.post(
        this.buildUrl(`/${invoiceId}/verifactu/send`)
      );
      const result = this.normalizeResponse(response);
      
      console.log('✅ InvoicesAPI.sendToAeat result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Send invoice ${invoiceId} to AEAT`);
    }
  }

  /**
   * Consultar estado de factura en AEAT
   * @param {number|string} invoiceId - ID de la factura
   * @returns {Promise<Object>} Estado en AEAT
   */
  async checkAeatStatus(invoiceId) {
    try {
      console.log('🔍 InvoicesAPI.checkAeatStatus for invoice:', invoiceId);
      
      const response = await this.http.get(
        this.buildUrl(`/${invoiceId}/verifactu/status`)
      );
      const result = this.normalizeResponse(response);
      
      console.log('✅ InvoicesAPI.checkAeatStatus result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Check AEAT status for invoice ${invoiceId}`);
    }
  }

  /**
   * Anular factura (marca como cancelada)
   * @param {number|string} invoiceId - ID de la factura
   * @returns {Promise<Object>} Factura anulada
   */
  async cancel(invoiceId) {
    try {
      console.log('❌ InvoicesAPI.cancel for invoice:', invoiceId);
      
      // Anular es actualizar con canceled_date
      const response = await this.http.put(
        this.buildUrl(`/${invoiceId}`),
        { canceled_date: new Date().toISOString() }
      );
      const result = this.normalizeResponse(response);
      
      console.log('✅ InvoicesAPI.cancel result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Cancel invoice ${invoiceId}`);
    }
  }

  /**
   * Mapear campos de ordenamiento del frontend al backend
   * @param {string} field - Campo de ordenamiento del frontend
   * @returns {string} Campo mapeado para el backend
   */
  mapSortField(field) {
    if (!field) return 'id';
    
    const sortMapping = {
      'serie': 'serie',
      'number': 'number',
      'data': 'data',
      'client': 'id_client',
      'order': 'id_order',
      'grandtotal': 'grandtotal',
      'payed': 'payed',
      'created_at': 'created_at'
    };
    
    return sortMapping[field] || field;
  }
}

// Crear instancia única para exportar
export const invoicesApi = new InvoicesAPI();

// Para debugging en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.invoicesApi = invoicesApi;
}

export default invoicesApi;
