// src/services/api/ProductsAPI.js
import { BaseAPI } from './BaseAPI.js';
import httpClient from '../httpClient.js';

/**
 * API class específica para productos
 * Maneja todas las operaciones relacionadas con productos
 */
export class ProductsAPI extends BaseAPI {
  constructor() {
    super(httpClient, '/products');
  }

  /**
   * Obtener todos los productos con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Lista de productos con paginación
   */
  async getAll(params = {}) {
    try {
      // Parámetros según la documentación de la API de DecorLujo
      const cleanParams = this.buildParams({
        page: params.page || 1,
        per_page: params.pageSize || params.limit || 20,
        // Ordenamiento con mapeo correcto de campos
        sort_by: this.mapSortField(params.sort || params.sort_by),
        sort_order: params.order || params.sort_order,
        // Filtros específicos de la API DecorLujo
        'filters[name]': params.search || params.q || params.name,
        'filters[active]': params.active !== undefined ? Boolean(params.active) : (params.status === 'published' ? true : undefined),
        'filters[visible]': params.visible !== undefined ? Boolean(params.visible) : undefined,
        'filters[id_category]': params.category_id || params.id_category,
        // Relaciones a incluir
        'with[]': params.with || ['category'],
        ...params.filters
      });

      console.log('🔍 ProductsAPI.getAll called with params:', cleanParams);

      const response = await this.http.get(this.buildUrl(), { 
        params: cleanParams 
      });
      
      const result = this.normalizeListResponse(response);
      console.log('✅ ProductsAPI.getAll result:', result);
      
      return result;
    } catch (error) {
      throw this.handleError(error, 'Get all products');
    }
  }

