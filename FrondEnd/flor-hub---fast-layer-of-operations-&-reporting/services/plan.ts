// services/plan.ts
// Servicios para planes y promociones

import { api } from './api';

// Tipos de Plan
export interface PlanResponse {
  plan_id: number;
  nombre: string;
  precio: number;
  gigabyte?: string;
  llamadas?: string;
  mensajes?: string;
  beneficios?: string;
  whatsapp?: boolean;
  roaming?: boolean;
  empresa_origen_id: number;
}

export interface PromocionResponse {
  promocion_id: number;
  nombre: string;
  descuento: number;
  beneficios?: string;
  empresa_origen_id: number;
  plan_id: number;
}

export interface EmpresaOrigenResponse {
  empresa_origen_id: number;
  nombre: string;
  pais: string;
}

// Obtener planes por empresa
export const getPlanesPorEmpresa = async (
  empresaId: number
): Promise<{ success: boolean; data?: PlanResponse[]; message?: string }> => {
  try {
    const response = await api.get<{ data: PlanResponse[] }>(`/planes/empresa/${empresaId}`);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al obtener planes' };
  }
};

// Obtener promociones por empresa
export const getPromocionesPorEmpresa = async (
  empresaId: number
): Promise<{ success: boolean; data?: PromocionResponse[]; message?: string }> => {
  try {
    const response = await api.get<{ data: PromocionResponse[] }>(`/promociones/empresa/${empresaId}`);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al obtener promociones' };
  }
};

// Obtener todas las empresas origen
export const getEmpresasOrigen = async (): Promise<{ success: boolean; data?: EmpresaOrigenResponse[]; message?: string }> => {
  try {
    const response = await api.get<{ data: EmpresaOrigenResponse[] }>('/empresas-origen');
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al obtener empresas' };
  }
};

// Obtener plan por ID
export const getPlanPorId = async (
  planId: number
): Promise<{ success: boolean; data?: PlanResponse; message?: string }> => {
  try {
    const response = await api.get<{ data: PlanResponse }>(`/planes/${planId}`);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al obtener plan' };
  }
};
