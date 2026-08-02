// services/plan.ts
// Servicios para planes y promociones

import { api } from './api';

const withPaisParam = (url: string, pais?: string | null) => {
  if (!pais) return url;
  return `${url}${url.includes('?') ? '&' : '?'}pais=${encodeURIComponent(pais)}`;
};

// Tipos de Plan
export interface PlanResponse {
  plan_id: number;
  nombre: string;
  precio: number;
  gigabyte: number;
  llamadas: string;
  mensajes: string;
  beneficios?: string;
  whatsapp: string;
  roaming: string;
  empresa_origen_id: number;
  fecha_duracion?: string;
  promocion_id?: number;
  activo?: boolean;
}

export interface PromocionResponse {
  promocion_id: number;
  nombre: string;
  descuento: number;
  beneficios?: string;
  empresa_origen_id: number;
  fecha_terminacion?: string;
  activo?: boolean;
}

export interface EmpresaOrigenResponse {
  empresa_origen_id: number;
  nombre_empresa: string; // Corregido: es nombre_empresa en BD
  pais: string;
}

// Obtener planes por empresa
export const getPlanesPorEmpresa = async (
  empresaId: number,
  pais?: string | null
): Promise<{ success: boolean; data?: PlanResponse[]; message?: string }> => {
  try {
    const response = await api.get<PlanResponse[]>(withPaisParam(`/planes/empresa/${empresaId}`, pais));
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al obtener planes' };
  }
};

// Obtener promociones por empresa
export const getPromocionesPorEmpresa = async (
  empresaId: number,
  pais?: string | null
): Promise<{ success: boolean; data?: PromocionResponse[]; message?: string }> => {
  try {
    const response = await api.get<PromocionResponse[]>(withPaisParam(`/promociones/empresa/${empresaId}`, pais));
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al obtener promociones' };
  }
};

// Obtener todas las empresas origen
export const getEmpresasOrigen = async (pais?: string | null): Promise<{ success: boolean; data?: EmpresaOrigenResponse[]; message?: string }> => {
  try {
    const response = await api.get<EmpresaOrigenResponse[]>(withPaisParam('/empresa-origen', pais));
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al obtener empresas' };
  }
};

// Obtener plan por ID
export const getPlanPorId = async (
  planId: number
): Promise<{ success: boolean; data?: PlanResponse; message?: string }> => {
  try {
    const response = await api.get<PlanResponse>(`/planes/${planId}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al obtener plan' };
  }
};

// Obtener TODOS los planes (sin filtro de empresa) - para LINEA_NUEVA
export const getAllPlanes = async (pais?: string | null): Promise<{ success: boolean; data?: PlanResponse[]; message?: string }> => {
  try {
    const response = await api.get<PlanResponse[]>(withPaisParam('/planes?limit=1000', pais));
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al obtener todos los planes' };
  }
};

// Obtener TODAS las promociones (sin filtro de empresa) - para LINEA_NUEVA
export const getAllPromociones = async (pais?: string | null): Promise<{ success: boolean; data?: PromocionResponse[]; message?: string }> => {
  try {
    const response = await api.get<PromocionResponse[]>(withPaisParam('/promociones?limit=1000', pais));
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al obtener todas las promociones' };
  }
};
