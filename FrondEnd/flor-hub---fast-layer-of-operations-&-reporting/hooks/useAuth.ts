// hooks/useAuth.ts
// Hook para manejar autenticación

import { useState, useCallback } from 'react';
import { login, logout, getToken, isAuthenticated, AuthData } from '../services/auth';

interface UseAuthReturn {
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  user: AuthData['user'] | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<AuthData['user'] | null>(null);
  const [loggedIn, setLoggedIn] = useState(() => isAuthenticated());

  const handleLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await login(email, password);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setLoggedIn(true);
        return true;
      } else {
        setError(response.message || 'Error de autenticación');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setUser(null);
    setLoggedIn(false);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoggedIn: loggedIn,
    isLoading,
    error,
    user,
    login: handleLogin,
    logout: handleLogout,
    clearError,
  };
};

export default useAuth;
