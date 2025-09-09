import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import genericApi from '../../services/genericApi.js';
import { 
  getModelConfig, 
  applyFieldTransformations, 
  validateRequiredFields,
  getDefaultListParams,
  modelSupportsOperation
} from '../../config/models.js';

/**
 * Factory para crear slices genéricos con todas las operaciones CRUD
 * @param {string} modelName - Nombre del modelo (products, orders, etc.)
 * @returns {Object} Slice configurado con actions, reducers y async thunks
 */
export const createGenericSlice = (modelName) => {
  const config = getModelConfig(modelName);
  const defaultParams = getDefaultListParams(modelName);
  
  // ===== ASYNC THUNKS =====
  
  // Fetch list con paginación y filtros
  const fetchList = createAsyncThunk(
    `${modelName}/fetchList`,
    async (params = {}, { rejectWithValue }) => {
      try {
        console.log(`🔍 Fetching ${modelName} list with params:`, params);
        
        // Combinar parámetros por defecto con los proporcionados
        const mergedParams = { ...defaultParams, ...params };
        
        const result = await genericApi.list(modelName, mergedParams);
        
        console.log(`✅ ${modelName} list fetched successfully:`, result);
        return result;
        
      } catch (error) {
        console.error(`❌ Error fetching ${modelName} list:`, error);
        return rejectWithValue({
          message: error.message || `Error al cargar ${config.displayName}`,
          status: error.status,
          validationErrors: error.validationErrors
        });
      }
    }
  );

  // Get single item by ID
  const fetchById = createAsyncThunk(
    `${modelName}/fetchById`,
    async (id, { rejectWithValue }) => {
      try {
        console.log(`🔍 Fetching ${modelName} with ID: ${id}`);
        
        const result = await genericApi.get(modelName, id);
        
        console.log(`✅ ${modelName} fetched successfully:`, result);
        return result;
        
      } catch (error) {
        console.error(`❌ Error fetching ${modelName} ${id}:`, error);
        return rejectWithValue({
          message: error.message || `Error al cargar ${config.displayName}`,
          status: error.status
        });
      }
    }
  );

  // Create new item
  const create = createAsyncThunk(
    `${modelName}/create`,
    async (payload, { rejectWithValue }) => {
      try {
        // Verificar si el modelo soporta creación
        if (!modelSupportsOperation(modelName, 'create')) {
          throw new Error(`El modelo ${modelName} no soporta creación`);
        }
        
        console.log(`✨ Creating ${modelName} with payload:`, payload);
        
        // Validar campos requeridos
        const validation = validateRequiredFields(modelName, payload);
        if (!validation.isValid) {
          return rejectWithValue({
            message: validation.message,
            status: 422,
            validationErrors: { general: [validation.message] }
          });
        }
        
        // Aplicar transformaciones de campos
        const transformedPayload = applyFieldTransformations(modelName, payload);
        
        const result = await genericApi.create(modelName, transformedPayload);
        
        console.log(`✅ ${modelName} created successfully:`, result);
        return result;
        
      } catch (error) {
        console.error(`❌ Error creating ${modelName}:`, error);
        return rejectWithValue({
          message: error.message || `Error al crear ${config.displayName}`,
          status: error.status,
          validationErrors: error.validationErrors
        });
      }
    }
  );

  // Update existing item
  const update = createAsyncThunk(
    `${modelName}/update`,
    async ({ id, payload }, { rejectWithValue }) => {
      try {
        // Verificar si el modelo soporta actualización
        if (!modelSupportsOperation(modelName, 'update')) {
          throw new Error(`El modelo ${modelName} no soporta actualización`);
        }
        
        console.log(`📝 Updating ${modelName} ${id} with payload:`, payload);
        
        // Aplicar transformaciones de campos
        const transformedPayload = applyFieldTransformations(modelName, payload);
        
        const result = await genericApi.update(modelName, id, transformedPayload);
        
        console.log(`✅ ${modelName} updated successfully:`, result);
        return result;
        
      } catch (error) {
        console.error(`❌ Error updating ${modelName} ${id}:`, error);
        return rejectWithValue({
          message: error.message || `Error al actualizar ${config.displayName}`,
          status: error.status,
          validationErrors: error.validationErrors
        });
      }
    }
  );

  // Delete item
  const remove = createAsyncThunk(
    `${modelName}/remove`,
    async (id, { rejectWithValue }) => {
      try {
        // Verificar si el modelo soporta eliminación
        if (!modelSupportsOperation(modelName, 'delete')) {
          throw new Error(`El modelo ${modelName} no soporta eliminación`);
        }
        
        console.log(`🗑️ Removing ${modelName} with ID: ${id}`);
        
        const result = await genericApi.remove(modelName, id);
        
        console.log(`✅ ${modelName} removed successfully:`, result);
        return { ...result, id }; // Asegurar que tengamos el ID para el reducer
        
      } catch (error) {
        console.error(`❌ Error removing ${modelName} ${id}:`, error);
        return rejectWithValue({
          message: error.message || `Error al eliminar ${config.displayName}`,
          status: error.status
        });
      }
    }
  );

  // Custom action genérica
  const customAction = createAsyncThunk(
    `${modelName}/customAction`,
    async ({ action, id, payload, method = 'GET' }, { rejectWithValue }) => {
      try {
        console.log(`🔧 Custom action ${action} on ${modelName}:`, { id, payload, method });
        
        const result = await genericApi.customAction(modelName, action, id, payload, method);
        
        console.log(`✅ Custom action ${action} completed successfully:`, result);
        return { action, id, result };
        
      } catch (error) {
        console.error(`❌ Error in custom action ${action} on ${modelName}:`, error);
        return rejectWithValue({
          message: error.message || `Error en acción ${action}`,
          status: error.status
        });
      }
    }
  );

  // ===== ESTADO INICIAL =====
  const initialState = {
    // Datos
    items: [],
    currentItem: null,
    total: 0,
    page: defaultParams.page,
    pageSize: defaultParams.pageSize,
    totalPages: 0,
    
    // Estados de loading
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    listStatus: 'idle',
    createStatus: 'idle',
    updateStatus: 'idle',
    deleteStatus: 'idle',
    fetchByIdStatus: 'idle',
    customActionStatus: 'idle',
    
    // Errores
    error: null,
    listError: null,
    createError: null,
    updateError: null,
    deleteError: null,
    fetchByIdError: null,
    customActionError: null,
    
    // Filtros y ordenamiento actuales
    currentFilters: {},
    currentSort: { field: defaultParams.sort, order: defaultParams.order },
    
    // Metadatos
    lastFetch: null,
    lastUpdate: null
  };

  // ===== SLICE =====
  const slice = createSlice({
    name: modelName,
    initialState,
    reducers: {
      // Limpiar errores
      clearErrors: (state) => {
        state.error = null;
        state.listError = null;
        state.createError = null;
        state.updateError = null;
        state.deleteError = null;
        state.fetchByIdError = null;
        state.customActionError = null;
      },
      
      // Limpiar item actual
      clearCurrentItem: (state) => {
        state.currentItem = null;
        state.fetchByIdStatus = 'idle';
        state.fetchByIdError = null;
      },
      
      // Establecer filtros
      setFilters: (state, action) => {
        state.currentFilters = action.payload;
      },
      
      // Establecer ordenamiento
      setSort: (state, action) => {
        state.currentSort = action.payload;
      },
      
      // Reset completo del estado
      resetState: () => initialState,
      
      // Actualizar item optimista (para actualizaciones en tiempo real)
      updateItemOptimistic: (state, action) => {
        const { id, changes } = action.payload;
        const itemIndex = state.items.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
          state.items[itemIndex] = { ...state.items[itemIndex], ...changes };
        }
        if (state.currentItem && state.currentItem.id === id) {
          state.currentItem = { ...state.currentItem, ...changes };
        }
      }
    },
    extraReducers: (builder) => {
      // ===== FETCH LIST =====
      builder
        .addCase(fetchList.pending, (state) => {
          state.listStatus = 'loading';
          state.listError = null;
          state.status = 'loading';
        })
        .addCase(fetchList.fulfilled, (state, action) => {
          state.listStatus = 'succeeded';
          state.status = 'succeeded';
          state.items = action.payload.items || [];
          state.total = action.payload.total || 0;
          state.page = action.payload.page || 1;
          state.pageSize = action.payload.pageSize || defaultParams.pageSize;
          state.totalPages = action.payload.totalPages || Math.ceil(state.total / state.pageSize);
          state.lastFetch = new Date().toISOString();
        })
        .addCase(fetchList.rejected, (state, action) => {
          state.listStatus = 'failed';
          state.status = 'failed';
          state.listError = action.payload?.message || 'Error al cargar datos';
          state.error = state.listError;
        })

      // ===== FETCH BY ID =====
        .addCase(fetchById.pending, (state) => {
          state.fetchByIdStatus = 'loading';
          state.fetchByIdError = null;
        })
        .addCase(fetchById.fulfilled, (state, action) => {
          state.fetchByIdStatus = 'succeeded';
          state.currentItem = action.payload;
        })
        .addCase(fetchById.rejected, (state, action) => {
          state.fetchByIdStatus = 'failed';
          state.fetchByIdError = action.payload?.message || 'Error al cargar elemento';
        })

      // ===== CREATE =====
        .addCase(create.pending, (state) => {
          state.createStatus = 'loading';
          state.createError = null;
        })
        .addCase(create.fulfilled, (state, action) => {
          state.createStatus = 'succeeded';
          // Agregar al inicio de la lista
          state.items.unshift(action.payload);
          state.total += 1;
          state.lastUpdate = new Date().toISOString();
        })
        .addCase(create.rejected, (state, action) => {
          state.createStatus = 'failed';
          state.createError = action.payload?.message || 'Error al crear elemento';
        })

      // ===== UPDATE =====
        .addCase(update.pending, (state) => {
          state.updateStatus = 'loading';
          state.updateError = null;
        })
        .addCase(update.fulfilled, (state, action) => {
          state.updateStatus = 'succeeded';
          // Actualizar en la lista
          const itemIndex = state.items.findIndex(item => item.id === action.payload.id);
          if (itemIndex !== -1) {
            state.items[itemIndex] = action.payload;
          }
          // Actualizar currentItem si es el mismo
          if (state.currentItem && state.currentItem.id === action.payload.id) {
            state.currentItem = action.payload;
          }
          state.lastUpdate = new Date().toISOString();
        })
        .addCase(update.rejected, (state, action) => {
          state.updateStatus = 'failed';
          state.updateError = action.payload?.message || 'Error al actualizar elemento';
        })

      // ===== DELETE =====
        .addCase(remove.pending, (state) => {
          state.deleteStatus = 'loading';
          state.deleteError = null;
        })
        .addCase(remove.fulfilled, (state, action) => {
          state.deleteStatus = 'succeeded';
          // Remover de la lista
          state.items = state.items.filter(item => item.id !== action.payload.id);
          state.total = Math.max(0, state.total - 1);
          // Limpiar currentItem si es el mismo
          if (state.currentItem && state.currentItem.id === action.payload.id) {
            state.currentItem = null;
          }
          state.lastUpdate = new Date().toISOString();
        })
        .addCase(remove.rejected, (state, action) => {
          state.deleteStatus = 'failed';
          state.deleteError = action.payload?.message || 'Error al eliminar elemento';
        })

      // ===== CUSTOM ACTION =====
        .addCase(customAction.pending, (state) => {
          state.customActionStatus = 'loading';
          state.customActionError = null;
        })
        .addCase(customAction.fulfilled, (state, action) => {
          state.customActionStatus = 'succeeded';
          // El resultado de acciones personalizadas se puede manejar según sea necesario
          // Por ahora, solo actualizamos el timestamp
          state.lastUpdate = new Date().toISOString();
        })
        .addCase(customAction.rejected, (state, action) => {
          state.customActionStatus = 'failed';
          state.customActionError = action.payload?.message || 'Error en acción personalizada';
        });
    }
  });

  // ===== SELECTORS =====
  const createSelectors = (state) => ({
    // Datos
    selectItems: (state) => state[modelName].items,
    selectCurrentItem: (state) => state[modelName].currentItem,
    selectTotal: (state) => state[modelName].total,
    selectPagination: (state) => ({
      page: state[modelName].page,
      pageSize: state[modelName].pageSize,
      total: state[modelName].total,
      totalPages: state[modelName].totalPages
    }),
    
    // Estados
    selectStatus: (state) => state[modelName].status,
    selectListStatus: (state) => state[modelName].listStatus,
    selectCreateStatus: (state) => state[modelName].createStatus,
    selectUpdateStatus: (state) => state[modelName].updateStatus,
    selectDeleteStatus: (state) => state[modelName].deleteStatus,
    selectFetchByIdStatus: (state) => state[modelName].fetchByIdStatus,
    selectCustomActionStatus: (state) => state[modelName].customActionStatus,
    
    // Errores
    selectError: (state) => state[modelName].error,
    selectListError: (state) => state[modelName].listError,
    selectCreateError: (state) => state[modelName].createError,
    selectUpdateError: (state) => state[modelName].updateError,
    selectDeleteError: (state) => state[modelName].deleteError,
    selectFetchByIdError: (state) => state[modelName].fetchByIdError,
    selectCustomActionError: (state) => state[modelName].customActionError,
    
    // Filtros y ordenamiento
    selectCurrentFilters: (state) => state[modelName].currentFilters,
    selectCurrentSort: (state) => state[modelName].currentSort,
    
    // Metadatos
    selectLastFetch: (state) => state[modelName].lastFetch,
    selectLastUpdate: (state) => state[modelName].lastUpdate,
    
    // Estados computados
    selectIsLoading: (state) => state[modelName].status === 'loading',
    selectIsListLoading: (state) => state[modelName].listStatus === 'loading',
    selectIsCreateLoading: (state) => state[modelName].createStatus === 'loading',
    selectIsUpdateLoading: (state) => state[modelName].updateStatus === 'loading',
    selectIsDeleteLoading: (state) => state[modelName].deleteStatus === 'loading',
    selectIsFetchByIdLoading: (state) => state[modelName].fetchByIdStatus === 'loading',
    selectIsCustomActionLoading: (state) => state[modelName].customActionStatus === 'loading',
    
    // Buscar item por ID
    selectItemById: (state, id) => state[modelName].items.find(item => item.id === id),
  });

  // ===== RETORNAR SLICE COMPLETO =====
  return {
    name: modelName,
    slice,
    reducer: slice.reducer,
    actions: {
      ...slice.actions,
      fetchList,
      fetchById,
      create,
      update,
      remove,
      customAction
    },
    selectors: createSelectors(),
    config
  };
};

export default createGenericSlice;
