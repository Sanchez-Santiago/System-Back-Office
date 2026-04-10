// services/clientes.ts
import { api } from './api';

export interface ClienteResponse {
  cliente_id: string;
  persona_id: string;
  nombre: string;
  apellido: string;
  documento: string;
  tipo_documento: string;
  email: string;
  telefono?: string;
  telefono_alternativo?: string;
  fecha_nacimiento: string;
  genero: string;
  nacionalidad: string;
}

export interface ClienteCreate {
  nombre: string;
  apellido: string;
  documento: string;
  tipo_documento: string;
  email: string;
  telefono?: string;
  telefono_alternativo?: string;
  fecha_nacimiento: string;
  genero: 'MASCULINO' | 'FEMENINO' | 'OTRO' | 'PREFIERO NO DECIR';
  nacionalidad: string;
}

export interface BusquedaDocumento {
  tipo_documento: string;
  documento: string;
}

export const clienteService = {
  buscarPorDocumento: async (params: BusquedaDocumento): Promise<{ success: boolean; data?: ClienteResponse; message?: string }> => {
    try {
      const response = await api.get<ClienteResponse>(
        `/clientes/buscar?tipo_documento=${params.tipo_documento}&documento=${params.documento}`
      );
      if (response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, message: 'Cliente no encontrado' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al buscar cliente' };
    }
  },

  crear: async (data: ClienteCreate): Promise<{ success: boolean; data?: ClienteResponse; message?: string }> => {
    try {
      const response = await api.post<ClienteResponse>('/clientes', { cliente: data });
      if (response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, message: 'Error al crear cliente' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al crear cliente' };
    }
  },

  obtenerPorId: async (id: string): Promise<{ success: boolean; data?: ClienteResponse; message?: string }> => {
    try {
      const response = await api.get<ClienteResponse>(`/clientes/${id}`);
      if (response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, message: 'Error al obtener cliente' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al obtener cliente' };
    }
  },
};
