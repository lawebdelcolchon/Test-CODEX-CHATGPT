import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attributesApi } from '../../services/api/AttributesAPI.js';

/**
 * Query keys para atributos - centralizados para consistencia
 */
export const attributesKeys = {
  all: ['attributes'],
  lists: () => [...attributesKeys.all, 'list'],
  list: (filters) => [...attributesKeys.lists(), { filters }],
  details: () => [...attributesKeys.all, 'detail'],
  detail: (id) => [...attributesKeys.details(), id],
  active: (params) => [...attributesKeys.all, 'active', params],
  visible: (params) => [...attributesKeys.all, 'visible', params],
  root: (params) => [...attributesKeys.all, 'root', params],
  byLevel: (level, params) => [...attributesKeys.all, 'level', level, params],
  byParent: (parentId, params) => [...attributesKeys.all, 'parent', parentId, params],
  byUtilities: (utilities, params) => [...attributesKeys.all, 'utilities', utilities, params],
  byCategory: (categoryId, params) => [...attributesKeys.all, 'category', categoryId, params],
  search: (term, params) => [...attributesKeys.all, 'search', term, params],
};

/**
 * Hook para obtener lista de atributos con filtros y paginación
 * @param {Object} filters - Filtros y parámetros de paginación
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con datos de atributos
 */
export const useAttributesQuery = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: attributesKeys.list(filters),
    queryFn: () => attributesApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    ...options,
  });
};

/**
 * Hook para obtener un atributo específico por ID
 * @param {number|string} id - ID del atributo
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con datos del atributo
 */
export const useAttributeQuery = (id, options = {}) => {
  return useQuery({
    queryKey: attributesKeys.detail(id),
    queryFn: () => attributesApi.getById(id),
    enabled: !!id, // Solo ejecutar si tenemos ID
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook para obtener atributos activos
 * @param {Object} params - Parámetros adicionales
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con atributos activos
 */
export const useActiveAttributesQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: attributesKeys.active(params),
    queryFn: () => attributesApi.getActive(params),
    staleTime: 10 * 60 * 1000, // 10 minutos - datos más estables
    ...options,
  });
};

/**
 * Hook para obtener atributos visibles
 * @param {Object} params - Parámetros adicionales
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con atributos visibles
 */
export const useVisibleAttributesQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: attributesKeys.visible(params),
    queryFn: () => attributesApi.getVisible(params),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook para obtener atributos raíz (nivel 0)
 * @param {Object} params - Parámetros adicionales
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con atributos raíz
 */
export const useRootAttributesQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: attributesKeys.root(params),
    queryFn: () => attributesApi.getRootAttributes(params),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook para obtener atributos por nivel
 * @param {number} level - Nivel del atributo
 * @param {Object} params - Parámetros adicionales
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con atributos por nivel
 */
