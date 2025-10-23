// src/services/api/AdminAccountsAPI.js
import { BaseAPI } from './BaseAPI.js';
import httpClient from '../httpClient.js';

/**
 * API class específica para cuentas de administrador
 * Maneja todas las operaciones relacionadas con admin_accounts
 */
export class AdminAccountsAPI extends BaseAPI {
  constructor() {
    super(httpClient, '/admin_accounts');
  }
  /**
   * Obtener todas las cuentas de administrador con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Lista de cuentas con paginación
   */
  async getAll(params = {}) {
    try {
      const cleanParams = this.buildParams({
        page: params.page || 1,
        per_page: params.pageSize || params.limit || 15, // Laravel usa per_page, default 15
        sort_by: params.sort || 'id',
        sort_order: params.order || 'asc',
        with: params.with || ['store'], // Incluir store por defecto
        filters: {
          name: params.search || params.q,
          user: params.user,
          email: params.email,
          active: params.active,
          id_store: params.id_store,
          admin: params.admin,
          super_admin: params.super_admin,
          ...params.filters
        }
      });

      console.log('🔍 AdminAccountsAPI.getAll called with params:', cleanParams);

      const response = await this.http.get(this.buildUrl(), { 
        params: cleanParams 
      });
      
      const result = this.normalizeListResponse(response);
      console.log('✅ AdminAccountsAPI.getAll result:', result);
      
      return result;
    } catch (error) {
      throw this.handleError(error, 'Get all admin accounts');
    }
  }

