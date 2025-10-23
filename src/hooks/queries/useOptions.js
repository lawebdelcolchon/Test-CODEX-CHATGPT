import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { optionsApi } from '../../services/api/OptionsAPI.js';

/**
 * Query keys para opciones - centralizados para consistencia
 */
export const optionsKeys = {
  all: ['options'],
  lists: () => [...optionsKeys.all, 'list'],
  list: (filters) => [...optionsKeys.lists(), { filters }],
  details: () => [...optionsKeys.all, 'detail'],
  detail: (id) => [...optionsKeys.details(), id],
  active: (params) => [...optionsKeys.all, 'active', params],
  byCategory: (categoryId, params) => [...optionsKeys.all, 'category', categoryId, params],
  search: (term, params) => [...optionsKeys.all, 'search', term, params],
};

/**
 * Hook para obtener lista de opciones con filtros y paginación
 * @param {Object} filters - Filtros y parámetros de paginación
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con datos de opciones
 */
export const useOptionsQuery = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: optionsKeys.list(filters),
    queryFn: () => optionsApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    ...options,
  });
};

/**
 * Hook para obtener una opción específica por ID
 * @param {number|string} id - ID de la opción
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con datos de la opción
 */
export const useOptionQuery = (id, options = {}) => {
  return useQuery({
    queryKey: optionsKeys.detail(id),
    queryFn: () => optionsApi.getById(id),
    enabled: !!id, // Solo ejecutar si tenemos ID
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook para obtener opciones activas
 * @param {Object} params - Parámetros adicionales
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con opciones activas
 */
export const useActiveOptionsQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: optionsKeys.active(params),
    queryFn: () => optionsApi.getActive(params),
    staleTime: 10 * 60 * 1000, // 10 minutos - datos más estables
    ...options,
  });
};

/**
 * Hook para obtener opciones por categoría
 * @param {number|string} categoryId - ID de la categoría
 * @param {Object} params - Parámetros adicionales
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con opciones de la categoría
 */
