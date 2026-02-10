// services/auth.ts
// Servicio de autenticación

import { api, ApiResponse } from './api';

interface LoginCredentials {
  user: {
    email: string;
    password: string;
  };
}

interface AuthData {
  token: string;
  user: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    exa: string;
    legajo: string;
    rol: string;
    permisos: string[];
  };
}

interface AuthResponse extends ApiResponse<AuthData> {}

// Función helper para obtener cookies
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// El backend maneja el token via cookies (httpOnly), estas funciones quedan para compatibilidad
// pero ya no se usan activamente
export const saveToken = (_token: string): void => {
  // No-op - el token se guarda automáticamente en cookies por el backend
};

// Obtener token de cookies
export const getToken = (): string | null => {
  return getCookie('token');
};

// Eliminar token (logout)
export const removeToken = (): void => {
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
};

// Verificar si hay token válido
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Login
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const credentials: LoginCredentials = {
    user: {
      email,
      password
    }
  };
  
  const response = await api.post<AuthData>('usuario/login', credentials);
  
  if (response.success && response.data?.token) {
    saveToken(response.data.token);
  }
  
  return response;
};

// Logout
export const logout = (): void => {
  removeToken();
  window.location.href = '/login';
};

// Verificar token (opcional - para validar en mount)
export const verifyToken = async (): Promise<boolean> => {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Intentar hacer una petición que requiera auth
    const response = await api.get('ventas?page=1&limit=1');
    return response.success;
  } catch (error) {
    removeToken();
    return false;
  }
};

export type { AuthData, AuthResponse, LoginCredentials };
