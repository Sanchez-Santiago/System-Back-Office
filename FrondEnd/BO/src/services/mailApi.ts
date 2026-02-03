// src/services/mailApi.ts
import { authService } from './auth';
import { envConfig } from '../config/environment';
import type { Correo, CorreoCreate } from '../types/sales';

export interface EstadoCorreo {
  estado_id: number;
  nombre: string;
  descripcion?: string;
  color: string;
  activo: boolean;
  orden: number;
  fecha_creacion: string;
  fecha_modificacion?: string;
}

export interface EstadoCorreoCreate {
  nombre: string;
  descripcion?: string;
  color: string;
  orden: number;
}

export interface EstadoCorreoUpdate extends Partial<EstadoCorreoCreate> {
  activo?: boolean;
}

export interface CorreoConEstado extends Correo {
  correo_id: number;
  venta_id: number;
  estado_actual: string;
  fecha_envio?: string;
  fecha_entrega?: string;
  fecha_modificacion?: string;
  tracking_number?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface MailsResponse {
  success: boolean;
  data: CorreoConEstado[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EstadosResponse {
  success: boolean;
  data: EstadoCorreo[];
}

class MailApiService {
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

  // Métodos para correos
  async fetchMails(page = 1, limit = 100): Promise<MailsResponse> {
    const response = await this.request<CorreoConEstado[]>(`/correos?page=${page}&limit=${limit}`);
    return {
      success: response.success,
      data: response.data || [],
      pagination: response.pagination,
    };
  }

  async fetchMailsByStatus(status: string): Promise<CorreoConEstado[]> {
    const response = await this.request<CorreoConEstado[]>(`/correos?estado=${status}`);
    return response.data || [];
  }

  async fetchMailsByLocation(localidad: string, departamento?: string): Promise<CorreoConEstado[]> {
    const query = departamento ? `/correos?localidad=${localidad}&departamento=${departamento}` : `/correos?localidad=${localidad}`;
    const response = await this.request<CorreoConEstado[]>(query);
    return response.data || [];
  }

  async fetchExpiredMails(): Promise<CorreoConEstado[]> {
    const response = await this.request<CorreoConEstado[]>('/correos/vencidos');
    return response.data || [];
  }

  async fetchMailsExpiringSoon(days = 7): Promise<CorreoConEstado[]> {
    const response = await this.request<CorreoConEstado[]>(`/correos/proximos-vencer?dias=${days}`);
    return response.data || [];
  }

  async fetchMailById(id: number): Promise<CorreoConEstado | null> {
    try {
      const response = await this.request<CorreoConEstado>(`/correos/${id}`);
      return response.data || null;
    } catch {
      return null;
    }
  }

  async createMail(mailData: CorreoCreate): Promise<ApiResponse<CorreoConEstado>> {
    return this.request<CorreoConEstado>('/correos', {
      method: 'POST',
      body: JSON.stringify(mailData),
    });
  }

  async updateMail(id: number, mailData: Partial<CorreoCreate>): Promise<ApiResponse<CorreoConEstado>> {
    return this.request<CorreoConEstado>(`/correos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mailData),
    });
  }

  async updateMailStatus(id: number, estadoId: number): Promise<ApiResponse<CorreoConEstado>> {
    return this.request<CorreoConEstado>(`/correos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado_id: estadoId }),
    });
  }

  async markAsDelivered(id: number, trackingNumber?: string): Promise<ApiResponse<CorreoConEstado>> {
    return this.request<CorreoConEstado>(`/correos/${id}/entregar`, {
      method: 'POST',
      body: JSON.stringify({ tracking_number: trackingNumber }),
    });
  }

