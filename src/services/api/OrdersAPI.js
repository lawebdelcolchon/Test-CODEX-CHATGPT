// src/services/api/OrdersAPI.js
import { BaseAPI } from './BaseAPI.js';
import httpClient from '../httpClient.js';

/**
 * API class específica para órdenes de clientes
 * Maneja todas las operaciones relacionadas con órdenes, productos y direcciones
 */
export class OrdersAPI extends BaseAPI {
  constructor() {
    super(httpClient, '/orders');
  }

  /**
   * Obtener todas las órdenes con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Lista de órdenes con paginación
   */
  async getAll(params = {}) {
    try {
      const cleanParams = this.buildParams({
        page: params.page || 1,
        per_page: params.pageSize || params.limit || 20,
        sort_by: this.mapSortField(params.sort || params.sort_by),
        sort_order: params.order || params.sort_order,
        'filters[code_order]': params.search || params.q || params.code_order,
        'filters[id_client]': params.id_client,
        'filters[status_order]': params.status_order,
        'with[]': params.with || ['client', 'store', 'orders_products', 'orders_addresses'],
        ...params.filters
      });

      console.log('🔍 OrdersAPI.getAll called with params:', cleanParams);

      const response = await this.http.get(this.buildUrl(), { 
        params: cleanParams 
      });

      const result = this.normalizeListResponse(response);
      console.log('✅ OrdersAPI.getAll result:', result);

      return result;
    } catch (error) {
      throw this.handleError(error, 'Get all orders');
    }
  }

  /**
   * Obtener una orden por ID
   * @param {number|string} id - ID de la orden
   * @returns {Promise<Object>} Orden encontrada
   */
  async getById(id) {
    try {
      console.log('🔍 OrdersAPI.getById called with id:', id);
      
      const response = await this.http.get(this.buildUrl(`/${id}`), {
        params: {
          'with[]': ['client', 'store', 'affiliate', 'platform', 'coupon', 'orders_products', 'orders_addresses', 'status']
        }
      });
      const result = this.normalizeResponse(response);
      
      console.log('✅ OrdersAPI.getById result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Get order ${id}`);
    }
  }

  /**
   * Crear nueva orden
   * @param {Object} orderData - Datos de la orden
   * @returns {Promise<Object>} Orden creada
   */
  async create(orderData) {
    try {
      console.log('✨ OrdersAPI.create called with data:', orderData);
      
      // Validaciones básicas
      if (!orderData.id_client) {
        throw new Error('El ID del cliente es requerido');
      }
      if (!orderData.id_store) {
        throw new Error('El ID de la tienda es requerido');
      }
      
      const transformedData = this.transformForAPI(orderData);
      
      console.log('📦 Datos que se envían al servidor:', transformedData);
      
      const response = await this.http.post(this.buildUrl(), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ OrdersAPI.create result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, 'Create order');
    }
  }

  /**
   * Actualizar orden existente
   * @param {number|string} id - ID de la orden
   * @param {Object} orderData - Datos actualizados
   * @returns {Promise<Object>} Orden actualizada
   */
  async update(id, orderData) {
    try {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error(`ID inválido: ${id}`);
      }
      
      console.log('📝 OrdersAPI.update called with id:', numericId, 'data:', orderData);
      
      const transformedData = this.transformForAPI(orderData);
      console.log('🔄 Datos transformados:', transformedData);
      
      const response = await this.http.put(this.buildUrl(`/${numericId}`), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ OrdersAPI.update result:', result);
      return result;
    } catch (error) {
      console.error('❌ OrdersAPI.update error:', error);
      throw this.handleError(error, `Update order ${id}`);
    }
  }

  /**
   * Eliminar orden
   * @param {number|string} id - ID de la orden
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async delete(id) {
    try {
      console.log('🗑️ OrdersAPI.delete called with id:', id);
      
      const response = await this.http.delete(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ OrdersAPI.delete result:', result);
      return { ...result, id: parseInt(id) };
    } catch (error) {
      throw this.handleError(error, `Delete order ${id}`);
    }
  }

  // ==================== PRODUCTOS ====================
  
  /**
   * Obtener productos de una orden
   * @param {number|string} orderId - ID de la orden
   * @returns {Promise<Array>} Lista de productos
   */
  async getProducts(orderId) {
    try {
      console.log('🔍 OrdersAPI.getProducts for order:', orderId);
      
      const response = await this.http.get(this.buildUrl(`/${orderId}/products`));
      const result = this.normalizeListResponse(response);
      
      console.log('✅ OrdersAPI.getProducts result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Get products for order ${orderId}`);
    }
  }

  /**
   * Agregar producto a una orden
   * @param {number|string} orderId - ID de la orden
   * @param {Object} productData - Datos del producto
   * @returns {Promise<Object>} Producto agregado
   */
  async addProduct(orderId, productData) {
    try {
      console.log('✨ OrdersAPI.addProduct for order:', orderId, 'data:', productData);
      
      const response = await this.http.post(
        this.buildUrl(`/${orderId}/products`), 
        productData
      );
      const result = this.normalizeResponse(response);
      
      console.log('✅ OrdersAPI.addProduct result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Add product to order ${orderId}`);
    }
  }

  // ==================== DIRECCIONES ====================
  
  /**
   * Obtener direcciones de una orden
   * @param {number|string} orderId - ID de la orden
   * @returns {Promise<Array>} Lista de direcciones
   */
  async getAddresses(orderId) {
    try {
      console.log('🔍 OrdersAPI.getAddresses for order:', orderId);
      
      const response = await this.http.get(this.buildUrl(`/${orderId}/addresses`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ OrdersAPI.getAddresses result:', result);
      return Array.isArray(result) ? result : result.data || [];
    } catch (error) {
      throw this.handleError(error, `Get addresses for order ${orderId}`);
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
      'code_order': 'code_order',
      'date': 'date',
      'client': 'id_client',
      'status': 'status_order',
      'grandtotal': 'grandtotal',
      'created_at': 'created_at'
    };
    
    return sortMapping[field] || field;
  }
}

// Crear instancia única para exportar
export const ordersApi = new OrdersAPI();

// Para debugging en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.ordersApi = ordersApi;
}

export default ordersApi;
