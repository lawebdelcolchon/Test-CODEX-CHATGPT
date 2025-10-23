import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../../services/api/CategoriesAPI.js';
import { useTrackedMutation } from '../useTrackedMutation.js';

/**
 * Query keys para categorías - centralizados para consistencia
 */
export const categoriesKeys = {
  all: ['categories'],
  lists: () => [...categoriesKeys.all, 'list'],
  list: (filters) => [...categoriesKeys.lists(), { filters }],
  details: () => [...categoriesKeys.all, 'detail'],
  detail: (id) => [...categoriesKeys.details(), id],
  active: (params) => [...categoriesKeys.all, 'active', params],
  visible: (params) => [...categoriesKeys.all, 'visible', params],
  search: (term, params) => [...categoriesKeys.all, 'search', term, params],
};

/**
 * Hook para obtener lista de categorías con filtros y paginación
 * @param {Object} filters - Filtros y parámetros de paginación
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con datos de categorías
 */
export const useCategoriesQuery = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: categoriesKeys.list(filters),
    queryFn: () => categoriesApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    ...options,
  });
};

/**
 * Hook para obtener una categoría específica por ID
 * @param {number|string} id - ID de la categoría
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con datos de la categoría
 */
export const useCategoryQuery = (id, options = {}) => {
  return useQuery({
    queryKey: categoriesKeys.detail(id),
    queryFn: () => categoriesApi.getById(id),
    enabled: !!id, // Solo ejecutar si tenemos ID
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook para obtener categorías activas
 * @param {Object} params - Parámetros adicionales
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con categorías activas
 */
export const useActiveCategoriesQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: categoriesKeys.active(params),
    queryFn: () => categoriesApi.getActive(params),
    staleTime: 10 * 60 * 1000, // 10 minutos - datos más estables
    ...options,
  });
};

/**
 * Hook para obtener categorías visibles
 * @param {Object} params - Parámetros adicionales
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con categorías visibles
 */
export const useVisibleCategoriesQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: categoriesKeys.visible(params),
    queryFn: () => categoriesApi.getVisible(params),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook para buscar categorías
 * @param {string} searchTerm - Término de búsqueda
 * @param {Object} params - Parámetros adicionales
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con resultados de búsqueda
 */
export const useSearchCategoriesQuery = (searchTerm, params = {}, options = {}) => {
  return useQuery({
    queryKey: categoriesKeys.search(searchTerm, params),
    queryFn: () => categoriesApi.search(searchTerm, params),
    enabled: !!searchTerm && searchTerm.length >= 2, // Solo buscar con 2+ caracteres
    staleTime: 2 * 60 * 1000, // 2 minutos - búsquedas más dinámicas
    ...options,
  });
};

// ===== MUTATIONS =====

