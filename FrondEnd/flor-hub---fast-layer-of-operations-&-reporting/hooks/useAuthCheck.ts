// hooks/useAuthCheck.ts
// Hook para verificar si el usuario está autenticado consultando la API

import { useState, useEffect } from 'react';
import { api } from '../services/api';

// Interfaz para el usuario verificado (datos del payload de /usuario/verify)
export interface VerifiedUser {
  id: string;
  email: string;
  rol: string;
  permisos: string[];
  legajo: string;
  exa: string;
  nombre: string;
  apellido: string;
}

interface UseAuthCheckReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: VerifiedUser | null;
  refetch: () => Promise<void>;
  setIsAuthenticated: (value: boolean) => void;
}

export const useAuthCheck = (): UseAuthCheckReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<VerifiedUser | null>(null);

  // Debug para cambios en el estado del usuario
  console.log('🔍 [AUTH_CHECK] Estado actual:', { user: user ? 'SET' : 'NULL', isAuthenticated, isLoading });

  const checkAuth = async () => {
    console.log('🔍 [DEBUG] Iniciando verificación de autenticación');
    console.log('🔍 [DEBUG] API_URL:', import.meta.env.VITE_API_URL);
    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar autenticación usando el endpoint corregido
      // El endpoint ahora busca en cookies automáticamente
      console.log('🔍 [DEBUG] Haciendo petición a /usuario/verify');
      const response = await api.get('/usuario/verify');
      console.log('🔍 [DEBUG] Respuesta recibida:', response);
      
      // Compatibilidad con ambas estructuras: response.payload o response.data
       // Compatibilidad con ambas estructuras: response.payload o response.data
      const userData = response.payload || response.data;
      
      if (response.success && userData) {
        console.log('🔍 [DEBUG] Usuario verificado exitosamente:', userData);
        console.log('🔍 [DEBUG] Estableciendo estados - isAuthenticated: true, user:', userData);
        setIsAuthenticated(true);
        console.log('🔍 [DEBUG] Antes de setUser - usuario actual:', user);
        setUser(userData as VerifiedUser);
        console.log('🔍 [DEBUG] setUser llamado con:', userData);
        console.log('🔍 [DEBUG] Después de setUser - usuario debería ser:', userData);
      } else {
        console.log('🔍 [DEBUG] Usuario no autenticado, response:', response);
        console.log('🔍 [DEBUG] Estableciendo estados - isAuthenticated: false, user: null');
        setIsAuthenticated(false);
        setUser(null);
        console.log('🔍 [DEBUG] Estados no autenticado establecidos');
      }
    } catch (err) {
      console.error('🔍 [DEBUG] Error en verificación:', err);
      console.error('🔍 [DEBUG] Error details:', err instanceof Error ? err.message : err);
      
      // Si hay error 401, el usuario no está autenticado
      if (err instanceof Error && err.message.includes('401')) {
        console.log('🔍 [DEBUG] Error 401 - No autenticado');
        setIsAuthenticated(false);
        setUser(null);
      } else {
        // Otro tipo de error, mantener el estado actual
        setIsAuthenticated(false);
        setUser(null);
      }
    } finally {
      console.log('🔍 [DEBUG] Verificación finalizada, isLoading -> false');
      console.log('🔍 [DEBUG] Estado final - user:', user, 'isAuthenticated:', isAuthenticated);
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    await checkAuth();
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const returnValue = { isAuthenticated, isLoading, error, user, refetch, setIsAuthenticated };
  
  console.log('🔍 [USE_AUTH_CHECK] Retornando:', {
    isAuthenticated,
    isLoading,
    user: user ? 'USER_DATA' : 'NULL',
    userId: user?.id,
    userEmail: user?.email
  });
  
  return returnValue;
};

export default useAuthCheck;
