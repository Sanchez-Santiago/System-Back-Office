// src/services/auth.ts
import { envConfig } from '../config/environment';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginRequest {
  user: LoginCredentials;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
  };
  message?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const loginRequest: LoginRequest = {
        user: {
          email: credentials.email,
          password: credentials.password
        }
      };

      const response = await fetch(`${envConfig.api.baseUrl}/usuario/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginRequest),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.token) {
        localStorage.setItem(envConfig.auth.tokenKey, data.token);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor',
      };
    }
  },

  logout(): void {
    localStorage.removeItem(envConfig.auth.tokenKey);
  },

  getToken(): string | null {
    const token = localStorage.getItem(envConfig.auth.tokenKey);
    console.log('🔑 authService.getToken: Buscando token con key:', envConfig.auth.tokenKey);
    console.log('🔑 authService.getToken: Token encontrado:', !!token);
    return token;
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    console.log('🔑 authService.isAuthenticated: Token encontrado:', !!token);
    
    if (!token) {
      console.log('❌ authService.isAuthenticated: No hay token');
      return false;
    }

    try {
      // Basic check - decode JWT to see if expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const isValid = payload.exp > currentTime;
      console.log('🔑 authService.isAuthenticated: Token válido hasta:', new Date(payload.exp * 1000));
      console.log('🔑 authService.isAuthenticated: Es válido:', isValid);
      return isValid;
    } catch (error) {
      console.log('❌ authService.isAuthenticated: Error al decodificar token:', error);
      return false;
    }
  },

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};