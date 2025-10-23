// src/utils/formatters.js

// Import existing formatters if they exist
let formatCurrencyUtil = null;
let formatDateUtil = null;

try {
  formatCurrencyUtil = require('./formatCurrency.js').default || require('./formatCurrency.js');
} catch (e) {
  // If formatCurrency doesn't exist, create a default implementation
}

try {
  formatDateUtil = require('./formatDate.js').default || require('./formatDate.js');
} catch (e) {
  // If formatDate doesn't exist, create a default implementation
}

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  if (formatCurrencyUtil) {
    return formatCurrencyUtil(amount, currency);
  }
  
  // Default implementation
  const numericAmount = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

// Format date
export const formatDate = (date, options = {}) => {
  if (formatDateUtil) {
    return formatDateUtil(date, options);
  }
  
  // Default implementation
  if (!date) return '-';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '-';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return dateObj.toLocaleDateString('es-ES', defaultOptions);
};

// Format date with time
export const formatDateTime = (date, options = {}) => {
  if (!date) return '-';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '-';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  
  return dateObj.toLocaleDateString('es-ES', defaultOptions);
};

// Format number with commas
export const formatNumber = (number, decimals = 0) => {
  const numericValue = parseFloat(number) || 0;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numericValue);
};

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  const numericValue = parseFloat(value) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numericValue / 100);
};

// Format file size
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Format weight
export const formatWeight = (weight, unit = 'kg') => {
  if (!weight && weight !== 0) return '-';
  return `${parseFloat(weight).toFixed(2)} ${unit}`;
};

// Format dimensions
export const formatDimensions = (dimensions) => {
  if (!dimensions) return '-';
  
  if (typeof dimensions === 'string') {
    return dimensions;
  }
  
  if (typeof dimensions === 'object') {
    const { length, width, height, unit = 'cm' } = dimensions;
    if (length && width && height) {
      return `${length} × ${width} × ${height} ${unit}`;
    }
  }
  
  return '-';
};

// Format SKU
export const formatSKU = (sku) => {
  if (!sku) return '-';
  return sku.toString().toUpperCase();
};

// Format status
export const formatStatus = (status) => {
  if (!status) return 'Sin estado';
  
  const statusMap = {
    'published': 'Publicado',
    'draft': 'Borrador',
    'inactive': 'Inactivo',
    'out_of_stock': 'Sin Stock',
    'active': 'Activo',
    'pending': 'Pendiente',
    'approved': 'Aprobado',
    'rejected': 'Rechazado'
  };
  
  return statusMap[status] || status;
};

export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercentage,
  formatFileSize,
  formatWeight,
  formatDimensions,
  formatSKU,
  formatStatus
};