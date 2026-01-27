// src/utils/authDiagnostics.ts
// Script completo para diagnosticar problemas de autenticación

export const runAuthDiagnostics = () => {
  console.log('🔍 Iniciando diagnóstico completo de autenticación...\n');

  // 1. Verificar variables de entorno
  console.log('🌍 1. Variables de Entorno:');
  console.log('  - VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('  - VITE_APP_NAME:', import.meta.env.VITE_APP_NAME);
  console.log('  - VITE_TOKEN_STORAGE_KEY:', import.meta.env.VITE_TOKEN_STORAGE_KEY);
  console.log('  - VITE_DEBUG_MODE:', import.meta.env.VITE_DEBUG_MODE);

  // 2. Verificar localStorage
  console.log('\n💾 2. LocalStorage:');
  console.log('  - auth_token:', localStorage.getItem('auth_token'));
  console.log('  - Claves disponibles:', Object.keys(localStorage));
  
  // 3. Verificar configuración
  try {
    const envConfig = require('../config/environment.ts').envConfig;
    console.log('\n⚙️ 3. Configuración del Sistema:');
    console.log('  - api.baseUrl:', envConfig.api.baseUrl);
    console.log('  - auth.tokenKey:', envConfig.auth.tokenKey);
    console.log('  - app.isDevelopment:', envConfig.app.isDevelopment);
    console.log('  - app.debugMode:', envConfig.app.debugMode);
  } catch (error) {
    console.log('\n❌ Error al cargar configuración:', error);
  }

  // 4. Verificar estado actual del contexto
  try {
    // Importar dinámicamente para evitar errores
    const { useAuth } = require('../contexts/AuthContext');
    console.log('\n🎭 4. Estado del Contexto:');
    console.log('  - useAuth disponible: ✅');
  } catch (error) {
    console.log('\n❌ Error al importar useAuth:', error);
  }

  // 5. Verificar servicios
  try {
    const { authService } = require('../services/auth');
    console.log('\n🔧 5. Servicios de Autenticación:');
    console.log('  - authService disponible: ✅');
    console.log('  - authService.isAuthenticated():', authService.isAuthenticated());
  } catch (error) {
    console.log('\n❌ Error al importar authService:', error);
  }

  // 6. Verificar validación con esquemas
  try {
    const { loginSchema } = require('../schemas');
    console.log('\n🛡️ 6. Validación con Zod:');
    console.log('  - loginSchema disponible: ✅');
    
    // Test de validación
    const validLogin = loginSchema.safeParse({
      user: {
        email: 'test@example.com',
        password: 'TestPassword123'
      }
    });
    console.log('  - loginSchema test:', validLogin.success ? '✅' : '❌');
  } catch (error) {
    console.log('\n❌ Error al importar esquemas:', error);
  }

  // 7. Verificar hooks
  try {
    const { useAuthForm } = require('../hooks/useAuthForm');
    console.log('\n🪝 7. Hooks Personalizados:');
    console.log('  - useAuthForm disponible: ✅');
  } catch (error) {
    console.log('\n❌ Error al importar hooks:', error);
  }

  console.log('\n📋 Diagnóstico completado. Revisa los logs arriba para identificar problemas.');
  console.log('🎯 Si todo parece correcto pero el login no funciona, el problema podría estar en:');
  console.log('   - Lógica de redirección después del login');
  console.log('   - Estado del componente principal');
  console.log('   - Problemas de sincronización asíncrona');
  console.log('   - Errores en la validación del formulario');
};

export default runAuthDiagnostics;