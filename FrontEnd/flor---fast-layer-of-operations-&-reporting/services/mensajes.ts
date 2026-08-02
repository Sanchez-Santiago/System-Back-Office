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
    return response.data!;
  },

  async getNoLeidos(): Promise<MensajeCountResponse> {
    const response = await api.get<MensajeCountResponse>('mensajes/no-leidos');
    return response.data!;
  },

  async getAlertasPendientes(page: number = 1, limit: number = 20): Promise<MensajeResponse> {
    const response = await api.get<MensajeResponse>(`mensajes/alertas-pendientes?page=${page}&limit=${limit}`);
    return response.data!;
  },

  async marcarComoLeido(mensajeId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.patch<{ success: boolean; message: string }>(`mensajes/${mensajeId}/leido`, {});
    return response.data!;
  },

  async marcarTodasLeidas(): Promise<{ success: boolean; count: number; message?: string }> {
    const response = await api.patch<{ success: boolean; count: number; message?: string }>(`mensajes/leer-todas`, {});
    return response.data!;
  },

  async resolverAlerta(mensajeId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.patch<{ success: boolean; message: string }>(`mensajes/${mensajeId}/resolver`, {});
    return response.data!;
  },

  async eliminar(mensajeId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(`mensajes/${mensajeId}`);
    return response.data!;
  },
};

export default mensajesService;
