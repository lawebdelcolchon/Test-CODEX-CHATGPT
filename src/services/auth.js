const STORAGE_KEY = 'cpanel_admin_user';
const REMEMBER_ME_KEY = 'cpanel_admin_remember';

// Usuarios mock para pruebas
const MOCK_USERS = [
  {
    id: 1,
    email: 'admin@cpanel.com',
    password: 'admin123',
    name: 'Jorge Pirela',
    role: 'admin',
    avatar: null,
    permissions: ['all']
  },
  {
    id: 2,
    email: 'manager@cpanel.com',
    password: 'manager123',
    name: 'María García',
    role: 'manager',
    avatar: null,
    permissions: ['products', 'orders', 'customers', 'inventory']
  },
  {
    id: 3,
    email: 'user@cpanel.com',
    password: 'user123',
    name: 'Carlos López',
    role: 'user',
    avatar: null,
    permissions: ['products', 'orders']
  }
];

// Simular delay de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const login = async (email, password, rememberMe = false) => {
  await delay(800); // Simular llamada a API
  
  const user = MOCK_USERS.find(u => u.email === email && u.password === password);
  
  if (user) {
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      permissions: user.permissions,
      loginTime: new Date().toISOString()
    };
    
    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    
    // Si "Recordarme" está marcado, guardar en una key especial
    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
    
    return { success: true, user: userData };
  }
  
  return { 
    success: false, 
    error: 'Credenciales inválidas. Intenta con admin@cpanel.com / admin123' 
  };
};

export const logout = async () => {
  await delay(300);
  
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
  
  return { success: true };
};

export const getUser = () => {
  try {
    const user = localStorage.getItem(STORAGE_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const isAuthenticated = () => {
  return !!getUser();
};

export const isRemembered = () => {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
};

export const hasPermission = (permission) => {
  const user = getUser();
  if (!user) return false;
  
  return user.permissions.includes('all') || user.permissions.includes(permission);
};

export const forgotPassword = async (email) => {
  await delay(1000);
  
  const user = MOCK_USERS.find(u => u.email === email);
  
  if (user) {
    // En una aplicación real, aquí se enviaría un email
    console.log(`Password reset link sent to ${email}`);
    return { 
      success: true, 
      message: 'Se ha enviado un enlace de recuperación a tu correo electrónico' 
    };
  }
  
  return {
    success: false,
    error: 'No se encontró una cuenta asociada a este correo electrónico'
  };
};

export const updateProfile = async (userData) => {
  await delay(500);
  
  const currentUser = getUser();
  if (!currentUser) {
    return { success: false, error: 'Usuario no autenticado' };
  }
  
  const updatedUser = {
    ...currentUser,
    ...userData,
    id: currentUser.id, // No permitir cambio de ID
    role: currentUser.role, // No permitir cambio de rol
    permissions: currentUser.permissions // No permitir cambio de permisos
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
  
  return { success: true, user: updatedUser };
};

export const changePassword = async (currentPassword, newPassword) => {
  await delay(500);
  
  const currentUser = getUser();
  if (!currentUser) {
    return { success: false, error: 'Usuario no autenticado' };
  }
  
  // Verificar contraseña actual (en una app real esto se haría en el backend)
  const dbUser = MOCK_USERS.find(u => u.id === currentUser.id);
  if (!dbUser || dbUser.password !== currentPassword) {
    return { success: false, error: 'La contraseña actual es incorrecta' };
  }
  
  // En una aplicación real, esto se actualizaría en la base de datos
  console.log(`Password changed for user ${currentUser.email}`);
  
  return { success: true, message: 'Contraseña actualizada exitosamente' };
};

// Función para limpiar la sesión si está expirada o corrupta
export const validateSession = () => {
  const user = getUser();
  if (!user) return false;
  
  // Verificar si la sesión no es muy antigua (opcional)
  const loginTime = new Date(user.loginTime);
  const now = new Date();
  const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);
  
  // Si no está marcado "recordarme" y han pasado más de 8 horas, cerrar sesión
  if (!isRemembered() && hoursSinceLogin > 8) {
    logout();
    return false;
  }
  
  // Si está marcado "recordarme" pero han pasado más de 30 días, cerrar sesión
  if (isRemembered() && hoursSinceLogin > (30 * 24)) {
    logout();
    return false;
  }
  
  return true;
};

// Función legacy para compatibilidad
export const currentUser = getUser;
