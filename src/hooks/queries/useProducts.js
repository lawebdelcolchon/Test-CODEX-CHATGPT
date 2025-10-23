// src/hooks/queries/useProducts.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productsApi from '../../services/api/ProductsAPI.js';

// Query Keys
export const productsQueryKeys = {
  all: ['products'],
  lists: () => [...productsQueryKeys.all, 'list'],
  list: (params) => [...productsQueryKeys.lists(), params],
  details: () => [...productsQueryKeys.all, 'detail'],
  detail: (id) => [...productsQueryKeys.details(), id],
  active: (params) => [...productsQueryKeys.all, 'active', params],
  featured: (params) => [...productsQueryKeys.all, 'featured', params],
  byCategory: (categoryId, params) => [...productsQueryKeys.all, 'category', categoryId, params],
};

// Queries
export const useProductsQuery = (params = {}) => {
  return useQuery({
    queryKey: productsQueryKeys.list(params),
    queryFn: () => productsApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useProductQuery = (id) => {
  return useQuery({
    queryKey: productsQueryKeys.detail(id),
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useActiveProductsQuery = (params = {}) => {
  return useQuery({
    queryKey: productsQueryKeys.active(params),
    queryFn: () => productsApi.getActive(params),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useFeaturedProductsQuery = (params = {}) => {
  return useQuery({
    queryKey: productsQueryKeys.featured(params),
    queryFn: () => productsApi.getFeatured(params),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useProductsByCategoryQuery = (categoryId, params = {}) => {
  return useQuery({
    queryKey: productsQueryKeys.byCategory(categoryId, params),
    queryFn: () => productsApi.getByCategory(categoryId, params),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

// Mutations
export const useCreateProductMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => {
      console.log('🚀 useCreateProductMutation.mutationFn called with:', data);
      
      // Las validaciones se hacen dentro de productsApi.create()
      return productsApi.create(data);
    },
    onMutate: async (newProduct) => {
      console.log('🔄 useCreateProductMutation.onMutate - optimistic update');
      // Optimistic update could be implemented here
    },
    onSuccess: (data) => {
      console.log('✅ useCreateProductMutation.onSuccess:', data);
      
      // Invalidate and refetch products lists
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.active() });
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.featured() });
      
      if (data.id_category) {
        queryClient.invalidateQueries({ 
          queryKey: productsQueryKeys.byCategory(data.id_category) 
        });
      }
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      console.error('❌ useCreateProductMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export const useUpdateProductMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => {
      console.log('🚀 useUpdateProductMutation.mutationFn called with:', { id, data });
      
      // Las validaciones se hacen dentro de productsApi.update()
      return productsApi.update(id, data);
    },
    onMutate: async ({ id, data }) => {
      console.log('🔄 useUpdateProductMutation.onMutate - optimistic update for id:', id);
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: productsQueryKeys.detail(id) });
      
      // Snapshot previous value
      const previousProduct = queryClient.getQueryData(productsQueryKeys.detail(id));
      
      // Optimistically update to new value
      if (previousProduct) {
        queryClient.setQueryData(productsQueryKeys.detail(id), {
          ...previousProduct,
          ...data,
          updated_at: new Date().toISOString()
        });
      }
      
      return { previousProduct };
    },
    onSuccess: (updatedProduct, { id }) => {
      console.log('✅ useUpdateProductMutation.onSuccess:', updatedProduct);
      
      // Forzar la invalidación del cache del producto específico
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.detail(id) });
      
      // Update the detail cache with the server response
      queryClient.setQueryData(productsQueryKeys.detail(id), updatedProduct);
      
      // Update the product in any lists that might contain it
      queryClient.setQueriesData({ queryKey: productsQueryKeys.lists() }, (oldData) => {
        if (!oldData?.items) return oldData;
        
        return {
          ...oldData,
          items: oldData.items.map(item => 
            item.id === updatedProduct.id ? updatedProduct : item
          )
        };
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.active() });
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.featured() });
      
      if (updatedProduct.id_category) {
        queryClient.invalidateQueries({ 
          queryKey: productsQueryKeys.byCategory(updatedProduct.id_category) 
        });
      }
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(updatedProduct);
      }
    },
    onError: (error, { id }, context) => {
      console.error('❌ useUpdateProductMutation.onError:', error);
      
      // Rollback optimistic update
      if (context?.previousProduct) {
        queryClient.setQueryData(productsQueryKeys.detail(id), context.previousProduct);
      }
      
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export const useDeleteProductMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => {
      console.log('🚀 useDeleteProductMutation.mutationFn called with id:', id);
      return productsApi.delete(id);
    },
    onSuccess: (result, deletedId) => {
      console.log('✅ useDeleteProductMutation.onSuccess for id:', deletedId);
      
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: productsQueryKeys.detail(deletedId) });
      
      // Update lists by filtering out the deleted item
      queryClient.setQueriesData({ queryKey: productsQueryKeys.lists() }, (oldData) => {
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
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.all });
      
      console.log('🔄 useDeleteProductMutation - Cache updated and queries invalidated');
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(result, deletedId);
      }
    },
    onError: (error) => {
      console.error('❌ useDeleteProductMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

// Status mutations
export const useUpdateProductStatusMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }) => {
      console.log('🚀 useUpdateProductStatusMutation.mutationFn called with:', { id, status });
      return productsApi.updateStatus(id, status);
    },
    onSuccess: (updatedProduct) => {
      console.log('✅ useUpdateProductStatusMutation.onSuccess:', updatedProduct);
      
      // Update caches
      queryClient.setQueryData(productsQueryKeys.detail(updatedProduct.id), updatedProduct);
      
      queryClient.setQueriesData({ queryKey: productsQueryKeys.lists() }, (oldData) => {
        if (!oldData?.items) return oldData;
        
        return {
          ...oldData,
          items: oldData.items.map(item => 
            item.id === updatedProduct.id ? updatedProduct : item
          )
        };
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.active() });
      
      if (options.onSuccess) {
        options.onSuccess(updatedProduct);
      }
    },
    onError: (error) => {
      console.error('❌ useUpdateProductStatusMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export const useToggleProductFeaturedMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => {
      console.log('🚀 useToggleProductFeaturedMutation.mutationFn called with id:', id);
      return productsApi.toggleFeatured(id);
    },
    onSuccess: (updatedProduct) => {
      console.log('✅ useToggleProductFeaturedMutation.onSuccess:', updatedProduct);
      
      // Update caches
      queryClient.setQueryData(productsQueryKeys.detail(updatedProduct.id), updatedProduct);
      
      queryClient.setQueriesData({ queryKey: productsQueryKeys.lists() }, (oldData) => {
        if (!oldData?.items) return oldData;
        
        return {
          ...oldData,
          items: oldData.items.map(item => 
            item.id === updatedProduct.id ? updatedProduct : item
          )
        };
      });
      
      // Invalidate featured queries
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.featured() });
      
      if (options.onSuccess) {
        options.onSuccess(updatedProduct);
      }
    },
    onError: (error) => {
      console.error('❌ useToggleProductFeaturedMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};