  /**
   * Obtener un producto por ID
   * @param {number|string} id - ID del producto
   * @returns {Promise<Object>} Producto encontrado
   */
  async getById(id) {
    try {
      console.log('🔍 ProductsAPI.getById called with id:', id);
      
      const response = await this.http.get(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ ProductsAPI.getById result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Get product ${id}`);
    }
  }

  /**
   * Crear nuevo producto
   * @param {Object} productData - Datos del producto
   * @returns {Promise<Object>} Producto creado
   */
  async create(productData) {
    try {
      console.log('✨ ProductsAPI.create called with data:', productData);
      
      // Validaciones específicas para productos según API de DecorLujo
      if (!productData.name || !productData.name.trim()) {
        throw new Error('El nombre del producto es requerido');
      }
      if (!productData.code && !productData.sku) {
        throw new Error('El código del producto es requerido');
      }
      if (!productData.description || !productData.description.trim()) {
        throw new Error('La descripción del producto es requerida');
      }
      if (!productData.meta_title || !productData.meta_title.trim()) {
        throw new Error('El meta title es requerido');
      }
      // tag_extra y tag_extra_name pueden estar vacíos según producto existente ID 265
      // if (!productData.tag_extra || !productData.tag_extra.trim()) {
      //   throw new Error('El tag extra es requerido');
      // }
      // if (!productData.tag_extra_name || !productData.tag_extra_name.trim()) {
      //   throw new Error('El tag extra name es requerido');
      // }
      if (!productData.id_category && !productData.category_id) {
        throw new Error('La categoría es requerida');
      }
      if (productData.tax !== undefined && (parseFloat(productData.tax) < 0 || parseFloat(productData.tax) > 100)) {
        throw new Error('El impuesto debe ser un porcentaje entre 0 y 100');
      }

      // Transformar datos para la API
      const transformedData = this.transformForAPI(productData);
      
      // Log detallado de lo que se envía al servidor
      console.log('📦 Datos exactos que se envían al servidor:');
      console.log('URL:', this.buildUrl());
      console.log('Data:', JSON.stringify(transformedData, null, 2));
      console.log('Data keys:', Object.keys(transformedData));
      console.log('Data values:', Object.values(transformedData));
      
      const response = await this.http.post(this.buildUrl(), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ ProductsAPI.create result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, 'Create product');
    }
  }

  /**
   * Actualizar producto existente
   * @param {number|string} id - ID del producto
   * @param {Object} productData - Datos actualizados
   * @returns {Promise<Object>} Producto actualizado
   */
  async update(id, productData) {
    try {
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error(`ID inválido: ${id}`);
      }
      
      console.log('📝 ProductsAPI.update called with id:', numericId, 'original:', id, 'data:', productData);
      
      const transformedData = this.transformForAPI(productData);
      console.log('🔄 ProductsAPI.transformForAPI result:', transformedData);
      
      const response = await this.http.put(this.buildUrl(`/${numericId}`), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ ProductsAPI.update result:', result);
      return result;
    } catch (error) {
      console.error('❌ ProductsAPI.update error:', error);
      throw this.handleError(error, `Update product ${id}`);
    }
  }

  /**
   * Eliminar producto
   * @param {number|string} id - ID del producto
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async delete(id) {
    try {
      console.log('🗑️ ProductsAPI.delete called with id:', id);
      
      const response = await this.http.delete(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ ProductsAPI.delete result:', result);
      return { ...result, id: parseInt(id) };
    } catch (error) {
      throw this.handleError(error, `Delete product ${id}`);
    }
  }

  /**
   * Obtener productos activos solamente
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de productos activos
   */
  async getActive(params = {}) {
    return this.getAll({ ...params, active: true });
  }

  /**
   * Obtener productos visibles solamente
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de productos visibles
   */
  async getVisible(params = {}) {
    return this.getAll({ ...params, visible: true });
  }

  /**
   * Obtener productos destacados solamente
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de productos destacados
   */
  async getFeatured(params = {}) {
    return this.getAll({ ...params, marked: true });
  }

  /**
   * Obtener productos por categoría
   * @param {number|string} categoryId - ID de la categoría
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de productos de la categoría
   */
  async getByCategory(categoryId, params = {}) {
    return this.getAll({ ...params, category_id: categoryId });
  }

  /**
   * Buscar productos por nombre
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
   * Activar/desactivar producto
   * @param {number|string} id - ID del producto
   * @param {boolean} active - Estado activo
   * @returns {Promise<Object>} Producto actualizado
   */
  async setActive(id, active = true) {
    return this.update(id, { active });
  }

  /**
   * Mostrar/ocultar producto
   * @param {number|string} id - ID del producto
   * @param {boolean} visible - Estado visible
   * @returns {Promise<Object>} Producto actualizado
   */
  async setVisible(id, visible = true) {
    return this.update(id, { visible });
  }

  /**
   * Marcar/desmarcar producto
   * @param {number|string} id - ID del producto
   * @param {boolean} marked - Estado marcado
   * @returns {Promise<Object>} Producto actualizado
   */
  async setMarked(id, marked = true) {
    return this.update(id, { marked });
  }

  /**
   * Alternar producto destacado (marcado)
   * @param {number|string} id - ID del producto
   * @returns {Promise<Object>} Producto actualizado
   */
  async toggleFeatured(id) {
    try {
      console.log('🔄 ProductsAPI.toggleFeatured called with id:', id);
      // Para toggle, necesitamos primero obtener el producto actual
      const currentProduct = await this.getById(id);
      const newMarkedStatus = !currentProduct.marked;
      return this.update(id, { marked: newMarkedStatus });
    } catch (error) {
      throw this.handleError(error, `Toggle featured product ${id}`);
    }
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
      'category': 'id_category',
      'tax': 'tax',
      'units': 'units',
      'status': 'active',
      'created_at': 'created_at',
      'updated_at': 'updated_at',
      // Para compatibilidad con labels en español si llegan
      'Producto': 'name',
      'Categoría': 'id_category',
      'Impuesto': 'tax',
      'Unidades': 'units',
      'Estado': 'active',
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
    console.log('🔄 ProductsAPI.transformForAPI input data:', data);
    
      // Mapeo según la documentación de la API de DecorLujo
      const transformed = {
        // Campos requeridos
        name: data.name?.trim() || '',
        description: data.description?.trim() || '',
        id_category: data.id_category !== undefined ? (data.id_category === null || data.id_category === '' ? null : parseInt(data.id_category) || null) : (data.category_id !== undefined ? (data.category_id === null || data.category_id === '' ? null : parseInt(data.category_id) || null) : null),
        code: data.sku?.trim() || data.code?.trim() || '', // SKU se mapea a 'code'
        tax: data.tax !== undefined ? parseFloat(data.tax) || 0 : 0,
        units: data.units?.trim() || 'UDS.',
        meta_title: data.meta_title?.trim() || data.name?.trim() || '',
      
      // Campos específicos de DecorLujo
      tag_extra: data.tag_extra?.trim() || data.slug?.trim() || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : ''),
      tag_extra_name: data.tag_extra_name?.trim() || data.name?.trim() || '',
      
      // Campos opcionales - deben ser strings vacíos ('') no null
      url_image: data.url_image?.trim() || data.image_url?.trim() || '',
      comments: data.comments?.trim() || '', // comments puede ser null pero mejor usar string vacío
      meta_keywords: data.meta_keywords?.trim() || '',
      meta_description: data.meta_description?.trim() || '',
      marked: data.marked !== undefined ? Boolean(data.marked) : Boolean(data.featured),
      visible: data.visible !== undefined ? Boolean(data.visible) : true,
      active: data.active !== undefined ? Boolean(data.active) : true
    };
    
    // Eliminar campos undefined o null para no enviarlos al servidor
    Object.keys(transformed).forEach(key => {
      if (transformed[key] === undefined) {
        delete transformed[key];
      }
    });
    
    console.log('✅ ProductsAPI.transformForAPI output data:', transformed);
    return transformed;
  }
}

// Crear instancia única para exportar
export const productsApi = new ProductsAPI();

// Para debugging en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.productsApi = productsApi;
}

export default productsApi;
