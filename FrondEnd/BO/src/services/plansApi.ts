// src/services/plansApi.ts
import { authService } from './auth';
import { envConfig } from '../config/environment';

export interface Plan {
  plan_id: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  tipo: "PREPAGO" | "POSTPAGO";
  datos?: string;
  minutos?: string;
  mensajes?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion?: string;
}

export interface PlanCreate {
  nombre: string;
  precio: number;
  descripcion?: string;
  tipo: "PREPAGO" | "POSTPAGO";
  datos?: string;
  minutos?: string;
  mensajes?: string;
}

export interface PlanUpdate extends Partial<PlanCreate> {}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PlansResponse {
  success: boolean;
  data: Plan[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class PlansApiService {
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

  async fetchPlans(page = 1, limit = 100): Promise<PlansResponse> {
    const response = await this.request<Plan[]>(`/planes?page=${page}&limit=${limit}`);
    return {
      success: response.success,
      data: response.data || [],
      pagination: response.pagination,
    };
  }

  async fetchActivePlans(): Promise<Plan[]> {
    const response = await this.request<Plan[]>('/planes?activo=true');
    return response.data || [];
  }

  async fetchPlansByType(tipo: "PREPAGO" | "POSTPAGO"): Promise<Plan[]> {
    const response = await this.request<Plan[]>(`/planes?tipo=${tipo}`);
    return response.data || [];
  }

  async createPlan(planData: PlanCreate): Promise<ApiResponse<Plan>> {
    return this.request<Plan>('/planes', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  async updatePlan(id: number, planData: PlanUpdate): Promise<ApiResponse<Plan>> {
    return this.request<Plan>(`/planes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  }

  async deletePlan(id: number): Promise<ApiResponse> {
    return this.request(`/planes/${id}`, {
      method: 'DELETE',
    });
  }

  async fetchPlanById(id: number): Promise<Plan | null> {
    try {
      const response = await this.request<Plan>(`/planes/${id}`);
      return response.data || null;
    } catch {
      return null;
    }
  }

  // Método utilitario para formatear precio
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }
}

export const plansApi = new PlansApiService();