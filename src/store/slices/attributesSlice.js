/**
 * Attributes Slice - Usando sistema genérico
 * Este archivo mantiene compatibilidad con el código existente
 */

import { attributesActions, attributesSelectors, getModelReducer } from './index.js';

// ===== EXPORTS DE COMPATIBILIDAD =====

// Exportar acciones con nombres compatibles
export const fetchAttributes = attributesActions.fetchList;
export const createAttribute = attributesActions.create;
export const updateAttribute = attributesActions.update;
export const removeAttribute = attributesActions.remove;

// Acciones personalizadas para attributes
export const activateAttribute = (id) => attributesActions.customAction({ 
  action: 'activate', 
  id, 
  method: 'POST' 
});
export const deactivateAttribute = (id) => attributesActions.customAction({ 
  action: 'deactivate', 
  id, 
  method: 'POST' 
});
export const duplicateAttribute = (id) => attributesActions.customAction({ 
  action: 'duplicate', 
  id, 
  method: 'POST' 
});

// Exportar todas las acciones genéricas
export const attributesGenericActions = attributesActions;
export const attributesGenericSelectors = attributesSelectors;

// Exportar el reducer desde el sistema genérico
const attributesReducer = getModelReducer('attributes');
export default attributesReducer;
