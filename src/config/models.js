/**
 * Configuración de modelos para el sistema genérico de API
 * Define todos los modelos disponibles y sus configuraciones específicas
 */

// Lista de modelos básicos disponibles en el sistema
export const MODELS = [
  'categories',
  'attributes',
  'options'
];

// Configuraciones específicas por modelo
export const MODEL_CONFIG = {

  categories: {
    name: 'categories',
    displayName: 'Categorías',
    endpoints: {
      list: '/categories',
      get: '/categories/:id',
      getById: '/categories/:id',
      create: '/categories',
      update: '/categories/:id',
      delete: '/categories/:id'
    },
    transformFields: {
      active: (value) => Boolean(value),
      visible: (value) => Boolean(value),
      position: (value) => parseInt(value) || 0,
      parent: (value) => value ? parseInt(value) : null
    },
    requiredFields: ['name'],
    defaultSort: { field: 'position', order: 'asc' },
    defaultPageSize: 50,
    customActions: [
      'activate',
      'deactivate',
      'moveUp',
      'moveDown',
      'duplicate'
    ]
  },

  attributes: {
    name: 'attributes',
    displayName: 'Atributos',
    endpoints: {
      list: '/attributes',
      get: '/attributes/:id',
      create: '/attributes',
      update: '/attributes/:id',
      delete: '/attributes/:id'
    },
    transformFields: {
      active: (value) => Boolean(value),
      visible: (value) => Boolean(value),
      level: (value) => parseInt(value) || 0,
      parent: (value) => value ? parseInt(value) : null,
      id_category: (value) => value ? parseInt(value) : null
    },
    requiredFields: ['name', 'utilities'],
    defaultSort: { field: 'name', order: 'asc' },
    defaultPageSize: 30,
    customActions: [
      'activate',
      'deactivate',
      'duplicate'
    ]
  },

  options: {
    name: 'options',
    displayName: 'Opciones',
    endpoints: {
      list: '/options',
      get: '/options/:id',
      create: '/options',
      update: '/options/:id',
      delete: '/options/:id'
    },
    transformFields: {
      active: (value) => Boolean(value),
      position: (value) => parseInt(value) || 0,
      id_category: (value) => value ? parseInt(value) : null
    },
    requiredFields: ['name', 'utilities'],
    defaultSort: { field: 'position', order: 'asc' },
    defaultPageSize: 25,
    customActions: [
      'activate',
      'deactivate',
      'moveUp',
      'moveDown',
      'duplicate'
    ]
  }
};

/**
 * Obtener configuración de un modelo específico
 * @param {string} modelName - Nombre del modelo
 * @returns {Object} Configuración del modelo
 */
export const getModelConfig = (modelName) => {
  return MODEL_CONFIG[modelName] || {
    name: modelName,
    displayName: modelName.charAt(0).toUpperCase() + modelName.slice(1),
    endpoints: {
      list: `/${modelName}`,
      get: `/${modelName}/:id`,
      create: `/${modelName}`,
      update: `/${modelName}/:id`,
      delete: `/${modelName}/:id`
    },
    transformFields: {},
    requiredFields: [],
    defaultSort: { field: 'created_at', order: 'desc' },
    defaultPageSize: 20,
    customActions: []
  };
};

/**
 * Aplicar transformaciones de campos según la configuración del modelo
 * @param {string} modelName - Nombre del modelo
 * @param {Object} data - Datos a transformar
 * @returns {Object} Datos transformados
 */
export const applyFieldTransformations = (modelName, data) => {
  const config = getModelConfig(modelName);
  const transformedData = { ...data };

  Object.keys(config.transformFields).forEach(field => {
    if (data[field] !== undefined) {
      try {
        transformedData[field] = config.transformFields[field](data[field]);
      } catch (error) {
        console.warn(`Error transforming field ${field} for model ${modelName}:`, error);
      }
    }
  });

  return transformedData;
};

/**
 * Validar campos requeridos de un modelo
 * @param {string} modelName - Nombre del modelo
 * @param {Object} data - Datos a validar
 * @returns {Object} Resultado de la validación
 */
export const validateRequiredFields = (modelName, data) => {
  const config = getModelConfig(modelName);
  const missingFields = [];

  config.requiredFields.forEach(field => {
    if (!data[field] || data[field] === '') {
      missingFields.push(field);
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
    message: missingFields.length > 0 
      ? `Campos requeridos faltantes: ${missingFields.join(', ')}`
      : 'Validación exitosa'
  };
};

/**
 * Obtener parámetros por defecto para listado
 * @param {string} modelName - Nombre del modelo
 * @returns {Object} Parámetros por defecto
 */
export const getDefaultListParams = (modelName) => {
  const config = getModelConfig(modelName);
  return {
    page: 1,
    pageSize: config.defaultPageSize,
    sort: config.defaultSort.field,
    order: config.defaultSort.order
  };
};

/**
 * Verificar si un modelo soporta una operación específica
 * @param {string} modelName - Nombre del modelo  
 * @param {string} operation - Operación (create, update, delete)
 * @returns {boolean} Si soporta la operación
 */
export const modelSupportsOperation = (modelName, operation) => {
  const config = getModelConfig(modelName);
  return config.endpoints[operation] !== null;
};

/**
 * Obtener acciones personalizadas disponibles para un modelo
 * @param {string} modelName - Nombre del modelo
 * @returns {Array} Lista de acciones personalizadas
 */
export const getModelCustomActions = (modelName) => {
  const config = getModelConfig(modelName);
  return config.customActions || [];
};

export default {
  MODELS,
  MODEL_CONFIG,
  getModelConfig,
  applyFieldTransformations,
  validateRequiredFields,
  getDefaultListParams,
  modelSupportsOperation,
  getModelCustomActions
};
