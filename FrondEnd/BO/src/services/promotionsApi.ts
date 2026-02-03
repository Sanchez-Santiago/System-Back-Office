// src/services/promotionsApi.ts
import { authService } from './auth';
import { envConfig } from '../config/environment';

export interface Promocion {
  promocion_id: number;
  nombre: string;
  descripcion?: string;
  tipo_descuento: "PORCENTAJE" | "FIJO";
  valor_descuento: number;
  condiciones?: string;
  plan_id?: number;
  fecha_inicio: string;
  fecha_fin?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_modificacion?: string;
}

export interface PromocionCreate {
  nombre: string;
  descripcion?: string;
  tipo_descuento: "PORCENTAJE" | "FIJO";
  valor_descuento: number;
  condiciones?: string;
  plan_id?: number;
  fecha_inicio: string;
  fecha_fin?: string;
}

export interface PromocionUpdate extends Partial<PromocionCreate> {}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PromotionsResponse {
  success: boolean;
  data: Promocion[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class PromotionsApiService {
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

  async fetchPromotions(page = 1, limit = 100): Promise<PromotionsResponse> {
    const response = await this.request<Promocion[]>(`/promociones?page=${page}&limit=${limit}`);
    return {
      success: response.success,
      data: response.data || [],
      pagination: response.pagination,
    };
  }

  async fetchActivePromotions(): Promise<Promocion[]> {
    const response = await this.request<Promocion[]>('/promociones?activo=true');
    return response.data || [];
  }

  async fetchPromotionsByPlan(planId: number): Promise<Promocion[]> {
    const response = await this.request<Promocion[]>(`/promociones?plan_id=${planId}`);
    return response.data || [];
  }

  async createPromotion(promotionData: PromocionCreate): Promise<ApiResponse<Promocion>> {
    return this.request<Promocion>('/promociones', {
      method: 'POST',
      body: JSON.stringify(promotionData),
    });
  }

  async updatePromotion(id: number, promotionData: PromocionUpdate): Promise<ApiResponse<Promocion>> {
    return this.request<Promocion>(`/promociones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(promotionData),
    });
  }

  async deletePromotion(id: number): Promise<ApiResponse> {
    return this.request(`/promociones/${id}`, {
      method: 'DELETE',
    });
  }

  async fetchPromotionById(id: number): Promise<Promocion | null> {
    try {
      const response = await this.request<Promocion>(`/promociones/${id}`);
      return response.data || null;
    } catch {
      return null;
    }
  }

  // Método utilitario para calcular descuento
  calculateDiscount(precio: number, promocion: Promocion): number {
    if (promocion.tipo_descuento === "PORCENTAJE") {
      return precio * (promocion.valor_descuento / 100);
    } else {
      return promocion.valor_descuento;
    }
  }

  // Método utilitario para formatear descuento
  formatDiscount(promocion: Promocion): string {
    if (promocion.tipo_descuento === "PORCENTAJE") {
      return `${promocion.valor_descuento}%`;
    } else {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(promocion.valor_descuento);
    }
  }

  // Método para verificar si una promoción está vigente
  isPromotionValid(promocion: Promocion): boolean {
    if (!promocion.activo) return false;
    
    const now = new Date();
    const startDate = new Date(promocion.fecha_inicio);
    
    if (now < startDate) return false;
    
    if (promocion.fecha_fin) {
      const endDate = new Date(promocion.fecha_fin);
      if (now > endDate) return false;
    }
    
    return true;
  }
}

export const promotionsApi = new PromotionsApiService();