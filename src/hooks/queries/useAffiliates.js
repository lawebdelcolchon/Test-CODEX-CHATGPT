// src/hooks/queries/useAffiliates.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import affiliatesApi from '../../services/api/AffiliatesAPI.js';

// Query Keys
export const affiliatesQueryKeys = {
  all: ['affiliates'],
  lists: () => [...affiliatesQueryKeys.all, 'list'],
  list: (params) => [...affiliatesQueryKeys.lists(), params],
  details: () => [...affiliatesQueryKeys.all, 'detail'],
  detail: (id) => [...affiliatesQueryKeys.details(), id],
  active: (params) => [...affiliatesQueryKeys.all, 'active', params],
  contacts: (affiliateId) => [...affiliatesQueryKeys.all, 'contacts', affiliateId],
  zones: (affiliateId) => [...affiliatesQueryKeys.all, 'zones', affiliateId],
};

// ==================== AFFILIATES QUERIES ====================

export const useAffiliatesQuery = (params = {}) => {
  console.log('🔍 useAffiliatesQuery called with params:', params);
  return useQuery({
    queryKey: affiliatesQueryKeys.list(params),
    queryFn: async () => {
      console.log('📡 useAffiliatesQuery: Fetching affiliates from API...');
      try {
        const result = await affiliatesApi.getAll(params);
        console.log('✅ useAffiliatesQuery: API response:', result);
        return result;
      } catch (error) {
        console.error('❌ useAffiliatesQuery: API error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (anteriormente cacheTime)
    placeholderData: (previousData) => previousData, // Reemplaza keepPreviousData
    refetchOnWindowFocus: false,
  });
};

export const useAffiliateQuery = (id) => {
  return useQuery({
    queryKey: affiliatesQueryKeys.detail(id),
    queryFn: () => affiliatesApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useActiveAffiliatesQuery = (params = {}) => {
  return useQuery({
    queryKey: affiliatesQueryKeys.active(params),
    queryFn: () => affiliatesApi.getActive(params),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

// ==================== AFFILIATES MUTATIONS ====================

export const useCreateAffiliateMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => {
      console.log('🚀 useCreateAffiliateMutation.mutationFn called with:', data);
      return affiliatesApi.create(data);
    },
    onSuccess: (data) => {
      console.log('✅ useCreateAffiliateMutation.onSuccess:', data);
      
      // Invalidate and refetch affiliates lists
      queryClient.invalidateQueries({ queryKey: affiliatesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: affiliatesQueryKeys.active() });
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      console.error('❌ useCreateAffiliateMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export const useUpdateAffiliateMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => {
      console.log('🚀 useUpdateAffiliateMutation.mutationFn called with:', { id, data });
      return affiliatesApi.update(id, data);
    },
    onMutate: async ({ id, data }) => {
      console.log('🔄 useUpdateAffiliateMutation.onMutate - optimistic update for id:', id);
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: affiliatesQueryKeys.detail(id) });
      
      // Snapshot previous value
      const previousAffiliate = queryClient.getQueryData(affiliatesQueryKeys.detail(id));
      
      // Optimistically update to new value
      if (previousAffiliate) {
        queryClient.setQueryData(affiliatesQueryKeys.detail(id), {
          ...previousAffiliate,
          ...data,
          updated_at: new Date().toISOString()
        });
      }
      
      return { previousAffiliate };
    },
    onSuccess: (updatedAffiliate, { id }) => {
      console.log('✅ useUpdateAffiliateMutation.onSuccess:', updatedAffiliate);
      
      // Force invalidation of the specific affiliate cache
      queryClient.invalidateQueries({ queryKey: affiliatesQueryKeys.detail(id) });
      
      // Update the detail cache with the server response
      queryClient.setQueryData(affiliatesQueryKeys.detail(id), updatedAffiliate);
      
      // Update the affiliate in any lists that might contain it
      queryClient.setQueriesData({ queryKey: affiliatesQueryKeys.lists() }, (oldData) => {
        if (!oldData?.items) return oldData;
        
        return {
          ...oldData,
          items: oldData.items.map(item => 
            item.id === updatedAffiliate.id ? updatedAffiliate : item
          )
        };
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: affiliatesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: affiliatesQueryKeys.active() });
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(updatedAffiliate);
      }
    },
    onError: (error, { id }, context) => {
      console.error('❌ useUpdateAffiliateMutation.onError:', error);
      
      // Rollback optimistic update
      if (context?.previousAffiliate) {
        queryClient.setQueryData(affiliatesQueryKeys.detail(id), context.previousAffiliate);
      }
      
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export const useDeleteAffiliateMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => {
      console.log('🚀 useDeleteAffiliateMutation.mutationFn called with id:', id);
      return affiliatesApi.delete(id);
    },
    onSuccess: (data, deletedId) => {
      console.log('✅ useDeleteAffiliateMutation.onSuccess:', data);
      
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: affiliatesQueryKeys.detail(deletedId) });
      
      // Update lists to remove deleted affiliate
      queryClient.setQueriesData({ queryKey: affiliatesQueryKeys.lists() }, (oldData) => {
        if (!oldData?.items) return oldData;
        
        return {
          ...oldData,
          items: oldData.items.filter(item => item.id !== deletedId)
        };
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: affiliatesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: affiliatesQueryKeys.active() });
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      console.error('❌ useDeleteAffiliateMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

// ==================== CONTACTS QUERIES ====================

export const useAffiliateContactsQuery = (affiliateId) => {
  return useQuery({
    queryKey: affiliatesQueryKeys.contacts(affiliateId),
    queryFn: () => affiliatesApi.getContacts(affiliateId),
    enabled: !!affiliateId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// ==================== CONTACTS MUTATIONS ====================

export const useCreateContactMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ affiliateId, data }) => {
      console.log('🚀 useCreateContactMutation called with:', { affiliateId, data });
      return affiliatesApi.createContact(affiliateId, data);
    },
    onSuccess: (data, { affiliateId }) => {
      console.log('✅ useCreateContactMutation.onSuccess:', data);
      
      // Invalidate contacts list for this affiliate
      queryClient.invalidateQueries({ queryKey: affiliatesQueryKeys.contacts(affiliateId) });
      
      // Also invalidate affiliate detail to show updated contacts
      queryClient.invalidateQueries({ queryKey: affiliatesQueryKeys.detail(affiliateId) });
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      console.error('❌ useCreateContactMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export const useUpdateContactMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ affiliateId, contactId, data }) => {
      console.log('🚀 useUpdateContactMutation called with:', { affiliateId, contactId, data });
      return affiliatesApi.updateContact(affiliateId, contactId, data);
    },
    onSuccess: (data, { affiliateId }) => {
      console.log('✅ useUpdateContactMutation.onSuccess:', data);
      
      // Invalidate contacts list for this affiliate
      queryClient.invalidateQueries({ queryKey: affiliatesQueryKeys.contacts(affiliateId) });
      
      // Also invalidate affiliate detail
      queryClient.invalidateQueries({ queryKey: affiliatesQueryKeys.detail(affiliateId) });
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      console.error('❌ useUpdateContactMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export const useDeleteContactMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ affiliateId, contactId }) => {
      console.log('🚀 useDeleteContactMutation called with:', { affiliateId, contactId });
      return affiliatesApi.deleteContact(affiliateId, contactId);
    },
    onSuccess: (data, { affiliateId }) => {
      console.log('✅ useDeleteContactMutation.onSuccess:', data);
      
      // Invalidate contacts list for this affiliate
      queryClient.invalidateQueries({ queryKey: affiliatesQueryKeys.contacts(affiliateId) });
      
      // Also invalidate affiliate detail
      queryClient.invalidateQueries({ queryKey: affiliatesQueryKeys.detail(affiliateId) });
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      console.error('❌ useDeleteContactMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

// ==================== ZONES QUERIES ====================

export const useAffiliateZonesQuery = (affiliateId) => {
  return useQuery({
    queryKey: affiliatesQueryKeys.zones(affiliateId),
    queryFn: () => affiliatesApi.getZones(affiliateId),
    enabled: !!affiliateId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// ==================== ZONES MUTATIONS ====================

export const useCreateZoneMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ affiliateId, data }) => {
      console.log('🚀 useCreateZoneMutation called with:', { affiliateId, data });
      return affiliatesApi.createZone(affiliateId, data);
    },
    onSuccess: (data, { affiliateId }) => {
      console.log('✅ useCreateZoneMutation.onSuccess:', data);
      
      // Invalidate zones list for this affiliate
      queryClient.invalidateQueries({ queryKey: affiliatesQueryKeys.zones(affiliateId) });
      
      // Also invalidate affiliate detail to show updated zones
      queryClient.invalidateQueries({ queryKey: affiliatesQueryKeys.detail(affiliateId) });
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      console.error('❌ useCreateZoneMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export const useUpdateZoneMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ affiliateId, zoneId, data }) => {
      console.log('🚀 useUpdateZoneMutation called with:', { affiliateId, zoneId, data });
      return affiliatesApi.updateZone(affiliateId, zoneId, data);
    },
    onSuccess: (data, { affiliateId }) => {
      console.log('✅ useUpdateZoneMutation.onSuccess:', data);
      
      // Invalidate zones list for this affiliate
      queryClient.invalidateQueries({ queryKey: affiliatesQueryKeys.zones(affiliateId) });
      
      // Also invalidate affiliate detail
      queryClient.invalidateQueries({ queryKey: affiliatesQueryKeys.detail(affiliateId) });
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      console.error('❌ useUpdateZoneMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

export const useDeleteZoneMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ affiliateId, zoneId }) => {
      console.log('🚀 useDeleteZoneMutation called with:', { affiliateId, zoneId });
      return affiliatesApi.deleteZone(affiliateId, zoneId);
    },
    onSuccess: (data, { affiliateId }) => {
      console.log('✅ useDeleteZoneMutation.onSuccess:', data);
      
      // Invalidate zones list for this affiliate
      queryClient.invalidateQueries({ queryKey: affiliatesQueryKeys.zones(affiliateId) });
      
      // Also invalidate affiliate detail
      queryClient.invalidateQueries({ queryKey: affiliatesQueryKeys.detail(affiliateId) });
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      console.error('❌ useDeleteZoneMutation.onError:', error);
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};