/**
 * Hook para crear nueva categoría
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useCreateCategoryMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryData) => categoriesApi.create(categoryData),
    onSuccess: (newCategory, variables) => {
      // Invalidar todas las queries relacionadas con categorías
      queryClient.invalidateQueries({
        queryKey: categoriesKeys.all
      });
      
      // Agregar la nueva categoría al cache de detalle
      queryClient.setQueryData(
        categoriesKeys.detail(newCategory.id), 
        newCategory
      );

      console.log('✅ Category created successfully:', newCategory);
    },
    onError: (error) => {
      console.error('❌ Failed to create category:', error);
    },
    ...options,
  });
};

/**
 * Hook para actualizar categoría existente - VERSIÓN SIMPLIFICADA
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useUpdateCategoryMutation = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: ['categories', 'update'],
    mutationFn: ({ id, data }) => {
      console.log('🚀 useUpdateCategoryMutation.mutationFn called with:', { id, data });
      return categoriesApi.update(id, data);
    },
    onSuccess: (updatedCategory, variables) => {
      console.log('✅ useUpdateCategoryMutation.onSuccess:', updatedCategory);
      
      // Actualizar el cache de detalle con datos reales del servidor
      queryClient.setQueryData(
        categoriesKeys.detail(variables.id), 
        updatedCategory
      );
      
      // ESTRATEGIA SIMPLE: Solo actualizar el item en las listas existentes
      // sin invalidar para mantener la paginación
      const allListQueries = queryClient.getQueriesData({
        queryKey: categoriesKeys.lists()
      });
      
      // Actualizar el item en todas las listas donde aparezca
      allListQueries.forEach(([queryKey, queryData]) => {
        if (queryData?.items) {
          const updatedItems = queryData.items.map(item => 
            String(item.id) === String(variables.id) ? updatedCategory : item
          );
          
          queryClient.setQueryData(queryKey, {
            ...queryData,
            items: updatedItems
          });
        }
      });
      
      console.log('🔄 Category updated in existing lists without refetch');
      
      // Llamar callback personalizado si existe
      if (options.onSuccess) {
        options.onSuccess(updatedCategory, variables);
      }
    },
    onError: (error, variables) => {
      console.error('❌ useUpdateCategoryMutation.onError:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        variables
      });
      
      // Llamar callback personalizado si existe
      if (options.onError) {
        options.onError(error, variables);
      }
    }
  });
};

/**
 * Hook para eliminar categoría
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useDeleteCategoryMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => {
      console.log('🗑️ useDeleteCategoryMutation.mutationFn called with ID:', id);
      return categoriesApi.delete(id);
    },
    onSuccess: (result, id) => {
      console.log('✅ useDeleteCategoryMutation.onSuccess:', { result, id });
      
      // Remover del cache de detalle específico
      queryClient.removeQueries({
        queryKey: categoriesKeys.detail(id)
      });

      // Invalidar TODAS las queries relacionadas con categorías
      queryClient.invalidateQueries({
        queryKey: categoriesKeys.all
      });
      
      // También invalidar queries específicas
      queryClient.invalidateQueries({
        queryKey: categoriesKeys.lists()
      });
      
      queryClient.invalidateQueries({
        queryKey: categoriesKeys.active()
      });
      
      queryClient.invalidateQueries({
        queryKey: categoriesKeys.visible()
      });
      
      // Llamar callback personalizado si existe
      if (options.onSuccess) {
        options.onSuccess(result, id);
      }
    },
    onError: (error, id) => {
      console.error('❌ useDeleteCategoryMutation.onError:', { error, id });
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Llamar callback personalizado si existe
      if (options.onError) {
        options.onError(error, id);
      }
    }
  });
};

// ===== CUSTOM ACTIONS MUTATIONS =====

/**
 * Hook para activar/desactivar categoría
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useToggleActiveCategoryMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }) => categoriesApi.setActive(id, active),
    onSuccess: (updatedCategory, { id }) => {
      // Actualizar cache de detalle
      queryClient.setQueryData(
        categoriesKeys.detail(id), 
        updatedCategory
      );

      // Invalidar listas relacionadas
      queryClient.invalidateQueries(categoriesKeys.lists());
      queryClient.invalidateQueries(categoriesKeys.active());
      
      console.log('✅ Category active status toggled:', updatedCategory);
    },
    ...options,
  });
};

/**
 * Hook para mostrar/ocultar categoría
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useToggleVisibleCategoryMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, visible }) => categoriesApi.setVisible(id, visible),
    onSuccess: (updatedCategory, { id }) => {
      // Actualizar cache de detalle
      queryClient.setQueryData(
        categoriesKeys.detail(id), 
        updatedCategory
      );

      // Invalidar listas relacionadas
      queryClient.invalidateQueries(categoriesKeys.lists());
      queryClient.invalidateQueries(categoriesKeys.visible());
      
      console.log('✅ Category visible status toggled:', updatedCategory);
    },
    ...options,
  });
};

/**
 * Hook para mover categoría hacia arriba
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useMoveUpCategoryMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => categoriesApi.moveUp(id),
    onSuccess: () => {
      // Invalidar todas las listas ya que el orden cambió
      queryClient.invalidateQueries(categoriesKeys.lists());
      console.log('✅ Category moved up successfully');
    },
    ...options,
  });
};

/**
 * Hook para mover categoría hacia abajo
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useMoveDownCategoryMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => categoriesApi.moveDown(id),
    onSuccess: () => {
      // Invalidar todas las listas ya que el orden cambió
      queryClient.invalidateQueries(categoriesKeys.lists());
      console.log('✅ Category moved down successfully');
    },
    ...options,
  });
};

/**
 * Hook para duplicar categoría
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useDuplicateCategoryMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => categoriesApi.duplicate(id),
    onSuccess: (duplicatedCategory) => {
      // Invalidar listas para mostrar la nueva categoría
      queryClient.invalidateQueries(categoriesKeys.lists());
      
      // Agregar al cache de detalle
      queryClient.setQueryData(
        categoriesKeys.detail(duplicatedCategory.id), 
        duplicatedCategory
      );
      
      console.log('✅ Category duplicated successfully:', duplicatedCategory);
    },
    ...options,
  });
};

// ===== UTILITIES =====

/**
 * Invalidar todas las queries relacionadas con categorías
 * @param {Object} queryClient - Cliente de queries
 */
export const invalidateAllCategoriesQueries = (queryClient) => {
  queryClient.invalidateQueries(categoriesKeys.all);
};

/**
 * Prefetch de categorías para mejorar UX
 * @param {Object} queryClient - Cliente de queries
 * @param {Object} filters - Filtros para prefetch
 */
export const prefetchCategories = (queryClient, filters = {}) => {
  queryClient.prefetchQuery({
    queryKey: categoriesKeys.list(filters),
    queryFn: () => categoriesApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export default {
  useCategoriesQuery,
  useCategoryQuery,
  useActiveCategoriesQuery,
  useVisibleCategoriesQuery,
  useSearchCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleActiveCategoryMutation,
  useToggleVisibleCategoryMutation,
  useMoveUpCategoryMutation,
  useMoveDownCategoryMutation,
  useDuplicateCategoryMutation,
  categoriesKeys,
  invalidateAllCategoriesQueries,
  prefetchCategories,
};
