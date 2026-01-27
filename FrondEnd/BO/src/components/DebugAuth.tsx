// Debug page para verificar el flujo de autenticación
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth';
import { Button } from '../components/ui/button';

export const DebugAuth: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    console.log('🔍 DebugAuth: Estado actual:');
    console.log('  - isAuthenticated:', isAuthenticated);
    console.log('  - user:', user);
    console.log('  - localStorage token:', localStorage.getItem('auth_token'));
    console.log('  - config tokenKey:', import.meta.env.VITE_TOKEN_STORAGE_KEY);
  }, [isAuthenticated, user]);

  const checkAuthManually = () => {
    console.log('🔍 DebugAuth: Verificación manual de autenticación...');
    const isAuth = authService.isAuthenticated();
    console.log('  - authService.isAuthenticated():', isAuth);
    console.log('  - localStorage.getItem():', localStorage.getItem('auth_token'));
  };

  const clearToken = () => {
    console.log('🗑️ DebugAuth: Limpiando token...');
    localStorage.removeItem('auth_token');
    window.location.reload();
  };

  const setTestToken = () => {
    console.log('🔑 DebugAuth: Estableciendo token de prueba...');
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1IiwidCI6InRlcGUiLCJlbWFpbCI6InRlc3QEBleHBsLmNvbSIsIm5vbWUiOiJKb2UiLCJhcHBfaWQiOiJUb2F0IiwiaWF0IjoxNjE1MDk3ODksImV4cCI6MTYxMTAxNjM2OH0.faketoken';
    localStorage.setItem('auth_token', testToken);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
      <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Debug de Autenticación</h1>
        
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Estado Actual</h2>
            <div className="space-y-1 text-sm">
              <p><strong>isAuthenticated:</strong> {isAuthenticated ? '✅ Verdadero' : '❌ Falso'}</p>
              <p><strong>Usuario:</strong> {user ? user.email : '❌ No hay usuario'}</p>
              <p><strong>Token:</strong> {localStorage.getItem('auth_token') ? '✅ Presente' : '❌ Ausente'}</p>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Verificación Manual</h2>
            <p className="text-sm text-gray-600 mb-4">Verificar el estado de autenticación usando el servicio</p>
            <Button onClick={checkAuthManually} className="w-full">
              Verificar Autenticación
            </Button>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Pruebas</h2>
            <div className="grid grid-cols-1 gap-2">
              <Button onClick={clearToken} variant="outline" className="w-full">
                Limpiar Token
              </Button>
              <Button onClick={setTestToken} variant="outline" className="w-full">
                Establecer Token de Prueba
              </Button>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Acciones</h2>
            <div className="space-y-2">
              {isAuthenticated && (
                <Button onClick={logout} variant="destructive" className="w-full">
                  Cerrar Sesión
                </Button>
              )}
              <Button onClick={() => window.location.href = '/'} variant="outline" className="w-full">
                  Ir al Login
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Console Logs</h2>
          <p className="text-sm text-gray-600">
            Abre la consola del navegador (F12) para ver los logs de depuración.
            Los mensajes mostrarán el estado actual del flujo de autenticación.
          </p>
        </div>
      </div>
    </div>
  );
};