// src/hooks/queries/useAffiliates.js
import { useQuery } from '@tanstack/react-query';
import affiliatesApi from '../../services/api/AffiliatesAPI.js';

// Query Keys
export const affiliatesQueryKeys = {
  all: ['affiliates'],
  lists: () => [...affiliatesQueryKeys.all, 'list'],
  list: (params) => [...affiliatesQueryKeys.lists(), params],
  details: () => [...affiliatesQueryKeys.all, 'detail'],
  detail: (id) => [...affiliatesQueryKeys.details(), id],
  active: (params) => [...affiliatesQueryKeys.all, 'active', params],
};

// Queries
export const useAffiliatesQuery = (params = {}) => {
  return useQuery({
    queryKey: affiliatesQueryKeys.list(params),
    queryFn: () => affiliatesApi.getAll(params),
    staleTime: 10 * 60 * 1000, // 10 minutes para selectores
    cacheTime: 15 * 60 * 1000, // 15 minutes
    keepPreviousData: true,
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
    staleTime: 10 * 60 * 1000, // 10 minutes para selectores
    cacheTime: 15 * 60 * 1000,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};