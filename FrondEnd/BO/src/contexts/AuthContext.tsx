// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth';

interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app start
    const checkAuth = () => {
      const isAuth = authService.isAuthenticated();
      if (isAuth) {
        // Get stored user data from localStorage or set null for re-authentication
        const storedUser = localStorage.getItem('user_data');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            setUser(null);
          }
        } else {
          setUser(null); // Will trigger re-authentication
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

const login = async (email: string, password: string) => {
    console.log('🔑 AuthContext: Iniciando login con email:', email);
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      console.log('🔑 AuthContext: Respuesta del servicio:', response);

      if (response.success && response.user) {
        console.log('✅ AuthContext: Login exitoso, guardando usuario:', response.user);
        console.log('🔑 AuthContext: Token guardado en localStorage:', localStorage.getItem('auth_token'));
        
        // Store user data in localStorage for persistence
        localStorage.setItem('user_data', JSON.stringify(response.user));
        setUser(response.user);
        console.log('✅ AuthContext: Usuario guardado en el estado y localStorage');
        return { success: true };
      } else {
        console.log('❌ AuthContext: Login fallido:', response.message);
        return { success: false, message: response.message || 'Error de autenticación' };
      }
    } catch (error) {
      console.log('❌ AuthContext: Error en login:', error);
      return { success: false, message: 'Error de conexión' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('user_data');
    setUser(null);
  };

const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  // Debug logging para estado
  useEffect(() => {
    console.log('🔑 AuthContext Debug:');
    console.log('  - isAuthenticated:', !!user);
    console.log('  - user:', user);
    console.log('  - isLoading:', isLoading);
    console.log('  - token en localStorage:', localStorage.getItem('auth_token'));
  }, [user, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};