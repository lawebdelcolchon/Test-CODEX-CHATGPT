// src/hooks/queries/useInvoices.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '../../services/api/InvoicesAPI.js';

/**
 * Hook para obtener la lista de facturas con paginación y filtros
 * @param {Object} params - Parámetros de consulta
 * @returns {Object} Query result
 */
export function useInvoicesQuery(params = {}) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoicesApi.getAll(params),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para obtener una factura específica por ID
 * @param {number|string} id - ID de la factura
 * @returns {Object} Query result
 */
export function useInvoiceQuery(id) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => invoicesApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para crear una nueva factura
 * @param {Object} options - Opciones de mutación
 * @returns {Object} Mutation result
 */
export function useCreateInvoiceMutation(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (invoiceData) => invoicesApi.create(invoiceData),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['invoices']);
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: options.onError,
  });
}

/**
 * Hook para actualizar una factura
 * @param {Object} options - Opciones de mutación
 * @returns {Object} Mutation result
 */
export function useUpdateInvoiceMutation(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => invoicesApi.update(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['invoices']);
      queryClient.invalidateQueries(['invoices', variables.id]);
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: options.onError,
  });
}

/**
 * Hook para eliminar una factura
 * @param {Object} options - Opciones de mutación
 * @returns {Object} Mutation result
 */
export function useDeleteInvoiceMutation(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => invoicesApi.delete(id),
    onSuccess: (data, deletedId, context) => {
      queryClient.invalidateQueries(['invoices']);
      queryClient.removeQueries(['invoices', deletedId]);
      if (options.onSuccess) {
        options.onSuccess(data, deletedId, context);
      }
    },
    onError: options.onError,
  });
}

// ==================== ACCIONES ESPECIALES ====================

/**
 * Hook para transmitir factura a AEAT
 * @param {Object} options - Opciones de mutación
 * @returns {Object} Mutation result
 */
export function useSendToAeatMutation(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (invoiceId) => invoicesApi.sendToAeat(invoiceId),
    onSuccess: (data, invoiceId, context) => {
      queryClient.invalidateQueries(['invoices']);
      queryClient.invalidateQueries(['invoices', invoiceId]);
      if (options.onSuccess) {
        options.onSuccess(data, invoiceId, context);
      }
    },
    onError: options.onError,
  });
}

/**
 * Hook para consultar estado en AEAT
 * @param {number|string} invoiceId - ID de la factura
 * @param {Object} options - Opciones de query
 * @returns {Object} Query result
 */
export function useCheckAeatStatusQuery(invoiceId, options = {}) {
  return useQuery({
    queryKey: ['invoices', invoiceId, 'aeat-status'],
    queryFn: () => invoicesApi.checkAeatStatus(invoiceId),
    enabled: !!invoiceId && (options.enabled !== false),
    staleTime: 1000 * 60, // 1 minuto
    ...options
  });
}

/**
 * Hook para anular una factura
 * @param {Object} options - Opciones de mutación
 * @returns {Object} Mutation result
 */
export function useCancelInvoiceMutation(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (invoiceId) => invoicesApi.cancel(invoiceId),
    onSuccess: (data, invoiceId, context) => {
      queryClient.invalidateQueries(['invoices']);
      queryClient.invalidateQueries(['invoices', invoiceId]);
      if (options.onSuccess) {
        options.onSuccess(data, invoiceId, context);
      }
    },
    onError: options.onError,
  });
}
