// hooks/useAuthCheck.ts
// Hook para verificar si el usuario está autenticado consultando la API

import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuthErrorHandler } from './useAuthErrorHandler';

interface UseAuthCheckReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setIsAuthenticated: (value: boolean) => void;
}

export const useAuthCheck = (): UseAuthCheckReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar autenticación usando el endpoint corregido
      // El endpoint ahora busca en cookies automáticamente
      const response = await api.get('/usuario/verify');
      
      if (response.success) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      // Si hay error 401, el usuario no está autenticado
      if (err instanceof Error && err.message.includes('401')) {
        setIsAuthenticated(false);
      } else {
        // Otro tipo de error, mantener el estado actual
        console.error('Error verificando autenticación:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    await checkAuth();
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return { isAuthenticated, isLoading, error, refetch, setIsAuthenticated };
};

export default useAuthCheck;