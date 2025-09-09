/**
 * Script temporal para actualizar permisos del usuario
 * Solo para desarrollo - eliminar en producción
 */

const USER_KEY = 'cpanel_admin_user';

export const updateUserPermissions = () => {
  const userStr = localStorage.getItem(USER_KEY);
  
  if (!userStr) {
    console.warn('❌ No user found in localStorage');
    return false;
  }
  
  try {
    const user = JSON.parse(userStr);
    
    console.log('🔍 Current user permissions:', user.permissions);
    
    // Agregar categories a los permisos
    if (!user.permissions.includes('categories')) {
      user.permissions.push('categories');
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      console.log('✅ Updated user permissions:', user.permissions);
      console.log('🔄 Refresh page to see changes');
      
      return true;
    } else {
      console.log('✅ User already has categories permission');
      return true;
    }
  } catch (error) {
    console.error('❌ Error updating permissions:', error);
    return false;
  }
};

// Función para forzar actualización de permisos y recargar
export const forceUpdatePermissions = () => {
  const updated = updateUserPermissions();
  if (updated) {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
};

// Exponer globalmente para debug
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.updatePermissions = forceUpdatePermissions;
  console.log('🛠️ Run window.updatePermissions() to add categories permission');
}
