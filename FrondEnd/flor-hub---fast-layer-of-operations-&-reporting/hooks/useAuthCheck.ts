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
      // Intentar verificar el token con la API
      const response = await api.get('/usuario/verify');
      
      if (response.success) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      // Para la verificación inicial, simplemente marcar como no autenticado
      // sin mostrar errores específicos, porque el usuario aún no ha intentado login
      setIsAuthenticated(false);
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