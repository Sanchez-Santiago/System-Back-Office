// services/mensajes.ts
import { api } from './api';

export interface Mensaje {
  mensaje_id: number;
  tipo: 'ALERTA' | 'NOTIFICACION';
  titulo: string;
  comentario: string;
  fecha_creacion: string;
  resuelto: boolean | null;
  fecha_resolucion: string | null;
  usuario_creador_id: string;
  referencia_id: number | null;
  leida?: boolean;
  fecha_lectura?: string | null;
}

export interface MensajeResponse {
  success: boolean;
  data: Mensaje[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
  message?: string;
}

export interface MensajeCountResponse {
  success: boolean;
  count: number;
}

export const mensajesService = {
  async getInbox(page: number = 1, limit: number = 20): Promise<MensajeResponse> {
    const response = await api.get<MensajeResponse>(`mensajes/inbox?page=${page}&limit=${limit}`);
    return response;
  },

  async getNoLeidos(): Promise<MensajeCountResponse> {
    const response = await api.get<MensajeCountResponse>('mensajes/no-leidos');
    return response;
  },

  async getAlertasPendientes(page: number = 1, limit: number = 20): Promise<MensajeResponse> {
    const response = await api.get<MensajeResponse>(`mensajes/alertas-pendientes?page=${page}&limit=${limit}`);
    return response;
  },

  async marcarComoLeido(mensajeId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.patch<{ success: boolean; message: string }>(`mensajes/${mensajeId}/leido`, {});
    return response;
  },

  async resolverAlerta(mensajeId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.patch<{ success: boolean; message: string }>(`mensajes/${mensajeId}/resolver`, {});
    return response;
  },
};

export default mensajesService;
