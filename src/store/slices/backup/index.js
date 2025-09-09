import { createGenericSlice } from './createGenericSlice.js';
import { MODELS } from '../../config/models.js';

/**
 * Auto-generación de todos los slices usando el factory
 * Este archivo genera automáticamente todos los slices basados en la lista de modelos
 */

// Generar todos los slices automáticamente
const generatedSlices = {};
const allActions = {};
const allSelectors = {};
const allReducers = {};

console.log('🏭 Generating slices for models:', MODELS);

// Crear un slice para cada modelo
MODELS.forEach(modelName => {
  console.log(`🔧 Creating slice for model: ${modelName}`);
  
  const generatedSlice = createGenericSlice(modelName);
  
  // Almacenar el slice completo
  generatedSlices[modelName] = generatedSlice;
  
  // Extraer y organizar actions
  allActions[modelName] = generatedSlice.actions;
  
  // Extraer y organizar selectors
  allSelectors[modelName] = generatedSlice.selectors;
  
  // Extraer reducer para configuración del store
  allReducers[modelName] = generatedSlice.reducer;
  
  console.log(`✅ Slice created for ${modelName}:`, {
    actions: Object.keys(generatedSlice.actions).length,
    selectors: Object.keys(generatedSlice.selectors).length,
    hasReducer: !!generatedSlice.reducer
  });
});

console.log('🎉 All slices generated successfully:', {
  totalModels: MODELS.length,
  generatedSlices: Object.keys(generatedSlices).length,
  totalActions: Object.values(allActions).reduce((total, actions) => total + Object.keys(actions).length, 0),
  totalSelectors: Object.values(allSelectors).reduce((total, selectors) => total + Object.keys(selectors).length, 0)
});

// ===== EXPORTS PRINCIPALES =====

// Exportar reducers para configuración del store
export const reducers = allReducers;

// Exportar todas las acciones organizadas por modelo
export const actions = allActions;

// Exportar todos los selectors organizados por modelo
export const selectors = allSelectors;

// Exportar slices completos (para casos especiales)
export const slices = generatedSlices;

// ===== EXPORTS DE CONVENIENCIA =====

// Acciones específicas por modelo (compatibilidad con código existente)
export const productsActions = allActions.products;
export const ordersActions = allActions.orders;
export const customersActions = allActions.customers;
export const categoriesActions = allActions.categories;
export const collectionsActions = allActions.collections;
export const suppliersActions = allActions.suppliers;
export const reservesActions = allActions.reserves;
export const inputsActions = allActions.inputs;
export const purchaseOrdersActions = allActions.purchaseOrders;
export const campaignsActions = allActions.campaigns;

// Selectors específicos por modelo
export const productsSelectors = allSelectors.products;
export const ordersSelectors = allSelectors.orders;
export const customersSelectors = allSelectors.customers;
export const categoriesSelectors = allSelectors.categories;
export const collectionsSelectors = allSelectors.collections;
export const suppliersSelectors = allSelectors.suppliers;
export const reservesSelectors = allSelectors.reserves;
export const inputsSelectors = allSelectors.inputs;
export const purchaseOrdersSelectors = allSelectors.purchaseOrders;
export const campaignsSelectors = allSelectors.campaigns;

// ===== UTILIDADES =====

/**
 * Obtener acciones de un modelo específico
 * @param {string} modelName - Nombre del modelo
 * @returns {Object} Acciones del modelo
 */
export const getModelActions = (modelName) => {
  return allActions[modelName] || {};
};

/**
 * Obtener selectors de un modelo específico
 * @param {string} modelName - Nombre del modelo  
 * @returns {Object} Selectors del modelo
 */
export const getModelSelectors = (modelName) => {
  return allSelectors[modelName] || {};
};

/**
 * Obtener reducer de un modelo específico
 * @param {string} modelName - Nombre del modelo
 * @returns {Function} Reducer del modelo
 */
export const getModelReducer = (modelName) => {
  return allReducers[modelName];
};

/**
 * Verificar si un modelo tiene slice generado
 * @param {string} modelName - Nombre del modelo
 * @returns {boolean} Si existe el slice
 */
export const hasModelSlice = (modelName) => {
  return !!generatedSlices[modelName];
};

/**
 * Obtener información de todos los modelos disponibles
 * @returns {Array} Lista de modelos con su información
 */
export const getAvailableModels = () => {
  return MODELS.map(modelName => ({
    name: modelName,
    displayName: generatedSlices[modelName]?.config?.displayName || modelName,
    hasSlice: !!generatedSlices[modelName],
    actionsCount: Object.keys(allActions[modelName] || {}).length,
    selectorsCount: Object.keys(allSelectors[modelName] || {}).length
  }));
};

/**
 * Hook helper para obtener todas las acciones de un modelo
 * (Para usar con useDispatch)
 */
export const createModelHooks = (modelName) => {
  const actions = getModelActions(modelName);
  const selectors = getModelSelectors(modelName);
  
  return {
    actions,
    selectors,
    // Helper para crear dispatch functions
    createDispatchActions: (dispatch) => {
      const dispatchActions = {};
      Object.keys(actions).forEach(actionName => {
        if (typeof actions[actionName] === 'function') {
          dispatchActions[actionName] = (...args) => dispatch(actions[actionName](...args));
        }
      });
      return dispatchActions;
    }
  };
};

/**
 * Debug helper: mostrar información de todos los slices
 */
export const debugSlicesInfo = () => {
  console.group('🔍 Generated Slices Debug Info');
  
  MODELS.forEach(modelName => {
    const slice = generatedSlices[modelName];
    if (slice) {
      console.group(`📦 ${modelName}:`);
      console.log('Config:', slice.config);
      console.log('Actions:', Object.keys(slice.actions));
      console.log('Selectors:', Object.keys(slice.selectors));
      console.groupEnd();
    }
  });
  
  console.log('📊 Summary:', {
    totalModels: MODELS.length,
    generatedSlices: Object.keys(generatedSlices).length,
    totalActions: Object.values(allActions).reduce((total, actions) => total + Object.keys(actions).length, 0),
    totalSelectors: Object.values(allSelectors).reduce((total, selectors) => total + Object.keys(selectors).length, 0)
  });
  
  console.groupEnd();
};

// Ejecutar debug en desarrollo
if (import.meta.env.DEV) {
  debugSlicesInfo();
}

// ===== DEFAULT EXPORT =====
export default {
  reducers,
  actions,
  selectors,
  slices,
  getModelActions,
  getModelSelectors,
  getModelReducer,
  hasModelSlice,
  getAvailableModels,
  createModelHooks,
  debugSlicesInfo
};
