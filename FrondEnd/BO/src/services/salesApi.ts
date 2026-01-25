// src/services/salesApi.ts
import { authService } from './auth';
import type {
  Sale,
  SaleCreate,
  SaleUpdate,
  SalesResponse,
  SalesStats,
  ApiResponse
} from '../types/sales';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
      const url = `${API_BASE_URL}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        authService.logout();
        throw new Error('Sesión expirada');
      }

      const data = await response.json();
      return data;
    } catch (error) {
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
    const response = await this.request<SalesStats>('/ventas/statistics');
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