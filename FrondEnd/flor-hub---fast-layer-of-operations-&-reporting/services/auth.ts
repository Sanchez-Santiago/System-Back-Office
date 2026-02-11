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
  // El token ya no viene en el body, está en la cookie httpOnly
}

// Respuesta del login ahora devuelve user directamente, no dentro de data
interface AuthResponse {
  success: boolean;
  user?: AuthData['user'];
  message?: string;
}

/**
 * @deprecated Las cookies httpOnly no son accesibles desde JavaScript.
 * El backend maneja automáticamente las cookies. No usar en nuevo código.
 */
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

/**
 * @deprecated El backend maneja el token via cookies httpOnly automáticamente.
 * Esta función no tiene efecto. No usar en nuevo código.
 */
export const saveToken = (_token: string): void => {
  // No-op - el token se guarda automáticamente en cookies por el backend
};

/**
 * @deprecated Las cookies httpOnly no son accesibles desde JavaScript.
 * Siempre retornará null. Usar useAuthCheck() para verificar autenticación.
 */
export const getToken = (): string | null => {
  return getCookie('token');
};

/**
 * @deprecated El backend maneja la eliminación de cookies.
 * Usar el endpoint /usuario/logout en su lugar.
 */
export const removeToken = (): void => {
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
};

/**
 * @deprecated Las cookies httpOnly no son accesibles desde JavaScript.
 * Siempre retornará false. Usar useAuthCheck() en su lugar.
 */
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
  
  const response = await api.post<AuthData>('/usuario/login', credentials);
  
  // El token se guarda automáticamente en cookie httpOnly por el backend
  // No necesitamos hacer nada adicional aquí
  
  return response;
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    // Llamar al endpoint de logout del backend para eliminar la cookie
    await api.post('/usuario/logout', {});
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  } finally {
    // Redirigir a login independientemente del resultado
    window.location.href = '/login';
  }
};

/**
 * @deprecated Usar useAuthCheck() en su lugar.
 * Esta función intenta leer cookies httpNoOnly que no son accesibles.
 */
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
