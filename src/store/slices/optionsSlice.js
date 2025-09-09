/**
 * Options Slice - Usando sistema genérico
 * Este archivo mantiene compatibilidad con el código existente
 */

import { optionsActions, optionsSelectors, getModelReducer } from './index.js';

// ===== EXPORTS DE COMPATIBILIDAD =====

// Exportar acciones con nombres compatibles
export const fetchOptions = optionsActions.fetchList;
export const createOption = optionsActions.create;
export const updateOption = optionsActions.update;
export const removeOption = optionsActions.remove;

// Acciones personalizadas para options
export const activateOption = (id) => optionsActions.customAction({ 
  action: 'activate', 
  id, 
  method: 'POST' 
});
export const deactivateOption = (id) => optionsActions.customAction({ 
  action: 'deactivate', 
  id, 
  method: 'POST' 
});
export const moveOptionUp = (id) => optionsActions.customAction({ 
  action: 'moveUp', 
  id, 
  method: 'POST' 
});
export const moveOptionDown = (id) => optionsActions.customAction({ 
  action: 'moveDown', 
  id, 
  method: 'POST' 
});
export const duplicateOption = (id) => optionsActions.customAction({ 
  action: 'duplicate', 
  id, 
  method: 'POST' 
});

// Exportar todas las acciones genéricas
export const optionsGenericActions = optionsActions;
export const optionsGenericSelectors = optionsSelectors;

// Exportar el reducer desde el sistema genérico
const optionsReducer = getModelReducer('options');
export default optionsReducer;
