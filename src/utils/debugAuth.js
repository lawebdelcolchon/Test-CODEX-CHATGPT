/**
 * Utilidades de debugging para autenticación
 * Solo para desarrollo - eliminar en producción
 */

const TOKEN_KEY = 'cpanel_admin_token';
const USER_KEY = 'cpanel_admin_user';

// Función para establecer un token de prueba
export const setTestToken = () => {
  // Token de ejemplo (NO usar en producción)
  const testToken = 'test-jwt-token-for-debugging-only';
  
  const testUser = {
    id: 1,
    email: 'admin@test.com',
    name: 'Admin Test',
    user: 'admin',
    role: 'admin',
    store_id: 1,
    store_name: 'Test Store',
    avatar: null,
    permissions: ['all'],
    loginTime: new Date().toISOString(),
  };
  
  localStorage.setItem(TOKEN_KEY, testToken);
  localStorage.setItem(USER_KEY, JSON.stringify(testUser));
  
  console.log('🧪 Test token and user set:', {
    token: testToken,
    user: testUser
  });
  
  return { token: testToken, user: testUser };
};

// Función para limpiar datos de auth
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  console.log('🧹 Auth data cleared');
};

// Función para verificar estado actual
export const checkAuthState = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = localStorage.getItem(USER_KEY);
  
  console.log('🔍 Current Auth State:', {
    hasToken: !!token,
    token: token ? token.substring(0, 20) + '...' : 'No token',
    hasUser: !!user,
    user: user ? JSON.parse(user) : 'No user'
  });
  
  return { token, user };
};

// Función para test completo
export const runAuthTest = async () => {
  console.log('🚀 Running Auth Test...');
  
  // 1. Verificar estado inicial
  console.log('1. Initial state:');
  checkAuthState();
  
  // 2. Establecer token de prueba
  console.log('2. Setting test token:');
  setTestToken();
  
  // 3. Verificar nuevo estado
  console.log('3. New state:');
  checkAuthState();
  
  // 4. Intentar hacer una petición de prueba
  console.log('4. Testing API call...');
  try {
    const response = await fetch('https://decorlujo.com/server_api/api/categories', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Autorizacion': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
        'X-API-KEY': 'rEwqRtYuiopAsDfGhJkLzXcVbNmQwErT'
      }
    });
    
    console.log('📡 API Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Data received:', data);
    } else {
      console.warn('❌ API Error:', await response.text());
    }
  } catch (error) {
    console.error('💥 Network Error:', error);
  }
};

// Exponer funciones globalmente para debug en consola
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.debugAuth = {
    setTestToken,
    clearAuth,
    checkAuthState,
    runAuthTest
  };
  console.log('🛠️ Debug functions available: window.debugAuth');
}