  async deleteMail(id: number): Promise<ApiResponse> {
    return this.request(`/correos/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para estados de correo
  async fetchMailStates(): Promise<EstadoCorreo[]> {
    const response = await this.request<EstadoCorreo[]>('/estados-correo');
    return response.data || [];
  }

  async fetchActiveMailStates(): Promise<EstadoCorreo[]> {
    const response = await this.request<EstadoCorreo[]>('/estados-correo?activo=true');
    return response.data || [];
  }

  async createMailState(stateData: EstadoCorreoCreate): Promise<ApiResponse<EstadoCorreo>> {
    return this.request<EstadoCorreo>('/estados-correo', {
      method: 'POST',
      body: JSON.stringify(stateData),
    });
  }

  async updateMailState(id: number, stateData: EstadoCorreoUpdate): Promise<ApiResponse<EstadoCorreo>> {
    return this.request<EstadoCorreo>(`/estados-correo/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stateData),
    });
  }

  async toggleMailStateStatus(id: number, activo: boolean): Promise<ApiResponse<EstadoCorreo>> {
    return this.request<EstadoCorreo>(`/estados-correo/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ activo }),
    });
  }

  async deleteMailState(id: number): Promise<ApiResponse> {
    return this.request(`/estados-correo/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderMailStates(orderedStates: Array<{ estado_id: number; orden: number }>): Promise<ApiResponse<EstadoCorreo[]>> {
    return this.request<EstadoCorreo[]>('/estados-correo/reordenar', {
      method: 'POST',
      body: JSON.stringify({ estados: orderedStates }),
    });
  }

  // Métodos utilitarios
  getFullAddress(mail: Correo | CorreoConEstado): string {
    let address = `${mail.direccion} ${mail.numero_casa}`;
    if (mail.entre_calles) {
      address += ` (Entre ${mail.entre_calles})`;
    }
    if (mail.barrio) {
      address += `, ${mail.barrio}`;
    }
    address += `, ${mail.localidad}, ${mail.departamento} ${mail.codigo_postal}`;
    return address;
  }

  getContactInfo(mail: Correo | CorreoConEstado): string {
    const info = [mail.telefono_contacto];
    if (mail.telefono_alternativo) {
      info.push(mail.telefono_alternativo);
    }
    return info.join(' / ');
  }

  getRecipientInfo(mail: Correo | CorreoConEstado): string {
    const info = [mail.destinatario];
    if (mail.persona_autorizada) {
      info.push(`Autorizado: ${mail.persona_autorizada}`);
    }
    return info.join(' - ');
  }

  isMailExpired(mail: CorreoConEstado): boolean {
    if (!mail.fecha_envio) return false;
    const now = new Date();
    const shippingDate = new Date(mail.fecha_envio);
    const daysDiff = Math.floor((now.getTime() - shippingDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 30; // Considerar expirado después de 30 días
  }

  getMailAge(mail: CorreoConEstado): string {
    const now = new Date();
    const referenceDate = mail.fecha_envio ? new Date(mail.fecha_envio) : new Date();
    const daysDiff = Math.floor((now.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return 'Hoy';
    if (daysDiff === 1) return 'Ayer';
    if (daysDiff < 7) return `Hace ${daysDiff} días`;
    if (daysDiff < 30) return `Hace ${Math.floor(daysDiff / 7)} semanas`;
    return `Hace ${Math.floor(daysDiff / 30)} meses`;
  }

  // Métodos de filtrado
  filterMailsBySearchTerm(mails: CorreoConEstado[], searchTerm: string): CorreoConEstado[] {
    if (!searchTerm) return mails;
    
    const lowerSearch = searchTerm.toLowerCase();
    return mails.filter(mail =>
      mail.destinatario.toLowerCase().includes(lowerSearch) ||
      mail.direccion.toLowerCase().includes(lowerSearch) ||
      mail.localidad.toLowerCase().includes(lowerSearch) ||
      mail.departamento.toLowerCase().includes(lowerSearch) ||
      mail.telefono_contacto.includes(searchTerm) ||
      (mail.telefono_alternativo && mail.telefono_alternativo.includes(searchTerm)) ||
      mail.sap_id.includes(searchTerm) ||
      (mail.tracking_number && mail.tracking_number.includes(searchTerm))
    );
  }

  // Métodos de estadísticas
  async getMailStatistics(): Promise<ApiResponse<any>> {
    return this.request('/correos/estadisticas');
  }

  async getMailStatisticsByLocation(): Promise<ApiResponse<any>> {
    return this.request('/correos/estadisticas/ubicacion');
  }

  async getMailStatisticsByStatus(): Promise<ApiResponse<any>> {
    return this.request('/correos/estadisticas/estados');
  }
}

export const mailApi = new MailApiService();