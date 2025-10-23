// src/hooks/queries/useAdminAccounts.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminAccountsApi from '../../services/api/AdminAccountsAPI.js';

// Query Keys
export const adminAccountsQueryKeys = {
  all: ['admin_accounts'],
  lists: () => [...adminAccountsQueryKeys.all, 'list'],
  list: (params) => [...adminAccountsQueryKeys.lists(), params],
  details: () => [...adminAccountsQueryKeys.all, 'detail'],
  detail: (id) => [...adminAccountsQueryKeys.details(), id],
  active: (params) => [...adminAccountsQueryKeys.all, 'active', params],
  byStore: (storeId, params) => [...adminAccountsQueryKeys.all, 'store', storeId, params],
  superAdmins: (params) => [...adminAccountsQueryKeys.all, 'super_admins', params],
};

// Queries
export const useAdminAccountsQuery = (params = {}) => {
  return useQuery({
    queryKey: adminAccountsQueryKeys.list(params),
    queryFn: () => adminAccountsApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useAdminAccountQuery = (id) => {
  return useQuery({
    queryKey: adminAccountsQueryKeys.detail(id),
    queryFn: () => adminAccountsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useActiveAdminAccountsQuery = (params = {}) => {
  return useQuery({
    queryKey: adminAccountsQueryKeys.active(params),
    queryFn: () => adminAccountsApi.getActive(params),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useAdminAccountsByStoreQuery = (storeId, params = {}) => {
  return useQuery({
    queryKey: adminAccountsQueryKeys.byStore(storeId, params),
    queryFn: () => adminAccountsApi.getByStore(storeId, params),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useSuperAdminAccountsQuery = (params = {}) => {
  return useQuery({
    queryKey: adminAccountsQueryKeys.superAdmins(params),
    queryFn: () => adminAccountsApi.getSuperAdmins(params),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

// Mutations
export const useCreateAdminAccountMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => {
      console.log('🚀 useCreateAdminAccountMutation.mutationFn called with:', data);
      
      // Las validaciones se hacen dentro de adminAccountsApi.create()
      return adminAccountsApi.create(data);
    },
    onMutate: async (newAccount) => {
      console.log('🔄 useCreateAdminAccountMutation.onMutate - optimistic update');
      // Optimistic update could be implemented here
    },
    onSuccess: (data) => {
      console.log('✅ useCreateAdminAccountMutation.onSuccess:', data);
      
      // Invalidate and refetch admin accounts lists
      queryClient.invalidateQueries({ queryKey: adminAccountsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminAccountsQueryKeys.active() });
      
      if (data.id_store) {
        queryClient.invalidateQueries({ 
          queryKey: adminAccountsQueryKeys.byStore(data.id_store) 
        });
      }
      
      if (data.super_admin) {
        queryClient.invalidateQueries({ 
          queryKey: adminAccountsQueryKeys.superAdmins() 
        });
      }
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      console.error('❌ useCreateAdminAccountMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export const useUpdateAdminAccountMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => {
      console.log('🚀 useUpdateAdminAccountMutation.mutationFn called with:', { id, data });
      
      // Las validaciones se hacen dentro de adminAccountsApi.update()
      return adminAccountsApi.update(id, data);
    },
    onMutate: async ({ id, data }) => {
      console.log('🔄 useUpdateAdminAccountMutation.onMutate - optimistic update for id:', id);
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminAccountsQueryKeys.detail(id) });
      
      // Snapshot previous value
      const previousAccount = queryClient.getQueryData(adminAccountsQueryKeys.detail(id));
      
      // Optimistically update to new value
      if (previousAccount) {
        queryClient.setQueryData(adminAccountsQueryKeys.detail(id), {
          ...previousAccount,
          ...data,
          updated_at: new Date().toISOString()
        });
      }
      
      return { previousAccount };
    },
    onSuccess: (updatedAccount, { id }) => {
      console.log('✅ useUpdateAdminAccountMutation.onSuccess:', updatedAccount);
      
      // Forzar la invalidación del cache de la cuenta específica
      queryClient.invalidateQueries({ queryKey: adminAccountsQueryKeys.detail(id) });
      
      // Update the detail cache with the server response
      queryClient.setQueryData(adminAccountsQueryKeys.detail(id), updatedAccount);
      
      // Update the account in any lists that might contain it
      queryClient.setQueriesData({ queryKey: adminAccountsQueryKeys.lists() }, (oldData) => {
        if (!oldData?.items) return oldData;
        
        return {
          ...oldData,
          items: oldData.items.map(item => 
            item.id === updatedAccount.id ? updatedAccount : item
          )
        };
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: adminAccountsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminAccountsQueryKeys.active() });
      
      if (updatedAccount.id_store) {
        queryClient.invalidateQueries({ 
          queryKey: adminAccountsQueryKeys.byStore(updatedAccount.id_store) 
        });
      }
      
      if (updatedAccount.super_admin) {
        queryClient.invalidateQueries({ 
          queryKey: adminAccountsQueryKeys.superAdmins() 
        });
      }
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(updatedAccount);
      }
    },
    onError: (error, { id }, context) => {
      console.error('❌ useUpdateAdminAccountMutation.onError:', error);
      
      // Rollback optimistic update
      if (context?.previousAccount) {
        queryClient.setQueryData(adminAccountsQueryKeys.detail(id), context.previousAccount);
      }
      
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export const useDeleteAdminAccountMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => {
      console.log('🚀 useDeleteAdminAccountMutation.mutationFn called with id:', id);
      return adminAccountsApi.delete(id);
    },
    onMutate: async (deletedId) => {
      console.log('🔄 useDeleteAdminAccountMutation.onMutate - optimistic update for id:', deletedId);
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminAccountsQueryKeys.lists() });
      await queryClient.cancelQueries({ queryKey: adminAccountsQueryKeys.detail(deletedId) });
      
      // Snapshot previous values
      const previousLists = queryClient.getQueriesData({ queryKey: adminAccountsQueryKeys.lists() });
      const previousAccount = queryClient.getQueryData(adminAccountsQueryKeys.detail(deletedId));
      
      // Optimistically remove from all lists
      queryClient.setQueriesData({ queryKey: adminAccountsQueryKeys.lists() }, (oldData) => {
        if (!oldData?.items) return oldData;
        
        return {
          ...oldData,
          items: oldData.items.filter(item => item.id !== parseInt(deletedId)),
          pagination: {
            ...oldData.pagination,
            total: Math.max(0, oldData.pagination.total - 1)
          }
        };
      });
      
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: adminAccountsQueryKeys.detail(deletedId) });
      
      return { previousLists, previousAccount };
    },
    onSuccess: (result, deletedId) => {
      console.log('✅ useDeleteAdminAccountMutation.onSuccess for id:', deletedId);
      
      // Invalidate all related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: adminAccountsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminAccountsQueryKeys.active() });
      
      // Remove from all store and super admin queries
      queryClient.invalidateQueries({ queryKey: [...adminAccountsQueryKeys.all, 'store'] });
      queryClient.invalidateQueries({ queryKey: [...adminAccountsQueryKeys.all, 'super_admins'] });
      
      if (options.onSuccess) {
        options.onSuccess(result, deletedId);
      }
    },
    onError: (error, deletedId, context) => {
      console.error('❌ useDeleteAdminAccountMutation.onError:', error);
      
      // Rollback optimistic updates
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      if (context?.previousAccount) {
        queryClient.setQueryData(adminAccountsQueryKeys.detail(deletedId), context.previousAccount);
      }
      
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

// Mutation específica para cambiar contraseña
export const useChangePasswordMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, newPassword }) => {
      console.log('🚀 useChangePasswordMutation.mutationFn called with id:', id);
      return adminAccountsApi.changePassword(id, newPassword);
    },
    onSuccess: (result, { id }) => {
      console.log('✅ useChangePasswordMutation.onSuccess for id:', id);
      
      // No necesitamos invalidar queries ya que cambiar contraseña no afecta los datos mostrados
      if (options.onSuccess) {
        options.onSuccess(result);
      }
    },
    onError: (error) => {
      console.error('❌ useChangePasswordMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};