export const useOptionsByCategoryQuery = (categoryId, params = {}, options = {}) => {
  return useQuery({
    queryKey: optionsKeys.byCategory(categoryId, params),
    queryFn: () => optionsApi.getByCategory(categoryId, params),
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook para buscar opciones
 * @param {string} searchTerm - Término de búsqueda
 * @param {Object} params - Parámetros adicionales
 * @param {Object} options - Opciones adicionales de useQuery
 * @returns {Object} Query result con resultados de búsqueda
 */
export const useSearchOptionsQuery = (searchTerm, params = {}, options = {}) => {
  return useQuery({
    queryKey: optionsKeys.search(searchTerm, params),
    queryFn: () => optionsApi.search(searchTerm, params),
    enabled: !!searchTerm && searchTerm.length >= 2, // Solo buscar con 2+ caracteres
    staleTime: 2 * 60 * 1000, // 2 minutos - búsquedas más dinámicas
    ...options,
  });
};

// ===== MUTATIONS =====

/**
 * Hook para crear nueva opción
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useCreateOptionMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (optionData) => optionsApi.create(optionData),
    onSuccess: (newOption, variables) => {
      // Invalidar todas las queries relacionadas con opciones
      queryClient.invalidateQueries({
        queryKey: optionsKeys.all
      });
      
      // Agregar la nueva opción al cache de detalle
      queryClient.setQueryData(
        optionsKeys.detail(newOption.id), 
        newOption
      );

      console.log('✅ Option created successfully:', newOption);
    },
    onError: (error) => {
      console.error('❌ Failed to create option:', error);
    },
    ...options,
  });
};

/**
 * Hook para actualizar opción existente
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useUpdateOptionMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => {
      console.log('🚀 useUpdateOptionMutation.mutationFn called with:', { id, data });
      return optionsApi.update(id, data);
    },
    onSuccess: (updatedOption, { id }) => {
      console.log('✅ useUpdateOptionMutation.onSuccess:', updatedOption);
      
      // Actualizar el cache de detalle con datos reales del servidor
      queryClient.setQueryData(
        optionsKeys.detail(id), 
        updatedOption
      );

      // ESTRATEGIA SIMPLE: Solo actualizar el item en las listas existentes
      const allListQueries = queryClient.getQueriesData({
        queryKey: optionsKeys.lists()
      });
      
      // Actualizar el item en todas las listas donde aparezca
      allListQueries.forEach(([queryKey, queryData]) => {
        if (queryData?.items) {
          const updatedItems = queryData.items.map(item => 
            String(item.id) === String(id) ? updatedOption : item
          );
          
          queryClient.setQueryData(queryKey, {
            ...queryData,
            items: updatedItems
          });
        }
      });
      
      console.log('✅ Option updated successfully:', updatedOption);
      console.log('🔄 Option updated in existing lists without refetch');
      
      // Llamar callback personalizado si existe
      if (options.onSuccess) {
        options.onSuccess(updatedOption, { id });
      }
    },
    onError: (error, { id }) => {
      console.error('❌ useUpdateOptionMutation.onError:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      // Llamar callback personalizado si existe
      if (options.onError) {
        options.onError(error, { id });
      }
    }
  });
};

/**
 * Hook para eliminar opción
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useDeleteOptionMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => {
      console.log('🗑️ useDeleteOptionMutation.mutationFn called with ID:', id);
      return optionsApi.delete(id);
    },
    onSuccess: (result, id) => {
      console.log('✅ useDeleteOptionMutation.onSuccess:', { result, id });
      
      // Remover del cache de detalle específico
      queryClient.removeQueries({
        queryKey: optionsKeys.detail(id)
      });

      // Invalidar TODAS las queries relacionadas con opciones
      queryClient.invalidateQueries({
        queryKey: optionsKeys.all
      });
      
      // También invalidar queries específicas
      queryClient.invalidateQueries({
        queryKey: optionsKeys.lists()
      });
      
      queryClient.invalidateQueries({
        queryKey: optionsKeys.active()
      });
      
      // Llamar callback personalizado si existe
      if (options.onSuccess) {
        options.onSuccess(result, id);
      }
    },
    onError: (error, id) => {
      console.error('❌ useDeleteOptionMutation.onError:', { error, id });
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
 * Hook para activar/desactivar opción
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useToggleOptionActiveMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }) => optionsApi.setActive(id, active),
    onSuccess: (updatedOption, { id }) => {
      // Actualizar cache de detalle
      queryClient.setQueryData(optionsKeys.detail(id), updatedOption);
      
      // Invalidar listas para reflejar cambios
      queryClient.invalidateQueries(optionsKeys.lists());
      queryClient.invalidateQueries(optionsKeys.active());
      
      console.log(`✅ Option ${id} ${updatedOption.active ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error) => {
      console.error('❌ Failed to toggle option active state:', error);
    },
    ...options,
  });
};

/**
 * Hook para reordenar posición de opción
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useUpdateOptionPositionMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, position }) => optionsApi.setPosition(id, position),
    onSuccess: (updatedOption, { id }) => {
      // Actualizar cache de detalle
      queryClient.setQueryData(optionsKeys.detail(id), updatedOption);
      
      // Invalidar listas para reflejar reordenamiento
      queryClient.invalidateQueries(optionsKeys.lists());
      
      console.log(`✅ Option ${id} position updated to ${updatedOption.position} successfully`);
    },
    onError: (error) => {
      console.error('❌ Failed to update option position:', error);
    },
    ...options,
  });
};

/**
 * Hook para actualizar observaciones de opción
 * @param {Object} options - Opciones adicionales de useMutation
 * @returns {Object} Mutation result
 */
export const useUpdateOptionObservationsMutation = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, observations }) => optionsApi.updateObservations(id, observations),
    onSuccess: (updatedOption, { id }) => {
      // Actualizar cache de detalle
      queryClient.setQueryData(optionsKeys.detail(id), updatedOption);
      
      console.log(`✅ Option ${id} observations updated successfully`);
    },
    onError: (error) => {
      console.error('❌ Failed to update option observations:', error);
    },
    ...options,
  });
};
