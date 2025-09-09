import { useDispatch, useSelector } from 'react-redux';
import { useCallback, useEffect, useMemo } from 'react';
import { getModelActions, getModelSelectors } from '../store/slices/index.js';
import { getModelConfig } from '../config/models.js';

/**
 * Hook personalizado para operaciones CRUD genéricas
 * Proporciona una interfaz unificada para cualquier modelo
 * 
 * @param {string} modelName - Nombre del modelo (products, orders, etc.)
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Objeto con datos, acciones y estados
 */
export const useGenericCRUD = (modelName, options = {}) => {
  const {
    autoFetch = true,          // Auto-cargar datos al montar
    fetchParams = {},          // Parámetros por defecto para fetchList
    enableOptimisticUpdates = true, // Actualizaciones optimistas
    onError = null,            // Callback para errores
    onSuccess = null           // Callback para éxitos
  } = options;

  const dispatch = useDispatch();
  
  // Obtener acciones y selectors del modelo
  const actions = useMemo(() => getModelActions(modelName), [modelName]);
  const selectors = useMemo(() => getModelSelectors(modelName), [modelName]);
  const config = useMemo(() => getModelConfig(modelName), [modelName]);

  // ===== SELECTORS =====
  
  // Datos principales
  const items = useSelector(selectors.selectItems);
  const currentItem = useSelector(selectors.selectCurrentItem);
  const total = useSelector(selectors.selectTotal);
  const pagination = useSelector(selectors.selectPagination);

  // Estados de loading
  const isLoading = useSelector(selectors.selectIsLoading);
  const isListLoading = useSelector(selectors.selectIsListLoading);
  const isCreateLoading = useSelector(selectors.selectIsCreateLoading);
  const isUpdateLoading = useSelector(selectors.selectIsUpdateLoading);
  const isDeleteLoading = useSelector(selectors.selectIsDeleteLoading);
  const isFetchByIdLoading = useSelector(selectors.selectIsFetchByIdLoading);
  const isCustomActionLoading = useSelector(selectors.selectIsCustomActionLoading);

  // Errores
  const error = useSelector(selectors.selectError);
  const listError = useSelector(selectors.selectListError);
  const createError = useSelector(selectors.selectCreateError);
  const updateError = useSelector(selectors.selectUpdateError);
  const deleteError = useSelector(selectors.selectDeleteError);
  const fetchByIdError = useSelector(selectors.selectFetchByIdError);
  const customActionError = useSelector(selectors.selectCustomActionError);

  // Otros estados
  const currentFilters = useSelector(selectors.selectCurrentFilters);
  const currentSort = useSelector(selectors.selectCurrentSort);
  const lastFetch = useSelector(selectors.selectLastFetch);
  const lastUpdate = useSelector(selectors.selectLastUpdate);

  // ===== ACCIONES WRAPPED =====

  // Fetch list con manejo de errores
  const fetchList = useCallback(async (params = {}) => {
    try {
      const mergedParams = { ...fetchParams, ...params };
      const result = await dispatch(actions.fetchList(mergedParams)).unwrap();
      
      if (onSuccess) {
        onSuccess('fetchList', result);
      }
      
      return result;
    } catch (error) {
      console.error(`Error fetching ${modelName} list:`, error);
      
      if (onError) {
        onError('fetchList', error);
      }
      
      throw error;
    }
  }, [dispatch, actions.fetchList, fetchParams, onSuccess, onError, modelName]);

  // Fetch by ID
  const fetchById = useCallback(async (id) => {
    try {
      const result = await dispatch(actions.fetchById(id)).unwrap();
      
      if (onSuccess) {
        onSuccess('fetchById', result);
      }
      
      return result;
    } catch (error) {
      console.error(`Error fetching ${modelName} ${id}:`, error);
      
      if (onError) {
        onError('fetchById', error);
      }
      
      throw error;
    }
  }, [dispatch, actions.fetchById, onSuccess, onError, modelName]);

  // Create
  const create = useCallback(async (payload) => {
    try {
      const result = await dispatch(actions.create(payload)).unwrap();
      
      if (onSuccess) {
        onSuccess('create', result);
      }
      
      return result;
    } catch (error) {
      console.error(`Error creating ${modelName}:`, error);
      
      if (onError) {
        onError('create', error);
      }
      
      throw error;
    }
  }, [dispatch, actions.create, onSuccess, onError, modelName]);

  // Update
  const update = useCallback(async (id, payload) => {
    // Actualización optimista si está habilitada
    if (enableOptimisticUpdates) {
      dispatch(actions.updateItemOptimistic({ id, changes: payload }));
    }
    
    try {
      const result = await dispatch(actions.update({ id, payload })).unwrap();
      
      if (onSuccess) {
        onSuccess('update', result);
      }
      
      return result;
    } catch (error) {
      console.error(`Error updating ${modelName} ${id}:`, error);
      
      // Revertir actualización optimista en caso de error
      if (enableOptimisticUpdates) {
        // Buscar el item original para revertir
        const originalItem = items.find(item => item.id === id);
        if (originalItem) {
          dispatch(actions.updateItemOptimistic({ id, changes: originalItem }));
        }
      }
      
      if (onError) {
        onError('update', error);
      }
      
      throw error;
    }
  }, [dispatch, actions.update, actions.updateItemOptimistic, enableOptimisticUpdates, items, onSuccess, onError, modelName]);

  // Delete
  const remove = useCallback(async (id) => {
    try {
      const result = await dispatch(actions.remove(id)).unwrap();
      
      if (onSuccess) {
        onSuccess('remove', result);
      }
      
      return result;
    } catch (error) {
      console.error(`Error removing ${modelName} ${id}:`, error);
      
      if (onError) {
        onError('remove', error);
      }
      
      throw error;
    }
  }, [dispatch, actions.remove, onSuccess, onError, modelName]);

  // Custom action
  const customAction = useCallback(async (action, id = null, payload = null, method = 'GET') => {
    try {
      const result = await dispatch(actions.customAction({ action, id, payload, method })).unwrap();
      
      if (onSuccess) {
        onSuccess('customAction', { action, result });
      }
      
      return result;
    } catch (error) {
      console.error(`Error in custom action ${action} on ${modelName}:`, error);
      
      if (onError) {
        onError('customAction', { action, error });
      }
      
      throw error;
    }
  }, [dispatch, actions.customAction, onSuccess, onError, modelName]);

  // ===== ACCIONES DE UTILIDAD =====

  // Limpiar errores
  const clearErrors = useCallback(() => {
    dispatch(actions.clearErrors());
  }, [dispatch, actions.clearErrors]);

  // Limpiar item actual
  const clearCurrentItem = useCallback(() => {
    dispatch(actions.clearCurrentItem());
  }, [dispatch, actions.clearCurrentItem]);

  // Establecer filtros
  const setFilters = useCallback((filters) => {
    dispatch(actions.setFilters(filters));
  }, [dispatch, actions.setFilters]);

  // Establecer ordenamiento
  const setSort = useCallback((sortConfig) => {
    dispatch(actions.setSort(sortConfig));
  }, [dispatch, actions.setSort]);

  // Reset estado
  const resetState = useCallback(() => {
    dispatch(actions.resetState());
  }, [dispatch, actions.resetState]);

  // Buscar item por ID en la lista actual
  const findItemById = useCallback((id) => {
    return selectors.selectItemById({ [modelName]: { items } }, id);
  }, [items, selectors.selectItemById, modelName]);

  // Refetch con parámetros actuales
  const refetch = useCallback(() => {
    return fetchList({ ...currentFilters, ...currentSort });
  }, [fetchList, currentFilters, currentSort]);

  // ===== EFECTOS =====

  // Auto-fetch al montar el componente
  useEffect(() => {
    if (autoFetch && items.length === 0 && !isListLoading && !lastFetch) {
      console.log(`🚀 Auto-fetching ${modelName} data`);
      fetchList();
    }
  }, [autoFetch, items.length, isListLoading, lastFetch, fetchList, modelName]);

  // ===== VALORES COMPUTADOS =====

  const isAnyLoading = useMemo(() => {
    return isLoading || isListLoading || isCreateLoading || 
           isUpdateLoading || isDeleteLoading || isFetchByIdLoading || 
           isCustomActionLoading;
  }, [isLoading, isListLoading, isCreateLoading, isUpdateLoading, 
      isDeleteLoading, isFetchByIdLoading, isCustomActionLoading]);

  const hasError = useMemo(() => {
    return !!(error || listError || createError || updateError || 
              deleteError || fetchByIdError || customActionError);
  }, [error, listError, createError, updateError, deleteError, 
      fetchByIdError, customActionError]);

  const isEmpty = useMemo(() => {
    return items.length === 0 && !isListLoading && !hasError;
  }, [items.length, isListLoading, hasError]);

  const canCreate = useMemo(() => {
    return config.endpoints?.create !== null;
  }, [config.endpoints]);

  const canUpdate = useMemo(() => {
    return config.endpoints?.update !== null;
  }, [config.endpoints]);

  const canDelete = useMemo(() => {
    return config.endpoints?.delete !== null;
  }, [config.endpoints]);

  // ===== RETURN OBJECT =====

  return {
    // ===== DATOS =====
    data: {
      items,
      currentItem,
      total,
      pagination,
      isEmpty,
      config
    },

    // ===== ESTADOS =====
    loading: {
      isLoading,
      isListLoading,
      isCreateLoading,
      isUpdateLoading,
      isDeleteLoading,
      isFetchByIdLoading,
      isCustomActionLoading,
      isAnyLoading
    },

    // ===== ERRORES =====
    errors: {
      error,
      listError,
      createError,
      updateError,
      deleteError,
      fetchByIdError,
      customActionError,
      hasError
    },

    // ===== FILTROS Y ORDENAMIENTO =====
    filters: {
      currentFilters,
      currentSort,
      setFilters,
      setSort
    },

    // ===== ACCIONES CRUD =====
    actions: {
      fetchList,
      fetchById,
      create: canCreate ? create : null,
      update: canUpdate ? update : null,
      remove: canDelete ? remove : null,
      customAction,
      refetch
    },

    // ===== UTILIDADES =====
    utils: {
      clearErrors,
      clearCurrentItem,
      resetState,
      findItemById,
      canCreate,
      canUpdate,
      canDelete
    },

    // ===== METADATOS =====
    meta: {
      modelName,
      lastFetch,
      lastUpdate,
      config
    }
  };
};

export default useGenericCRUD;
