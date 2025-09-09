/**
 * Debug y corrección del problema del token undefined
 */

const TOKEN_KEY = 'cpanel_admin_token';
const USER_KEY = 'cpanel_admin_user';

export const debugTokenIssue = () => {
  console.group('🔍 TOKEN DEBUG - Full Analysis');
  
  // 1. Verificar contenido actual
  const rawToken = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);
  
  console.log('1. Raw localStorage contents:');
  console.log('  - Token key exists:', !!rawToken);
  console.log('  - Token value:', rawToken);
  console.log('  - Token type:', typeof rawToken);
  console.log('  - Token length:', rawToken ? rawToken.length : 0);
  console.log('  - User key exists:', !!rawUser);
  
  // 2. Parse user data
  let user = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
    console.log('2. Parsed user data:', user);
  } catch (error) {
    console.error('2. Error parsing user data:', error);
  }
  
  // 3. Verificar si el problema está en la función debugToken
  const debugTokenFunction = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    return {
      tokenExists: !!token,
      tokenLength: token ? token.length : 0,
      tokenStart: token ? token.substring(0, 20) + '...' : 'No token',
      userExists: !!user,
      userInfo: user ? JSON.parse(user) : 'No user'
    };
  };
  
  console.log('3. debugToken function result:', debugTokenFunction());
  
  console.groupEnd();
  
  return {
    rawToken,
    rawUser,
    parsedUser: user,
    tokenExists: !!rawToken,
    tokenIsUndefined: rawToken === 'undefined'
  };
};

export const fixTokenIssue = async () => {
  console.group('🔧 TOKEN FIX - Attempting to resolve');
  
  const debug = debugTokenIssue();
  
  if (debug.tokenIsUndefined || !debug.tokenExists) {
    console.log('❌ Token is undefined or missing, need to re-login');
    
    // Opción 1: Limpiar todo y forzar re-login
    console.log('🧹 Clearing all auth data...');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('cpanel_admin_remember');
    
    console.log('✅ Auth data cleared. Please login again.');
    
    // Mostrar instrucciones
    console.log('📝 Next steps:');
    console.log('1. Go to login page');
    console.log('2. Enter valid credentials');
    console.log('3. Check console for login response');
    console.log('4. Verify token is saved correctly');
    
    console.groupEnd();
    return { success: false, action: 'NEED_LOGIN' };
  }
  
  console.log('✅ Token exists and looks valid');
  console.groupEnd();
  return { success: true, action: 'TOKEN_OK' };
};

export const testDirectAPICall = async () => {
  console.group('🧪 DIRECT API TEST');
  
  const token = localStorage.getItem(TOKEN_KEY);
  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  
  console.log('Request details:', {
    url: `${baseUrl}/categories`,
    token: token ? `${token.substring(0, 10)}...` : 'NO TOKEN',
    apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : 'NO API KEY'
  });
  
  if (!token || token === 'undefined') {
    console.error('❌ Cannot test - no valid token');
    console.groupEnd();
    return;
  }
  
  try {
    const response = await fetch(`${baseUrl}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Autorizacion': `Bearer ${token}`,
        'X-API-KEY': apiKey
      }
    });
    
    console.log('Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Data received:', data);
    } else {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
  
  console.groupEnd();
};

export const simulateLogin = async (username, password) => {
  console.group('🔐 SIMULATE LOGIN');
  
  const apiKey = import.meta.env.VITE_API_KEY;
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  
  console.log('Attempting login with:', { username, baseUrl });
  
  try {
    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-KEY': apiKey
      },
      body: JSON.stringify({
        user: username,
        password: password,
        device_name: 'debug_test'
      })
    });
    
    const data = await response.json();
    
    console.log('Login response:', {
      status: response.status,
      ok: response.ok,
      data
    });
    
    if (response.ok && data.status === 'success') {
      const user = data.data.user;
      const token = data.data.token || data.token;
      
      console.log('🎯 Extracted token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN FOUND');
      console.log('👤 User data:', user);
      
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          user: user.user,
          role: user.profile?.admin ? 'admin' : 'user',
          store_id: user.store?.id || 1,
          store_name: user.store?.name || 'Unknown Store',
          avatar: user.avatar || null,
          profile: user.profile,
          permissions: ['all', 'categories', 'products', 'orders', 'customers'],
          loginTime: new Date().toISOString()
        }));
        
        console.log('✅ Token and user saved to localStorage');
        console.log('🔄 Try accessing categories now');
      }
    } else {
      console.error('❌ Login failed:', data);
    }
    
  } catch (error) {
    console.error('❌ Login error:', error);
  }
  
  console.groupEnd();
};

// Exponer funciones globalmente para debug
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.tokenDebug = {
    debug: debugTokenIssue,
    fix: fixTokenIssue,
    test: testDirectAPICall,
    login: simulateLogin
  };
  console.log('🛠️ Token debug functions available:');
  console.log('  window.tokenDebug.debug() - Analyze token issue');
  console.log('  window.tokenDebug.fix() - Clean auth data');
  console.log('  window.tokenDebug.test() - Test API call directly');
  console.log('  window.tokenDebug.login(user, pass) - Simulate login');
}