  /**
   * Obtener una cuenta de administrador por ID
   * @param {number|string} id - ID de la cuenta
   * @returns {Promise<Object>} Cuenta encontrada
   */
  async getById(id) {
    try {
      console.log('🔍 AdminAccountsAPI.getById called with id:', id);
      
      const response = await this.http.get(this.buildUrl(`/${id}`), {
        params: { with: ['store'] } // Incluir información de la tienda
      });
      const result = this.normalizeResponse(response);
      
      console.log('✅ AdminAccountsAPI.getById result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, `Get admin account ${id}`);
    }
  }

  /**
   * Crear nueva cuenta de administrador
   * @param {Object} accountData - Datos de la cuenta
   * @returns {Promise<Object>} Cuenta creada
   */
  async create(accountData) {
    try {
      console.log('✨ AdminAccountsAPI.create called with data:', accountData);
      
      // Validaciones específicas para cuentas de administrador
      if (!accountData.name || !accountData.name.trim()) {
        throw new Error('El nombre del administrador es requerido');
      }

      if (!accountData.user || !accountData.user.trim()) {
        throw new Error('El nombre de usuario es requerido');
      }

      if (!accountData.id_store) {
        throw new Error('La tienda es requerida');
      }

      if (!accountData.password || accountData.password.length < 6) {
        throw new Error('La contraseña es requerida y debe tener al menos 6 caracteres');
      }

      // Transformar datos para la API
      const transformedData = this.transformForAPI(accountData);
      
      const response = await this.http.post(this.buildUrl(), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ AdminAccountsAPI.create result:', result);
      return result;
    } catch (error) {
      throw this.handleError(error, 'Create admin account');
    }
  }

  /**
   * Actualizar cuenta de administrador existente
   * @param {number|string} id - ID de la cuenta
   * @param {Object} accountData - Datos actualizados
   * @returns {Promise<Object>} Cuenta actualizada
   */
  async update(id, accountData) {
    try {
      // Asegurar que el ID sea un número entero
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error(`ID inválido: ${id}`);
      }
      
      console.log('📝 AdminAccountsAPI.update called with id:', numericId, 'original:', id, 'data:', accountData);
      
      // Transformar datos para la API
      const transformedData = this.transformForAPI(accountData);
      console.log('🔄 AdminAccountsAPI.transformForAPI result:', transformedData);
      
      const response = await this.http.put(this.buildUrl(`/${numericId}`), transformedData);
      const result = this.normalizeResponse(response);
      
      console.log('✅ AdminAccountsAPI.update result:', result);
      return result;
    } catch (error) {
      console.error('❌ AdminAccountsAPI.update error:', error);
      throw this.handleError(error, `Update admin account ${id}`);
    }
  }

  /**
   * Eliminar cuenta de administrador
   * @param {number|string} id - ID de la cuenta
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async delete(id) {
    try {
      console.log('🗑️ AdminAccountsAPI.delete called with id:', id);
      
      const response = await this.http.delete(this.buildUrl(`/${id}`));
      const result = this.normalizeResponse(response);
      
      console.log('✅ AdminAccountsAPI.delete result:', result);
      return { ...result, id: parseInt(id) };
    } catch (error) {
      throw this.handleError(error, `Delete admin account ${id}`);
    }
  }

  /**
   * Obtener cuentas activas solamente
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de cuentas activas
   */
  async getActive(params = {}) {
    return this.getAll({ ...params, active: true });
  }

  /**
   * Buscar cuentas por tienda
   * @param {number} storeId - ID de la tienda
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de cuentas de la tienda especificada
   */
  async getByStore(storeId, params = {}) {
    if (!storeId) {
      throw new Error('ID de tienda es requerido');
    }
    return this.getAll({ ...params, id_store: storeId });
  }

  /**
   * Obtener super administradores
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de super administradores
   */
  async getSuperAdmins(params = {}) {
    return this.getAll({ ...params, super_admin: true });
  }

  /**
   * Obtener administradores regulares
   * @param {Object} params - Parámetros adicionales
   * @returns {Promise<Object>} Lista de administradores regulares
   */
  async getRegularAdmins(params = {}) {
    return this.getAll({ ...params, admin: true, super_admin: false });
  }

  // Acciones personalizadas específicas para cuentas de administrador

  /**
   * Activar/desactivar cuenta
   * @param {number|string} id - ID de la cuenta
   * @param {boolean} active - Estado activo
   * @returns {Promise<Object>} Cuenta actualizada
   */
  async setActive(id, active = true) {
    return this.update(id, { active });
  }

  /**
   * Establecer como administrador
   * @param {number|string} id - ID de la cuenta
   * @param {boolean} isAdmin - Si es administrador
   * @returns {Promise<Object>} Cuenta actualizada
   */
  async setAdmin(id, isAdmin = true) {
    return this.update(id, { admin: isAdmin });
  }

  /**
   * Establecer como super administrador
   * @param {number|string} id - ID de la cuenta
   * @param {boolean} isSuperAdmin - Si es super administrador
   * @returns {Promise<Object>} Cuenta actualizada
   */
  async setSuperAdmin(id, isSuperAdmin = true) {
    return this.update(id, { super_admin: isSuperAdmin });
  }

  /**
   * Cambiar contraseña
   * @param {number|string} id - ID de la cuenta
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<Object>} Confirmación
   */
  async changePassword(id, newPassword) {
    try {
      console.log('🔐 AdminAccountsAPI.changePassword called with id:', id);
      
      if (!newPassword || newPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Como no veo un endpoint específico para cambiar contraseña, uso update
      const response = await this.update(id, { password: newPassword });
      
      console.log('✅ AdminAccountsAPI.changePassword result:', response);
      return response;
    } catch (error) {
      throw this.handleError(error, `Change password for admin account ${id}`);
    }
  }

  /**
   * Transformar datos para envío a la API
   * @param {Object} data - Datos originales
   * @returns {Object} Datos transformados
   */
  transformForAPI(data) {
    console.log('🔄 AdminAccountsAPI.transformForAPI input data:', data);
    
    const transformed = {
      name: data.name?.trim(),
      user: data.user?.trim(),
      email: data.email?.trim() || null,
      id_store: data.id_store ? parseInt(data.id_store) : undefined,
      admin: data.admin !== undefined ? Boolean(data.admin) : undefined,
      super_admin: data.super_admin !== undefined ? Boolean(data.super_admin) : undefined,
      active: data.active !== undefined ? Boolean(data.active) : undefined,
      // Solo incluir password si se proporciona (para creación o cambio de contraseña)
      ...(data.password && { password: data.password })
    };
    
    // Eliminar campos undefined para no enviarlos al servidor
    Object.keys(transformed).forEach(key => {
      if (transformed[key] === undefined) {
        delete transformed[key];
      }
    });
    
    console.log('✅ AdminAccountsAPI.transformForAPI output data:', transformed);
    return transformed;
  }
}

// Crear instancia única para exportar
export const adminAccountsApi = new AdminAccountsAPI();

// Para debugging en desarrollo
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.adminAccountsApi = adminAccountsApi;
}

export default adminAccountsApi;