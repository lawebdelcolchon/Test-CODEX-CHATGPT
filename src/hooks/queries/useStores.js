// src/hooks/queries/useStores.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import storesApi from '../../services/api/StoresAPI.js';

// Query Keys
export const storesQueryKeys = {
  all: ['stores'],
  lists: () => [...storesQueryKeys.all, 'list'],
  list: (params) => [...storesQueryKeys.lists(), params],
  details: () => [...storesQueryKeys.all, 'detail'],
  detail: (id) => [...storesQueryKeys.details(), id],
  active: (params) => [...storesQueryKeys.all, 'active', params],
  byCity: (city, params) => [...storesQueryKeys.all, 'city', city, params],
  byState: (state, params) => [...storesQueryKeys.all, 'state', state, params],
};

// Queries
export const useStoresQuery = (params = {}) => {
  return useQuery({
    queryKey: storesQueryKeys.list(params),
    queryFn: () => storesApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useStoreQuery = (id) => {
  return useQuery({
    queryKey: storesQueryKeys.detail(id),
    queryFn: () => storesApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useActiveStoresQuery = (params = {}) => {
  return useQuery({
    queryKey: storesQueryKeys.active(params),
    queryFn: () => storesApi.getActive(params),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useStoresByCityQuery = (city, params = {}) => {
  return useQuery({
    queryKey: storesQueryKeys.byCity(city, params),
    queryFn: () => storesApi.getByCity(city, params),
    enabled: !!city,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useStoresByStateQuery = (state, params = {}) => {
  return useQuery({
    queryKey: storesQueryKeys.byState(state, params),
    queryFn: () => storesApi.getByState(state, params),
    enabled: !!state,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

// Mutations
export const useCreateStoreMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => {
      console.log('🚀 useCreateStoreMutation.mutationFn called with:', data);
      
      // Las validaciones se hacen dentro de storesApi.create()
      return storesApi.create(data);
    },
    onMutate: async (newStore) => {
      console.log('🔄 useCreateStoreMutation.onMutate - optimistic update');
      // Optimistic update could be implemented here
    },
    onSuccess: (data) => {
      console.log('✅ useCreateStoreMutation.onSuccess:', data);
      
      // Invalidate and refetch stores lists
      queryClient.invalidateQueries({ queryKey: storesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: storesQueryKeys.active() });
      
      if (data.city) {
        queryClient.invalidateQueries({ 
          queryKey: storesQueryKeys.byCity(data.city) 
        });
      }
      
      if (data.state) {
        queryClient.invalidateQueries({ 
          queryKey: storesQueryKeys.byState(data.state) 
        });
      }
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      console.error('❌ useCreateStoreMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export const useUpdateStoreMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => {
      console.log('🚀 useUpdateStoreMutation.mutationFn called with:', { id, data });
      
      // Las validaciones se hacen dentro de storesApi.update()
      return storesApi.update(id, data);
    },
    onMutate: async ({ id, data }) => {
      console.log('🔄 useUpdateStoreMutation.onMutate - optimistic update for id:', id);
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: storesQueryKeys.detail(id) });
      
      // Snapshot previous value
      const previousStore = queryClient.getQueryData(storesQueryKeys.detail(id));
      
      // Optimistically update to new value
      if (previousStore) {
        queryClient.setQueryData(storesQueryKeys.detail(id), {
          ...previousStore,
          ...data,
          updated_at: new Date().toISOString()
        });
      }
      
      return { previousStore };
    },
    onSuccess: (updatedStore, { id }) => {
      console.log('✅ useUpdateStoreMutation.onSuccess:', updatedStore);
      
      // Forzar la invalidación del cache de la tienda específica
      queryClient.invalidateQueries({ queryKey: storesQueryKeys.detail(id) });
      
      // Update the detail cache with the server response
      queryClient.setQueryData(storesQueryKeys.detail(id), updatedStore);
      
      // Update the store in any lists that might contain it
      queryClient.setQueriesData({ queryKey: storesQueryKeys.lists() }, (oldData) => {
        if (!oldData?.items) return oldData;
        
        return {
          ...oldData,
          items: oldData.items.map(item => 
            item.id === updatedStore.id ? updatedStore : item
          )
        };
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: storesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: storesQueryKeys.active() });
      
      if (updatedStore.city) {
        queryClient.invalidateQueries({ 
          queryKey: storesQueryKeys.byCity(updatedStore.city) 
        });
      }
      
      if (updatedStore.state) {
        queryClient.invalidateQueries({ 
          queryKey: storesQueryKeys.byState(updatedStore.state) 
        });
      }
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(updatedStore);
      }
    },
    onError: (error, { id }, context) => {
      console.error('❌ useUpdateStoreMutation.onError:', error);
      
      // Rollback optimistic update
      if (context?.previousStore) {
        queryClient.setQueryData(storesQueryKeys.detail(id), context.previousStore);
      }
      
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export const useDeleteStoreMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => {
      console.log('🚀 useDeleteStoreMutation.mutationFn called with id:', id);
      return storesApi.delete(id);
    },
    onSuccess: (result, deletedId) => {
      console.log('✅ useDeleteStoreMutation.onSuccess for id:', deletedId);
      
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: storesQueryKeys.detail(deletedId) });
      
      // Update lists by filtering out the deleted item
      queryClient.setQueriesData({ queryKey: storesQueryKeys.lists() }, (oldData) => {
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
      queryClient.invalidateQueries({ queryKey: storesQueryKeys.all });
      
      console.log('🔄 useDeleteStoreMutation - Cache updated and queries invalidated');
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(result, deletedId);
      }
    },
    onError: (error) => {
      console.error('❌ useDeleteStoreMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

// Utility mutations for specific actions
export const useToggleStoreStatusMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, active }) => {
      console.log('🚀 useToggleStoreStatusMutation.mutationFn called with:', { id, active });
      return storesApi.update(id, { active });
    },
    onSuccess: (updatedStore) => {
      console.log('✅ useToggleStoreStatusMutation.onSuccess:', updatedStore);
      
      // Update caches
      queryClient.setQueryData(storesQueryKeys.detail(updatedStore.id), updatedStore);
      queryClient.invalidateQueries({ queryKey: storesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: storesQueryKeys.active() });
      
      if (options.onSuccess) {
        options.onSuccess(updatedStore);
      }
    },
    onError: (error) => {
      console.error('❌ useToggleStoreStatusMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};