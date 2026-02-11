// hooks/useAuth.ts
// Hook para manejar autenticación

import { useState, useCallback } from 'react';
import { login, logout } from '../services/auth';
import { VerifiedUser } from './useAuthCheck';

interface UseAuthReturn {
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  user: VerifiedUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  syncUser: (user: VerifiedUser | null) => void;
}

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<VerifiedUser | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await login(email, password);
      
      if (response.success && response.user) {
        console.log('🔍 [LOGIN] Login exitoso, estableciendo usuario:', response.user);
        setUser(response.user as VerifiedUser);
        setLoggedIn(true);
        console.log('🔍 [LOGIN] Estados de login establecidos');
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

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
    setLoggedIn(false);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const syncUser = useCallback((userData: VerifiedUser | null) => {
    console.log('🔍 [SYNC] syncUser llamado con:', userData);
    console.log('🔍 [SYNC] Estado actual antes de setUser:', { user, loggedIn });
    setUser(userData);
    setLoggedIn(!!userData);
    console.log('🔍 [SYNC] Estados actualizados - user:', userData, 'loggedIn:', !!userData);
    console.log('🔍 [SYNC] Después de setUser, user debería ser:', userData);
  }, [user, loggedIn]); // Añadir dependencias para tener acceso a los valores actuales

  const returnValue = {
    isLoggedIn: loggedIn,
    isLoading,
    error,
    user,
    login: handleLogin,
    logout: handleLogout,
    clearError,
    syncUser,
  };
  
  console.log('🔍 [USE_AUTH] Retornando:', {
    isLoggedIn: loggedIn,
    user: user ? 'USER_DATA' : 'NULL',
    userId: user?.id,
    userEmail: user?.email
  });
  
  return returnValue;
};

export default useAuth;
