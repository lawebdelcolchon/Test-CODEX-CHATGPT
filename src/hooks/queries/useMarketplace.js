// src/hooks/queries/useMarketplace.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import marketplaceApi from '../../services/api/MarketplaceAPI.js';

// Query Keys
export const marketplaceQueryKeys = {
  all: ['marketplaces'],
  lists: () => [...marketplaceQueryKeys.all, 'list'],
  list: (params) => [...marketplaceQueryKeys.lists(), params],
  details: () => [...marketplaceQueryKeys.all, 'detail'],
  detail: (id) => [...marketplaceQueryKeys.details(), id],
  active: (params) => [...marketplaceQueryKeys.all, 'active', params],
  visible: (params) => [...marketplaceQueryKeys.all, 'visible', params],
};

// Queries
export const useMarketplacesQuery = (params = {}) => {
  return useQuery({
    queryKey: marketplaceQueryKeys.list(params),
    queryFn: () => marketplaceApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useMarketplaceQuery = (id) => {
  return useQuery({
    queryKey: marketplaceQueryKeys.detail(id),
    queryFn: () => marketplaceApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useActiveMarketplacesQuery = (params = {}) => {
  return useQuery({
    queryKey: marketplaceQueryKeys.active(params),
    queryFn: () => marketplaceApi.getActive(params),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useVisibleMarketplacesQuery = (params = {}) => {
  return useQuery({
    queryKey: marketplaceQueryKeys.visible(params),
    queryFn: () => marketplaceApi.getVisible(params),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

// Mutations
export const useCreateMarketplaceMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => {
      console.log('🚀 useCreateMarketplaceMutation.mutationFn called with:', data);
      
      return marketplaceApi.create(data);
    },
    onMutate: async (newMarketplace) => {
      console.log('🔄 useCreateMarketplaceMutation.onMutate - optimistic update');
      // Optimistic update could be implemented here
    },
    onSuccess: (data) => {
      console.log('✅ useCreateMarketplaceMutation.onSuccess:', data);
      
      // Invalidate and refetch marketplaces lists
      queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.active() });
      queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.visible() });
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      console.error('❌ useCreateMarketplaceMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export const useUpdateMarketplaceMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => {
      console.log('🚀 useUpdateMarketplaceMutation.mutationFn called with:', { id, data });
      
      return marketplaceApi.update(id, data);
    },
    onMutate: async ({ id, data }) => {
      console.log('🔄 useUpdateMarketplaceMutation.onMutate - optimistic update for id:', id);
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: marketplaceQueryKeys.detail(id) });
      
      // Snapshot previous value
      const previousMarketplace = queryClient.getQueryData(marketplaceQueryKeys.detail(id));
      
      // Optimistically update to new value
      if (previousMarketplace) {
        queryClient.setQueryData(marketplaceQueryKeys.detail(id), {
          ...previousMarketplace,
          ...data,
          updated_at: new Date().toISOString()
        });
      }
      
      return { previousMarketplace };
    },
    onSuccess: (updatedMarketplace, { id }) => {
      console.log('✅ useUpdateMarketplaceMutation.onSuccess:', updatedMarketplace);
      
      // Forzar la invalidación del cache del marketplace específico
      queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.detail(id) });
      
      // Update the detail cache with the server response
      queryClient.setQueryData(marketplaceQueryKeys.detail(id), updatedMarketplace);
      
      // Update the marketplace in any lists that might contain it
      queryClient.setQueriesData({ queryKey: marketplaceQueryKeys.lists() }, (oldData) => {
        if (!oldData?.items) return oldData;
        
        return {
          ...oldData,
          items: oldData.items.map(item => 
            item.id === updatedMarketplace.id ? updatedMarketplace : item
          )
        };
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.active() });
      queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.visible() });
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(updatedMarketplace);
      }
    },
    onError: (error, { id }, context) => {
      console.error('❌ useUpdateMarketplaceMutation.onError:', error);
      
      // Rollback optimistic update
      if (context?.previousMarketplace) {
        queryClient.setQueryData(marketplaceQueryKeys.detail(id), context.previousMarketplace);
      }
      
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export const useDeleteMarketplaceMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => {
      console.log('🚀 useDeleteMarketplaceMutation.mutationFn called with id:', id);
      return marketplaceApi.delete(id);
    },
    onSuccess: (result, deletedId) => {
      console.log('✅ useDeleteMarketplaceMutation.onSuccess for id:', deletedId);
      
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: marketplaceQueryKeys.detail(deletedId) });
      
      // Update lists by filtering out the deleted item
      queryClient.setQueriesData({ queryKey: marketplaceQueryKeys.lists() }, (oldData) => {
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
      queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.all });
      
      console.log('🔄 useDeleteMarketplaceMutation - Cache updated and queries invalidated');
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(result, deletedId);
      }
    },
    onError: (error) => {
      console.error('❌ useDeleteMarketplaceMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

// Status mutations
export const useUpdateMarketplaceStatusMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, active }) => {
      console.log('🚀 useUpdateMarketplaceStatusMutation.mutationFn called with:', { id, active });
      return marketplaceApi.setActive(id, active);
    },
    onSuccess: (updatedMarketplace) => {
      console.log('✅ useUpdateMarketplaceStatusMutation.onSuccess:', updatedMarketplace);
      
      // Update caches
      queryClient.setQueryData(marketplaceQueryKeys.detail(updatedMarketplace.id), updatedMarketplace);
      
      queryClient.setQueriesData({ queryKey: marketplaceQueryKeys.lists() }, (oldData) => {
        if (!oldData?.items) return oldData;
        
        return {
          ...oldData,
          items: oldData.items.map(item => 
            item.id === updatedMarketplace.id ? updatedMarketplace : item
          )
        };
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.active() });
      
      if (options.onSuccess) {
        options.onSuccess(updatedMarketplace);
      }
    },
    onError: (error) => {
      console.error('❌ useUpdateMarketplaceStatusMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export const useUpdateMarketplaceVisibilityMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, visible }) => {
      console.log('🚀 useUpdateMarketplaceVisibilityMutation.mutationFn called with:', { id, visible });
      return marketplaceApi.setVisible(id, visible);
    },
    onSuccess: (updatedMarketplace) => {
      console.log('✅ useUpdateMarketplaceVisibilityMutation.onSuccess:', updatedMarketplace);
      
      // Update caches
      queryClient.setQueryData(marketplaceQueryKeys.detail(updatedMarketplace.id), updatedMarketplace);
      
      queryClient.setQueriesData({ queryKey: marketplaceQueryKeys.lists() }, (oldData) => {
        if (!oldData?.items) return oldData;
        
        return {
          ...oldData,
          items: oldData.items.map(item => 
            item.id === updatedMarketplace.id ? updatedMarketplace : item
          )
        };
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.visible() });
      
      if (options.onSuccess) {
        options.onSuccess(updatedMarketplace);
      }
    },
    onError: (error) => {
      console.error('❌ useUpdateMarketplaceVisibilityMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};