// src/hooks/queries/useClients.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clientsApi from '../../services/api/ClientsAPI.js';

// Query Keys
export const clientsQueryKeys = {
  all: ['clients'],
  lists: () => [...clientsQueryKeys.all, 'list'],
  list: (params) => [...clientsQueryKeys.lists(), params],
  details: () => [...clientsQueryKeys.all, 'detail'],
  detail: (id) => [...clientsQueryKeys.details(), id],
  active: (params) => [...clientsQueryKeys.all, 'active', params],
};

// Queries
export const useClientsQuery = (params = {}) => {
  return useQuery({
    queryKey: clientsQueryKeys.list(params),
    queryFn: () => clientsApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useClientQuery = (id) => {
  return useQuery({
    queryKey: clientsQueryKeys.detail(id),
    queryFn: () => clientsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useActiveClientsQuery = (params = {}) => {
  return useQuery({
    queryKey: clientsQueryKeys.active(params),
    queryFn: () => clientsApi.getActive(params),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

// Mutations
export const useCreateClientMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => {
      console.log('🚀 useCreateClientMutation.mutationFn called with:', data);
      
      // Las validaciones se hacen dentro de clientsApi.create()
      return clientsApi.create(data);
    },
    onMutate: async (newClient) => {
      console.log('🔄 useCreateClientMutation.onMutate - optimistic update');
      // Optimistic update could be implemented here
    },
    onSuccess: (data) => {
      console.log('✅ useCreateClientMutation.onSuccess:', data);
      
      // Invalidate and refetch clients lists
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.active() });
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      console.error('❌ useCreateClientMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export const useUpdateClientMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => {
      console.log('🚀 useUpdateClientMutation.mutationFn called with:', { id, data });
      
      // Las validaciones se hacen dentro de clientsApi.update()
      return clientsApi.update(id, data);
    },
    onMutate: async ({ id, data }) => {
      console.log('🔄 useUpdateClientMutation.onMutate - optimistic update for id:', id);
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: clientsQueryKeys.detail(id) });
      
      // Snapshot previous value
      const previousClient = queryClient.getQueryData(clientsQueryKeys.detail(id));
      
      // Optimistically update to new value
      if (previousClient) {
        queryClient.setQueryData(clientsQueryKeys.detail(id), {
          ...previousClient,
          ...data,
          updated_at: new Date().toISOString()
        });
      }
      
      return { previousClient };
    },
    onSuccess: (updatedClient, { id }) => {
      console.log('✅ useUpdateClientMutation.onSuccess:', updatedClient);
      
      // Forzar la invalidación del cache del cliente específico
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.detail(id) });
      
      // Update the detail cache with the server response
      queryClient.setQueryData(clientsQueryKeys.detail(id), updatedClient);
      
      // Update the client in any lists that might contain it
      queryClient.setQueriesData({ queryKey: clientsQueryKeys.lists() }, (oldData) => {
        if (!oldData?.items) return oldData;
        
        return {
          ...oldData,
          items: oldData.items.map(item => 
            item.id === updatedClient.id ? updatedClient : item
          )
        };
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.active() });
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(updatedClient);
      }
    },
    onError: (error, { id }, context) => {
      console.error('❌ useUpdateClientMutation.onError:', error);
      
      // Rollback optimistic update
      if (context?.previousClient) {
        queryClient.setQueryData(clientsQueryKeys.detail(id), context.previousClient);
      }
      
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export const useDeleteClientMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => {
      console.log('🚀 useDeleteClientMutation.mutationFn called with id:', id);
      return clientsApi.delete(id);
    },
    onMutate: async (id) => {
      console.log('🔄 useDeleteClientMutation.onMutate - optimistic update for id:', id);
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: clientsQueryKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: clientsQueryKeys.lists() });
      
      // Snapshot previous value
      const previousClient = queryClient.getQueryData(clientsQueryKeys.detail(id));
      
      // Optimistically update lists by removing the client
      queryClient.setQueriesData({ queryKey: clientsQueryKeys.lists() }, (oldData) => {
        if (!oldData?.items) return oldData;
        
        return {
          ...oldData,
          items: oldData.items.filter(item => item.id !== parseInt(id)),
          pagination: {
            ...oldData.pagination,
            total: Math.max(0, (oldData.pagination?.total || 0) - 1)
          }
        };
      });
      
      return { previousClient };
    },
    onSuccess: (result, id) => {
      console.log('✅ useDeleteClientMutation.onSuccess:', result);
      
      // Remove the client from detail cache
      queryClient.removeQueries({ queryKey: clientsQueryKeys.detail(id) });
      
      // Invalidate and refetch lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientsQueryKeys.active() });
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(result, id);
      }
    },
    onError: (error, id, context) => {
      console.error('❌ useDeleteClientMutation.onError:', error);
      
      // Rollback optimistic updates
      if (context?.previousClient) {
        queryClient.setQueryData(clientsQueryKeys.detail(id), context.previousClient);
        
        // Rollback list updates
        queryClient.setQueriesData({ queryKey: clientsQueryKeys.lists() }, (oldData) => {
          if (!oldData?.items) return oldData;
          
          const clientExists = oldData.items.some(item => item.id === parseInt(id));
          if (!clientExists) {
            return {
              ...oldData,
              items: [...oldData.items, context.previousClient],
              pagination: {
                ...oldData.pagination,
                total: (oldData.pagination?.total || 0) + 1
              }
            };
          }
          return oldData;
        });
      }
      
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

// Hook de utilidad para activar/desactivar cliente
export const useToggleClientActiveMutation = (options = {}) => {
  return useUpdateClientMutation({
    ...options,
    onSuccess: (updatedClient) => {
      console.log('✅ useToggleClientActiveMutation.onSuccess:', updatedClient);
      if (options.onSuccess) {
        options.onSuccess(updatedClient);
      }
    }
  });
};