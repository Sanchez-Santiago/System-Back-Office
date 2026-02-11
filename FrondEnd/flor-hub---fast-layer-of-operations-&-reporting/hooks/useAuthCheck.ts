// hooks/useAuthCheck.ts
// Hook para verificar si el usuario está autenticado consultando la API

import { useState, useEffect, useCallback } from 'react';
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
  // console.log('🔍 [AUTH_CHECK] Estado actual:', { user: user ? 'SET' : 'NULL', isAuthenticated, isLoading });

  const checkAuth = useCallback(async () => {
    // MODO INSPECCION: Bypass de autenticación para pruebas de UI
    if (import.meta.env.VITE_APP_ENV === 'inspection') {
      console.log('🕵️ [INSPECTION MODE] Bypassing authentication');
      setIsAuthenticated(true);
      setUser({
        id: 'inspector-001',
        email: 'inspector@florhub.dev',
        nombre: 'Inspector',
        apellido: 'Visual',
        rol: 'ADMIN',
        legajo: 'DEV-001',
        exa: '001',
        permisos: ['ALL']
      });
      setIsLoading(false);
      return;
    }

    // console.log('🔍 [DEBUG] Iniciando verificación de autenticación');
    // console.log('🔍 [DEBUG] API_URL:', import.meta.env.VITE_API_URL);
    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar autenticación usando el endpoint corregido
      // El endpoint ahora busca en cookies automáticamente
      // console.log('🔍 [DEBUG] Haciendo petición a /usuario/verify');
      const response = await api.get('/usuario/verify');
      // console.log('🔍 [DEBUG] Respuesta recibida:', response);
      
      // Compatibilidad con ambas estructuras: response.payload o response.data
      const userData = response.payload || response.data;
      
      if (response.success && userData) {
        // console.log('🔍 [DEBUG] Usuario verificado exitosamente:', userData);
        setIsAuthenticated(true);
        setUser(userData as VerifiedUser);
      } else {
        // console.log('🔍 [DEBUG] Usuario no autenticado, response:', response);
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error('🔍 [DEBUG] Error en verificación:', err);
      
      // Si hay error 401, el usuario no está autenticado
      if (err instanceof Error && err.message.includes('401')) {
        setIsAuthenticated(false);
        setUser(null);
      } else {
        // Otro tipo de error, mantener el estado actual
        setIsAuthenticated(false);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = async () => {
    await checkAuth();
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { isAuthenticated, isLoading, error, user, refetch, setIsAuthenticated };
};

export default useAuthCheck;
