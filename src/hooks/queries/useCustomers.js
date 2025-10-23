import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../../services/api/CustomersAPI.js';

/**
 * Query keys para clientes - centralizados para consistencia
 */
export const customersKeys = {
  all: ['customers'],
  lists: () => [...customersKeys.all, 'list'],
  list: (filters) => [...customersKeys.lists(), { filters }],
  details: () => [...customersKeys.all, 'detail'],
  detail: (id) => [...customersKeys.details(), id],
  withAccount: (params) => [...customersKeys.all, 'withAccount', params],
  guests: (params) => [...customersKeys.all, 'guests', params],
  active: (params) => [...customersKeys.all, 'active', params],
  search: (term, params) => [...customersKeys.all, 'search', term, params],
  orders: (customerId, params) => [...customersKeys.detail(customerId), 'orders', params],
  addresses: (customerId, params) => [...customersKeys.detail(customerId), 'addresses', params],
};

/**
 * Hook para obtener lista de clientes con filtros y paginación
 * @param {Object} filters - Filtros y parámetros de paginación
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con datos de clientes
 */
export const useCustomersQuery = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: customersKeys.list(filters),
    queryFn: () => customersApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    ...options,
  });
};

/**
 * Hook para obtener un cliente específico por ID
 * @param {number|string} id - ID del cliente
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con datos del cliente
 */
export const useCustomerQuery = (id, options = {}) => {
  return useQuery({
    queryKey: customersKeys.detail(id),
    queryFn: () => customersApi.getById(id),
    enabled: !!id, // Solo ejecutar si tenemos ID
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook para obtener clientes con cuenta registrada
 * @param {Object} params - Parámetros adicionales
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con clientes con cuenta
 */
export const useCustomersWithAccountQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: customersKeys.withAccount(params),
    queryFn: () => customersApi.getWithAccount(params),
    staleTime: 10 * 60 * 1000, // 10 minutos - datos más estables
    ...options,
  });
};

/**
 * Hook para obtener clientes invitados (sin cuenta)
 * @param {Object} params - Parámetros adicionales
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con clientes invitados
 */
export const useGuestCustomersQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: customersKeys.guests(params),
    queryFn: () => customersApi.getGuests(params),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook para obtener clientes activos
 * @param {Object} params - Parámetros adicionales
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con clientes activos
 */
export const useActiveCustomersQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: customersKeys.active(params),
    queryFn: () => customersApi.getActive(params),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook para buscar clientes
 * @param {string} searchTerm - Término de búsqueda
 * @param {Object} params - Parámetros adicionales
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con resultados de búsqueda
 */
export const useSearchCustomersQuery = (searchTerm, params = {}, options = {}) => {
  return useQuery({
    queryKey: customersKeys.search(searchTerm, params),
    queryFn: () => customersApi.search(searchTerm, params),
    enabled: !!searchTerm && searchTerm.length >= 2, // Solo buscar con 2+ caracteres
    staleTime: 2 * 60 * 1000, // 2 minutos - búsquedas más dinámicas
    ...options,
  });
};

/**
 * Hook para obtener pedidos de un cliente
 * @param {number|string} customerId - ID del cliente
 * @param {Object} params - Parámetros adicionales
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con pedidos del cliente
 */
