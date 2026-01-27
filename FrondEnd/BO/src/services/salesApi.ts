// src/services/salesApi.ts
import { authService } from './auth';
import { envConfig } from '../config/environment';
import type {
  Sale,
  SaleCreate,
  SaleUpdate,
  SalesResponse,
  SalesStats,
  ApiResponse,
  SaleCreateRequest
} from '../types/sales';

export interface SalesFilters {
  page?: number;
  limit?: number;
  tipo_venta?: string;
  vendedor_id?: string;
  cliente_id?: string;
  plan_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}

class SalesApiService {
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

  async fetchSales(filters: SalesFilters = {}): Promise<SalesResponse> {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const query = params.toString();
    const endpoint = `/ventas${query ? `?${query}` : ''}`;

    const response = await this.request<Sale[]>(endpoint);
    return {
      success: response.success,
      data: response.data || [],
      pagination: response.pagination,
    };
  }

async createSale(saleData: SaleCreate): Promise<ApiResponse<Sale>> {
    return this.request<Sale>('/ventas', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  }

  async createCompleteSale(saleData: SaleCreateRequest): Promise<ApiResponse<Sale>> {
    return this.request<Sale>('/ventas', {
      method: 'POST',
      body: JSON.stringify(saleData),
    });
  }

  async updateSale(id: number, saleData: SaleUpdate): Promise<ApiResponse<Sale>> {
    return this.request<Sale>(`/ventas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(saleData),
    });
  }

  async deleteSale(id: number): Promise<ApiResponse> {
    return this.request(`/ventas/${id}`, {
      method: 'DELETE',
    });
  }

async fetchSalesStats(): Promise<SalesStats> {
    const response = await this.request<SalesStats>('/ventas/estadisticas');
    return response.data || {
      totalVentas: 0,
      ventasPorPlan: [],
      ventasPorVendedor: [],
      ventasPorMes: [],
    };
  }

  async fetchSaleById(id: number): Promise<Sale | null> {
    try {
      const response = await this.request<Sale>(`/ventas/${id}`);
      return response.data || null;
    } catch {
      return null;
    }
  }
}

export const salesApi = new SalesApiService();