export const useAttributesByLevelQuery = (level, params = {}, options = {}) => {
  return useQuery({
    queryKey: attributesKeys.byLevel(level, params),
    queryFn: () => attributesApi.getByLevel(level, params),
    enabled: level !== undefined && level !== null,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook para obtener atributos por padre
 * @param {number|string} parentId - ID del padre
 * @param {Object} params - Parámetros adicionales
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con atributos hijos
 */
export const useAttributesByParentQuery = (parentId, params = {}, options = {}) => {
  return useQuery({
    queryKey: attributesKeys.byParent(parentId, params),
    queryFn: () => attributesApi.getByParent(parentId, params),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook para obtener atributos por utilidades
 * @param {string} utilities - Utilidades del atributo
 * @param {Object} params - Parámetros adicionales
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con atributos filtrados
 */
export const useAttributesByUtilitiesQuery = (utilities, params = {}, options = {}) => {
  return useQuery({
    queryKey: attributesKeys.byUtilities(utilities, params),
    queryFn: () => attributesApi.getByUtilities(utilities, params),
    enabled: !!utilities,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook para obtener atributos relacionados con una categoría específica
 * Incluye atributos de la categoría y su árbol jerárquico
 * @param {number|string} categoryId - ID de la categoría
 * @param {Object} params - Parámetros adicionales
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con atributos relacionados
 */
export const useAttributesByCategoryQuery = (categoryId, params = {}, options = {}) => {
  return useQuery({
    queryKey: attributesKeys.byCategory(categoryId, params),
    queryFn: () => attributesApi.getByCategory(categoryId, params),
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000, // 10 minutos - datos más estables para relaciones
    ...options,
  });
};

/**
 * Hook para buscar atributos
 * @param {string} searchTerm - Término de búsqueda
 * @param {Object} params - Parámetros adicionales
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con resultados de búsqueda
 */
export const useSearchAttributesQuery = (searchTerm, params = {}, options = {}) => {
  return useQuery({
    queryKey: attributesKeys.search(searchTerm, params),
    queryFn: () => attributesApi.search(searchTerm, params),
    enabled: !!searchTerm && searchTerm.length >= 2, // Solo buscar con 2+ caracteres
    staleTime: 2 * 60 * 1000, // 2 minutos - búsquedas más dinámicas
    ...options,
  });
};

// ===== MUTATIONS =====

/**
 * Hook para crear nuevo atributo
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useCreateAttributeMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attributeData) => attributesApi.create(attributeData),
    onSuccess: (newAttribute, variables) => {
      // Invalidar todas las queries relacionadas con atributos
      queryClient.invalidateQueries({
        queryKey: attributesKeys.all
      });
      
      // Agregar el nuevo atributo al cache de detalle
      queryClient.setQueryData(
        attributesKeys.detail(newAttribute.id), 
        newAttribute
      );

      console.log('✅ Attribute created successfully:', newAttribute);
    },
    onError: (error) => {
      console.error('❌ Failed to create attribute:', error);
    },
    ...options,
  });
};

/**
 * Hook para actualizar atributo existente
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useUpdateAttributeMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => attributesApi.update(id, data),
    onSuccess: (updatedAttribute, { id }) => {
      // Actualizar el cache de detalle con datos reales del servidor
      queryClient.setQueryData(
        attributesKeys.detail(id), 
        updatedAttribute
      );

      // ESTRATEGIA SIMPLE: Solo actualizar el item en las listas existentes
      const allListQueries = queryClient.getQueriesData({
        queryKey: attributesKeys.lists()
      });
      
      // Actualizar el item en todas las listas donde aparezca
      allListQueries.forEach(([queryKey, queryData]) => {
        if (queryData?.items) {
          const updatedItems = queryData.items.map(item => 
            String(item.id) === String(id) ? updatedAttribute : item
          );
          
          queryClient.setQueryData(queryKey, {
            ...queryData,
            items: updatedItems
          });
        }
      });
      
      console.log('✅ Attribute updated successfully:', updatedAttribute);
      console.log('🔄 Attribute updated in existing lists without refetch');
      
      // Llamar callback personalizado si existe
      if (options.onSuccess) {
        options.onSuccess(updatedAttribute, { id });
      }
    },
    onError: (error, { id }) => {
      console.error('❌ Failed to update attribute:', error);
      
      // Llamar callback personalizado si existe
      if (options.onError) {
        options.onError(error, { id });
      }
    }
  });
};

/**
 * Hook para eliminar atributo
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useDeleteAttributeMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => {
      console.log('🗑️ useDeleteAttributeMutation.mutationFn called with ID:', id);
      return attributesApi.delete(id);
    },
    onSuccess: (result, id) => {
      console.log('✅ useDeleteAttributeMutation.onSuccess:', { result, id });
      
      // Remover del cache de detalle específico
      queryClient.removeQueries({
        queryKey: attributesKeys.detail(id)
      });

      // Invalidar TODAS las queries relacionadas con atributos
      queryClient.invalidateQueries({
        queryKey: attributesKeys.all
      });
      
      // También invalidar queries específicas
      queryClient.invalidateQueries({
        queryKey: attributesKeys.lists()
      });
      
      queryClient.invalidateQueries({
        queryKey: attributesKeys.active()
      });
      
      queryClient.invalidateQueries({
        queryKey: attributesKeys.visible()
      });
      
      queryClient.invalidateQueries({
        queryKey: attributesKeys.root()
      });
      
      // Llamar callback personalizado si existe
      if (options.onSuccess) {
        options.onSuccess(result, id);
      }
    },
    onError: (error, id) => {
      console.error('❌ useDeleteAttributeMutation.onError:', { error, id });
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
 * Hook para activar/desactivar atributo
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useToggleActiveAttributeMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }) => attributesApi.setActive(id, active),
    onSuccess: (updatedAttribute, { id }) => {
      // Actualizar cache de detalle
      queryClient.setQueryData(
        attributesKeys.detail(id), 
        updatedAttribute
      );

      // Invalidar listas relacionadas
      queryClient.invalidateQueries(attributesKeys.lists());
      queryClient.invalidateQueries(attributesKeys.active());
      
      console.log('✅ Attribute active status toggled:', updatedAttribute);
    },
    ...options,
  });
};

/**
 * Hook para mostrar/ocultar atributo
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useToggleVisibleAttributeMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, visible }) => attributesApi.setVisible(id, visible),
    onSuccess: (updatedAttribute, { id }) => {
      // Actualizar cache de detalle
      queryClient.setQueryData(
        attributesKeys.detail(id), 
        updatedAttribute
      );

      // Invalidar listas relacionadas
      queryClient.invalidateQueries(attributesKeys.lists());
      queryClient.invalidateQueries(attributesKeys.visible());
      
      console.log('✅ Attribute visible status toggled:', updatedAttribute);
    },
    ...options,
  });
};

// ===== UTILITIES =====

/**
 * Invalidar todas las queries relacionadas con atributos
 * @param {Object} queryClient - Cliente de queries
 */
export const invalidateAllAttributesQueries = (queryClient) => {
  queryClient.invalidateQueries(attributesKeys.all);
};

/**
 * Prefetch de atributos para mejorar UX
 * @param {Object} queryClient - Cliente de queries
 * @param {Object} filters - Filtros para prefetch
 */
export const prefetchAttributes = (queryClient, filters = {}) => {
  queryClient.prefetchQuery({
    queryKey: attributesKeys.list(filters),
    queryFn: () => attributesApi.getAll(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export default {
  useAttributesQuery,
  useAttributeQuery,
  useActiveAttributesQuery,
  useVisibleAttributesQuery,
  useRootAttributesQuery,
  useAttributesByLevelQuery,
  useAttributesByParentQuery,
  useAttributesByUtilitiesQuery,
  useAttributesByCategoryQuery,
  useSearchAttributesQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,
  useToggleActiveAttributeMutation,
  useToggleVisibleAttributeMutation,
  attributesKeys,
  invalidateAllAttributesQueries,
  prefetchAttributes,
};
