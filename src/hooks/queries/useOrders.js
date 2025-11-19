// src/hooks/queries/useOrders.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../../services/api/OrdersAPI.js';

/**
 * Hook para obtener la lista de órdenes con paginación y filtros
 * @param {Object} params - Parámetros de consulta (page, pageSize, sort, order, filters)
 * @returns {Object} Query result con data, isLoading, error, etc.
 */
export function useOrdersQuery(params = {}) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.getAll(params),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener una orden específica por ID
 * @param {number|string} id - ID de la orden
 * @returns {Object} Query result con data, isLoading, error, etc.
 */
export function useOrderQuery(id) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para crear una nueva orden
 * @param {Object} options - Opciones de mutación (onSuccess, onError)
 * @returns {Object} Mutation result
 */
export function useCreateOrderMutation(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData) => ordersApi.create(orderData),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['orders']);
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: options.onError,
  });
}

/**
 * Hook para actualizar una orden
 * @param {Object} options - Opciones de mutación (onSuccess, onError)
 * @returns {Object} Mutation result
 */
export function useUpdateOrderMutation(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => ordersApi.update(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['orders', variables.id]);
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: options.onError,
  });
}

/**
 * Hook para eliminar una orden
 * @param {Object} options - Opciones de mutación (onSuccess, onError)
 * @returns {Object} Mutation result
 */
export function useDeleteOrderMutation(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => ordersApi.delete(id),
    onSuccess: (data, deletedId, context) => {
      queryClient.invalidateQueries(['orders']);
      queryClient.removeQueries(['orders', deletedId]);
      if (options.onSuccess) {
        options.onSuccess(data, deletedId, context);
      }
    },
    onError: options.onError,
  });
}

/**
 * Hook para obtener productos de una orden
 * @param {number|string} orderId - ID de la orden
 * @returns {Object} Query result
 */
export function useOrderProductsQuery(orderId) {
  return useQuery({
    queryKey: ['orders', orderId, 'products'],
    queryFn: () => ordersApi.getProducts(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para obtener direcciones de una orden
 * @param {number|string} orderId - ID de la orden
 * @returns {Object} Query result
 */
export function useOrderAddressesQuery(orderId) {
  return useQuery({
    queryKey: ['orders', orderId, 'addresses'],
    queryFn: () => ordersApi.getAddresses(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5,
  });
}
