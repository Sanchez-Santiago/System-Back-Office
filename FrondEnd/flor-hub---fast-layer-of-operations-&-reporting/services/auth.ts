// services/auth.ts
// Servicio de autenticación - Token JWT manejado por el frontend en sessionStorage
// El backend devuelve el token en el body, NO en cookies

import { api } from './api';
import { tokenStorage } from './tokenStorage';
import { getMockUserByEmail } from './mockUsers';

interface LoginCredentials {
  user: {
    email: string;
    password: string;
  };
}

interface AuthData {
  token: string;  // JWT token devuelto por el backend
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

// Respuesta del login incluye token y user
interface AuthResponse {
  success: boolean;
  user?: AuthData['user'];
  token?: string;
  message?: string;
}

// Login
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  // --- INTERCEPCIÓN PARA MODO INSPECCIÓN ---
  const isInspectionMode = import.meta.env.VITE_INSPECTION_MODE === 'true' || localStorage.getItem('inspectionMode') === 'true';
  
  if (isInspectionMode) {
    const mockUser = getMockUserByEmail(email);
    if (mockUser) {
      const dummyToken = `mock-jwt-token-${mockUser.id}`;
      tokenStorage.setToken(dummyToken);
      // Guardamos el email para que useAuthCheck sepa qué mock cargar
      localStorage.setItem('mockUserEmail', email);
      
      return {
        success: true,
        user: mockUser,
        token: dummyToken
      };
    }
    // Si no es un email de mock válido en modo inspección, error controlado
    return {
      success: false,
      message: 'Usuario de inspección no encontrado. Prueba con: superadmin@florhub.com, vendedor.py@florhub.com, etc.'
    };
  }
  // -----------------------------------------

  const credentials: LoginCredentials = {
    user: {
      email,
      password
    }
  };

  const response = await api.post<AuthData>('/usuario/login', credentials);

  // Guardar token en sessionStorage si existe
  if (response.success && response.data?.token) {
    tokenStorage.setToken(response.data.token);
  }

  return {
    success: response.success,
    user: response.data?.user,
    token: response.data?.token,
    message: response.message
  };
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    // Llamar al endpoint de logout del backend
    await api.post('/usuario/logout', {});
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  } finally {
    // Limpiar token de sessionStorage
    tokenStorage.removeToken();
    // Redirigir a login independientemente del resultado
    window.location.href = '/login';
  }
};

export type { AuthData, AuthResponse, LoginCredentials };
