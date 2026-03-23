// hooks/useAuthCheck.ts
// Hook simplificado para verificación de autenticación

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { tokenStorage } from '../services/tokenStorage';
import { getMockUserByEmail, MOCK_USERS } from '../services/mockUsers';

export interface VerifiedUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  permisos: string[];
  legajo: string;
  exa: string;
  celula: number;
  estado: string;
  pais_venta: string | null;
}

interface UseAuthCheckReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: VerifiedUser | null;
  refetch: () => Promise<void>;
  setIsAuthenticated: (value: boolean) => void;
}

export const useAuthCheck = (): UseAuthCheckReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<VerifiedUser | null>(null);
  const isVerifying = useRef(false);

  const checkAuth = useCallback(async () => {
    if (isVerifying.current) return;
    isVerifying.current = true;

    try {
      // --- BYPASS PARA MODO INSPECCIÓN ---
      const isInspectionMode = import.meta.env.VITE_INSPECTION_MODE === 'true' || localStorage.getItem('inspectionMode') === 'true';
      if (isInspectionMode) {
        const savedEmail = localStorage.getItem('mockUserEmail') || 'superadmin@florhub.com';
        const mockUser = getMockUserByEmail(savedEmail) || MOCK_USERS[0];
        
        setUser(mockUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }
      // ------------------------------------

      // Verificar si hay token en sessionStorage primero
      if (!tokenStorage.hasToken()) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      const verify1 = await api.get<VerifiedUser>('/usuario/verify');

      if (verify1.success && verify1.payload) {
        setUser(verify1.payload);
        setIsAuthenticated(true);
        return;
      }

      const refresh = await api.post<{ token?: string }>('/usuario/refresh', {});

      if (refresh.success) {
        // Guardar nuevo token si se devuelve
        const newToken = (refresh as any).token || refresh.data?.token || refresh.payload?.token;
        if (newToken) {
          tokenStorage.setToken(newToken);
        }

        const verify2 = await api.get<VerifiedUser>('/usuario/verify');

        if (verify2.success && verify2.payload) {
          setUser(verify2.payload);
          setIsAuthenticated(true);
          return;
        }
      }

      // Si todo falla, limpiar token y estado
      tokenStorage.removeToken();
      setIsAuthenticated(false);
      setUser(null);
    } catch (err) {
      tokenStorage.removeToken();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      isVerifying.current = false;
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { isAuthenticated, isLoading, user, refetch, setIsAuthenticated };
};

export default useAuthCheck;
