// src/services/usersApi.ts
import { authService } from './auth';
import { envConfig } from '../config/environment';

export interface Usuario {
  usuario_id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion?: string;
  ultimo_login?: string;
}

export interface UsuarioCreate {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: string;
}

export interface UsuarioUpdate extends Partial<UsuarioCreate> {
  activo?: boolean;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface UsersResponse {
  success: boolean;
  data: Usuario[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class UsersApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${envConfig.api.baseUrl}${endpoint}`;
      
      // Configurar timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), envConfig.api.timeout);
      
      const headers = {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        authService.logout();
        throw new Error('Sesión expirada');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout de la solicitud');
      }
      console.error('API request error:', error);
      throw error;
    }
  }

  async fetchUsers(page = 1, limit = 100): Promise<UsersResponse> {
    const response = await this.request<Usuario[]>(`/usuarios?page=${page}&limit=${limit}`);
    return {
      success: response.success,
      data: response.data || [],
      pagination: response.pagination,
    };
  }

  async fetchActiveUsers(): Promise<Usuario[]> {
    const response = await this.request<Usuario[]>('/usuarios?activo=true');
    return response.data || [];
  }

  async fetchUsersByRole(rol: string): Promise<Usuario[]> {
    const response = await this.request<Usuario[]>(`/usuarios?rol=${rol}`);
    return response.data || [];
  }

  async createUser(userData: UsuarioCreate): Promise<ApiResponse<Usuario>> {
    return this.request<Usuario>('/usuario/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: UsuarioUpdate): Promise<ApiResponse<Usuario>> {
    return this.request<Usuario>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    return this.request(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  }

  async fetchUserById(id: string): Promise<Usuario | null> {
    try {
      const response = await this.request<Usuario>(`/usuarios/${id}`);
      return response.data || null;
    } catch {
      return null;
    }
  }

  async toggleUserStatus(id: string, activo: boolean): Promise<ApiResponse<Usuario>> {
    return this.request<Usuario>(`/usuarios/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ activo }),
    });
  }

  async changePassword(passwordData: PasswordChange): Promise<ApiResponse> {
    return this.request('/usuario/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  }

  async resetPassword(userId: string): Promise<ApiResponse> {
    return this.request(`/usuarios/${userId}/reset-password`, {
      method: 'POST',
    });
  }

  // Métodos utilitarios
  getFullname(user: Usuario): string {
    return `${user.nombre} ${user.apellido}`;
  }

  getRoleDisplayName(rol: string): string {
    const roleMap: Record<string, string> = {
      'admin': 'Administrador',
      'manager': 'Gerente',
      'seller': 'Vendedor',
      'backoffice': 'Back Office',
    };
    return roleMap[rol] || rol;
  }

  getRoleColor(rol: string): string {
    const colorMap: Record<string, string> = {
      'admin': 'bg-purple-100 text-purple-800',
      'manager': 'bg-blue-100 text-blue-800',
      'seller': 'bg-green-100 text-green-800',
      'backoffice': 'bg-orange-100 text-orange-800',
    };
    return colorMap[rol] || 'bg-gray-100 text-gray-800';
  }

  isUserActive(user: Usuario): boolean {
    return user.activo;
  }

  // Métodos de filtrado
  filterUsersBySearchTerm(users: Usuario[], searchTerm: string): Usuario[] {
    if (!searchTerm) return users;
    
    const lowerSearch = searchTerm.toLowerCase();
    return users.filter(user =>
      user.nombre.toLowerCase().includes(lowerSearch) ||
      user.apellido.toLowerCase().includes(lowerSearch) ||
      user.email.toLowerCase().includes(lowerSearch) ||
      user.rol.toLowerCase().includes(lowerSearch)
    );
  }

  // Métodos de validación
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una mayúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una minúscula');
    }
    
    if (!/\d/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const usersApi = new UsersApiService();