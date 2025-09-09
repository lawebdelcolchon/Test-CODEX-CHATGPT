/**
 * Categories Slice - Usando sistema genérico
 * Este archivo mantiene compatibilidad con el código existente
 */

import { categoriesActions, categoriesSelectors, getModelReducer } from './index.js';

// ===== EXPORTS DE COMPATIBILIDAD =====

// Exportar acciones con nombres compatibles
export const fetchCategories = categoriesActions.fetchList;
export const createCategory = categoriesActions.create;
export const updateCategory = categoriesActions.update;
export const removeCategory = categoriesActions.remove;

// Acciones personalizadas para categories
export const activateCategory = (id) => categoriesActions.customAction({ 
  action: 'activate', 
  id, 
  method: 'POST' 
});
export const deactivateCategory = (id) => categoriesActions.customAction({ 
  action: 'deactivate', 
  id, 
  method: 'POST' 
});
export const moveCategoryUp = (id) => categoriesActions.customAction({ 
  action: 'moveUp', 
  id, 
  method: 'POST' 
});
export const moveCategoryDown = (id) => categoriesActions.customAction({ 
  action: 'moveDown', 
  id, 
  method: 'POST' 
});
export const duplicateCategory = (id) => categoriesActions.customAction({ 
  action: 'duplicate', 
  id, 
  method: 'POST' 
});

// Exportar todas las acciones genéricas
export const categoriesGenericActions = categoriesActions;
export const categoriesGenericSelectors = categoriesSelectors;

// Exportar el reducer desde el sistema genérico
const categoriesReducer = getModelReducer('categories');
export default categoriesReducer;
