/**
 * Sistema de permisos con switch de activación/desactivación
 */

// Leer el switch de permisos desde las variables de entorno
const PERMISSIONS_ENABLED = import.meta.env.VITE_ENABLE_PERMISSIONS === '1' || 
                           import.meta.env.VITE_ENABLE_PERMISSIONS === 'true';

/**
 * Verificar si un usuario tiene un permiso específico
 * @param {Object} user - Usuario con permisos
 * @param {string|Array} requiredPermissions - Permiso(s) requerido(s)
 * @returns {boolean} Si el usuario tiene acceso
 */
export const hasPermission = (user, requiredPermissions) => {
  // Si los permisos están deshabilitados, permitir acceso a todos
  if (!PERMISSIONS_ENABLED) {
    console.log('🔓 Permissions disabled - allowing access to all users');
    return true;
  }

  // Si no hay usuario, denegar acceso
  if (!user) {
    console.log('🚫 No user found - denying access');
    return false;
  }

  // Si no tiene permisos definidos, denegar acceso
  if (!user.permissions || !Array.isArray(user.permissions)) {
    console.log('🚫 User has no permissions defined - denying access');
    return false;
  }

  // Normalizar permisos requeridos a array
  const required = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];

  // Si el usuario tiene 'all', permitir acceso
  if (user.permissions.includes('all')) {
    console.log('✅ User has "all" permission - allowing access');
    return true;
  }

  // Verificar si tiene alguno de los permisos requeridos
  const hasAccess = required.some(permission => 
    user.permissions.includes(permission)
  );

  console.log(`${hasAccess ? '✅' : '🚫'} Permission check:`, {
    required,
    userPermissions: user.permissions,
    hasAccess
  });

  return hasAccess;
};

/**
 * Hook para verificar permisos en componentes React
 * @param {string|Array} requiredPermissions - Permiso(s) requerido(s)
 * @param {Object} user - Usuario (opcional, se puede obtener de Redux)
 * @returns {boolean} Si el usuario tiene acceso
 */
export const usePermissions = (requiredPermissions, user = null) => {
  // Si no se pasa usuario, intentar obtenerlo desde Redux (se implementará según sea necesario)
  return hasPermission(user, requiredPermissions);
};

/**
 * Componente para mostrar contenido condicionalmente basado en permisos
 * @param {Object} props - Props del componente
 * @param {string|Array} props.requires - Permiso(s) requerido(s)
 * @param {Object} props.user - Usuario
 * @param {ReactNode} props.children - Contenido a mostrar si tiene permisos
 * @param {ReactNode} props.fallback - Contenido a mostrar si no tiene permisos
 */
export const PermissionGate = ({ requires, user, children, fallback = null }) => {
  const hasAccess = hasPermission(user, requires);
  
  return hasAccess ? children : fallback;
};

/**
 * Obtener el estado actual del switch de permisos
 * @returns {boolean} Si los permisos están habilitados
 */
export const arePermissionsEnabled = () => {
  return PERMISSIONS_ENABLED;
};

/**
 * Obtener información de debug sobre el sistema de permisos
 * @returns {Object} Información de debug
 */
export const getPermissionsDebugInfo = () => {
  return {
    enabled: PERMISSIONS_ENABLED,
    envVar: import.meta.env.VITE_ENABLE_PERMISSIONS,
    mode: PERMISSIONS_ENABLED ? 'RESTRICTED' : 'OPEN ACCESS'
  };
};

// Log del estado actual en desarrollo
if (import.meta.env.DEV) {
  console.log('🔐 Permissions System:', getPermissionsDebugInfo());
}

// Exponer funciones de debug globalmente en desarrollo
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.permissionsDebug = {
    info: getPermissionsDebugInfo,
    enabled: arePermissionsEnabled,
    check: hasPermission
  };
  console.log('🛠️ Permissions debug available: window.permissionsDebug');
}

export default {
  hasPermission,
  usePermissions,
  PermissionGate,
  arePermissionsEnabled,
  getPermissionsDebugInfo
};