export const useCustomerOrdersQuery = (customerId, params = {}, options = {}) => {
  return useQuery({
    queryKey: customersKeys.orders(customerId, params),
    queryFn: () => customersApi.getOrders(customerId, params),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook para obtener direcciones de un cliente
 * @param {number|string} customerId - ID del cliente
 * @param {Object} params - Parámetros adicionales
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con direcciones del cliente
 */
export const useCustomerAddressesQuery = (customerId, params = {}, options = {}) => {
  return useQuery({
    queryKey: customersKeys.addresses(customerId, params),
    queryFn: () => customersApi.getAddresses(customerId, params),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// ===== MUTATIONS =====

/**
 * Hook para crear nuevo cliente
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useCreateCustomerMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerData) => customersApi.create(customerData),
    onSuccess: (newCustomer, variables) => {
      // Invalidar todas las queries relacionadas con clientes
      queryClient.invalidateQueries({
        queryKey: customersKeys.all
      });
      
      // Agregar el nuevo cliente al cache de detalle
      queryClient.setQueryData(
        customersKeys.detail(newCustomer.id), 
        newCustomer
      );

      console.log('✅ Customer created successfully:', newCustomer);
    },
    onError: (error) => {
      console.error('❌ Failed to create customer:', error);
    },
    ...options,
  });
};

/**
 * Hook para actualizar cliente existente
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useUpdateCustomerMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => {
      console.log('🚀 useUpdateCustomerMutation.mutationFn called with:', { id, data });
      return customersApi.update(id, data);
    },
    onSuccess: (updatedCustomer, { id }) => {
      console.log('✅ useUpdateCustomerMutation.onSuccess:', updatedCustomer);
      
      // Actualizar el cache de detalle con datos reales del servidor
      queryClient.setQueryData(
        customersKeys.detail(id), 
        updatedCustomer
      );

      // ESTRATEGIA SIMPLE: Solo actualizar el item en las listas existentes
      const allListQueries = queryClient.getQueriesData({
        queryKey: customersKeys.lists()
      });
      
      // Actualizar el item en todas las listas donde aparezca
      allListQueries.forEach(([queryKey, queryData]) => {
        if (queryData?.items) {
          const updatedItems = queryData.items.map(item => 
            String(item.id) === String(id) ? updatedCustomer : item
          );
          
          queryClient.setQueryData(queryKey, {
            ...queryData,
            items: updatedItems
          });
        }
      });
      
      console.log('✅ Customer updated successfully:', updatedCustomer);
      console.log('🔄 Customer updated in existing lists without refetch');
      
      // Llamar callback personalizado si existe
      if (options.onSuccess) {
        options.onSuccess(updatedCustomer, { id });
      }
    },
    onError: (error, { id }) => {
      console.error('❌ useUpdateCustomerMutation.onError:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Llamar callback personalizado si existe
      if (options.onError) {
        options.onError(error, { id });
      }
    }
  });
};

/**
 * Hook para eliminar cliente
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useDeleteCustomerMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => {
      console.log('🗑️ useDeleteCustomerMutation.mutationFn called with ID:', id);
      return customersApi.delete(id);
    },
    onSuccess: (result, id) => {
      console.log('✅ useDeleteCustomerMutation.onSuccess:', { result, id });
      
      // Remover del cache de detalle específico
      queryClient.removeQueries({
        queryKey: customersKeys.detail(id)
      });

      // Invalidar TODAS las queries relacionadas con clientes
      queryClient.invalidateQueries({
        queryKey: customersKeys.all
      });
      
      // También invalidar queries específicas
      queryClient.invalidateQueries({
        queryKey: customersKeys.lists()
      });
      
      queryClient.invalidateQueries({
        queryKey: customersKeys.active()
      });
      
      queryClient.invalidateQueries({
        queryKey: customersKeys.withAccount()
      });
      
      queryClient.invalidateQueries({
        queryKey: customersKeys.guests()
      });
      
      // Llamar callback personalizado si existe
      if (options.onSuccess) {
        options.onSuccess(result, id);
      }
    },
    onError: (error, id) => {
      console.error('❌ useDeleteCustomerMutation.onError:', { error, id });
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Llamar callback personalizado si existe
      if (options.onError) {
        options.onError(error, id);
      }
    }
  });
};

// ===== CUSTOM ACTIONS MUTATIONS =====

/**
 * Hook para activar/desactivar cliente
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useToggleCustomerActiveMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }) => customersApi.setActive(id, active),
    onSuccess: (updatedCustomer, { id }) => {
      // Actualizar cache de detalle
      queryClient.setQueryData(customersKeys.detail(id), updatedCustomer);
      
      // Invalidar listas para reflejar cambios
      queryClient.invalidateQueries(customersKeys.lists());
      queryClient.invalidateQueries(customersKeys.active());
      
      console.log(`✅ Customer ${id} ${updatedCustomer.active ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error) => {
      console.error('❌ Failed to toggle customer active state:', error);
    },
    ...options,
  });
};

/**
 * Hook para actualizar información de contacto
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useUpdateCustomerContactMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, contactData }) => customersApi.updateContactInfo(id, contactData),
    onSuccess: (updatedCustomer, { id }) => {
      // Actualizar cache de detalle
      queryClient.setQueryData(customersKeys.detail(id), updatedCustomer);
      
      // Invalidar listas para reflejar cambios
      queryClient.invalidateQueries(customersKeys.lists());
      
      console.log(`✅ Customer ${id} contact info updated successfully`);
    },
    onError: (error) => {
      console.error('❌ Failed to update customer contact info:', error);
    },
    ...options,
  });
};
