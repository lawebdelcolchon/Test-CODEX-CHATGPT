// src/hooks/queries/useSuppliers.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import suppliersApi from '../../services/api/SuppliersAPI.js';

// Query Keys
export const suppliersQueryKeys = {
  all: ['suppliers'],
  lists: () => [...suppliersQueryKeys.all, 'list'],
  list: (params) => [...suppliersQueryKeys.lists(), params],
  details: () => [...suppliersQueryKeys.all, 'detail'],
  detail: (id) => [...suppliersQueryKeys.details(), id],
  active: (params) => [...suppliersQueryKeys.all, 'active', params],
  companies: (params) => [...suppliersQueryKeys.all, 'companies', params],
};

// Queries
export const useSuppliersQuery = (params = {}) => {
  return useQuery({
    queryKey: suppliersQueryKeys.list(params),
    queryFn: () => suppliersApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useSupplierQuery = (id) => {
  return useQuery({
    queryKey: suppliersQueryKeys.detail(id),
    queryFn: () => suppliersApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useActiveSuppliersQuery = (params = {}) => {
  return useQuery({
    queryKey: suppliersQueryKeys.active(params),
    queryFn: () => suppliersApi.getActive(params),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useSupplierCompaniesQuery = (params = {}) => {
  return useQuery({
    queryKey: suppliersQueryKeys.companies(params),
    queryFn: () => suppliersApi.getCompanies(params),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

// Mutations
export const useCreateSupplierMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => {
      console.log('🚀 useCreateSupplierMutation.mutationFn called with:', data);
      
      return suppliersApi.create(data);
    },
    onMutate: async (newSupplier) => {
      console.log('🔄 useCreateSupplierMutation.onMutate - optimistic update');
      // Optimistic update could be implemented here
    },
    onSuccess: (data) => {
      console.log('✅ useCreateSupplierMutation.onSuccess:', data);
      
      // Invalidate and refetch suppliers lists
      queryClient.invalidateQueries({ queryKey: suppliersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: suppliersQueryKeys.active() });
      queryClient.invalidateQueries({ queryKey: suppliersQueryKeys.companies() });
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      console.error('❌ useCreateSupplierMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export const useUpdateSupplierMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => {
      console.log('🚀 useUpdateSupplierMutation.mutationFn called with:', { id, data });
      
      return suppliersApi.update(id, data);
    },
    onMutate: async ({ id, data }) => {
      console.log('🔄 useUpdateSupplierMutation.onMutate - optimistic update for id:', id);
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: suppliersQueryKeys.detail(id) });
      
      // Snapshot previous value
      const previousSupplier = queryClient.getQueryData(suppliersQueryKeys.detail(id));
      
      // Optimistically update to new value
      if (previousSupplier) {
        queryClient.setQueryData(suppliersQueryKeys.detail(id), {
          ...previousSupplier,
          ...data,
          updated_at: new Date().toISOString()
        });
      }
      
      return { previousSupplier };
    },
    onSuccess: (updatedSupplier, { id }) => {
      console.log('✅ useUpdateSupplierMutation.onSuccess:', updatedSupplier);
      
      // Forzar la invalidación del cache del supplier específico
      queryClient.invalidateQueries({ queryKey: suppliersQueryKeys.detail(id) });
      
      // Update the detail cache with the server response
      queryClient.setQueryData(suppliersQueryKeys.detail(id), updatedSupplier);
      
      // Update the supplier in any lists that might contain it
      queryClient.setQueriesData({ queryKey: suppliersQueryKeys.lists() }, (oldData) => {
        if (!oldData?.items) return oldData;
        
        return {
          ...oldData,
          items: oldData.items.map(item => 
            item.id === updatedSupplier.id ? updatedSupplier : item
          )
        };
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: suppliersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: suppliersQueryKeys.active() });
      queryClient.invalidateQueries({ queryKey: suppliersQueryKeys.companies() });
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(updatedSupplier);
      }
    },
    onError: (error, { id }, context) => {
      console.error('❌ useUpdateSupplierMutation.onError:', error);
      
      // Rollback optimistic update
      if (context?.previousSupplier) {
        queryClient.setQueryData(suppliersQueryKeys.detail(id), context.previousSupplier);
      }
      
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export const useDeleteSupplierMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => {
      console.log('🚀 useDeleteSupplierMutation.mutationFn called with id:', id);
      return suppliersApi.delete(id);
    },
    onSuccess: (result, deletedId) => {
      console.log('✅ useDeleteSupplierMutation.onSuccess for id:', deletedId);
      
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: suppliersQueryKeys.detail(deletedId) });
      
      // Update lists by filtering out the deleted item
      queryClient.setQueriesData({ queryKey: suppliersQueryKeys.lists() }, (oldData) => {
        if (!oldData?.items) return oldData;
        
        return {
          ...oldData,
          items: oldData.items.filter(item => item.id !== deletedId),
          pagination: oldData.pagination ? {
            ...oldData.pagination,
            total: Math.max(0, oldData.pagination.total - 1)
          } : null
        };
      });
      
      // Invalidate all queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: suppliersQueryKeys.all });
      
      console.log('🔄 useDeleteSupplierMutation - Cache updated and queries invalidated');
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(result, deletedId);
      }
    },
    onError: (error) => {
      console.error('❌ useDeleteSupplierMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

// Status mutations
export const useUpdateSupplierStatusMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, active }) => {
      console.log('🚀 useUpdateSupplierStatusMutation.mutationFn called with:', { id, active });
      return suppliersApi.setActive(id, active);
    },
    onSuccess: (updatedSupplier) => {
      console.log('✅ useUpdateSupplierStatusMutation.onSuccess:', updatedSupplier);
      
      // Update caches
      queryClient.setQueryData(suppliersQueryKeys.detail(updatedSupplier.id), updatedSupplier);
      
      queryClient.setQueriesData({ queryKey: suppliersQueryKeys.lists() }, (oldData) => {
        if (!oldData?.items) return oldData;
        
        return {
          ...oldData,
          items: oldData.items.map(item => 
            item.id === updatedSupplier.id ? updatedSupplier : item
          )
        };
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: suppliersQueryKeys.active() });
      
      if (options.onSuccess) {
        options.onSuccess(updatedSupplier);
      }
    },
    onError: (error) => {
      console.error('❌ useUpdateSupplierStatusMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

// Aliases para compatibilidad con otros archivos
export const useSuppliers = useSuppliersQuery;
export const useSupplier = useSupplierQuery;
export const useActiveSuppliers = useActiveSuppliersQuery;
export const useSupplierCompanies = useSupplierCompaniesQuery;
export const useCreateSupplier = useCreateSupplierMutation;
export const useEditSupplierMutation = useUpdateSupplierMutation;
export const useDeleteSupplier = useDeleteSupplierMutation;
export const useUpdateSupplierStatus = useUpdateSupplierStatusMutation;
