// services/ventas.ts
// Servicio para gestionar ventas

import { api } from './api';
import { Sale, SaleStatus, LogisticStatus } from '../types';

// Interfaces para respuestas de la API
interface VentaResponse {
  venta_id: number;
  sds: string | null;
  chip: 'SIM' | 'ESIM';
  stl?: string | null;
  tipo_venta: 'PORTABILIDAD' | 'LINEA_NUEVA';
  cliente_id: string;
  vendedor_id: string;
  plan_id: number;
  promocion_id?: number | null;
  empresa_origen_id?: number | null;
  fecha_creacion: string;
  fecha_modificacion?: string;
  // Campos relacionados (joins)
  cliente_nombre?: string;
  cliente_apellido?: string;
  cliente_documento?: string;
  cliente_email?: string;
  cliente_telefono?: string;
  vendedor_nombre?: string;
  vendedor_apellido?: string;
  vendedor_email?: string;
  plan_nombre?: string;
  plan_precio?: number;
  promocion_nombre?: string;
  estado_actual?: string;
}

interface VentaListResponse {
  ventas: VentaResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

interface EstadisticasResponse {
  total_ventas: number;
  ventas_por_estado: Record<string, number>;
  ventas_por_plan: Record<string, number>;
  ventas_por_vendedor: Record<string, number>;
  ventas_por_mes: Record<string, number>;
}

// Listar todas las ventas con paginación
export const getVentas = async (page: number = 1, limit: number = 50): Promise<VentaListResponse> => {
  const response = await api.get<VentaListResponse>(`ventas?page=${page}&limit=${limit}`);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Error al cargar ventas');
  }
  
  return response.data;
};

// Obtener venta por ID
export const getVentaById = async (id: number | string): Promise<VentaResponse> => {
  const response = await api.get<VentaResponse>(`ventas/${id}`);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Venta no encontrada');
  }
  
  return response.data;
};

// Buscar venta por SDS
export const getVentaBySDS = async (sds: string): Promise<VentaResponse> => {
  const response = await api.get<VentaResponse>(`ventas/sds/${sds}`);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Venta no encontrada');
  }
  
  return response.data;
};

// Buscar venta por SAP
export const getVentaBySAP = async (sap: string): Promise<VentaResponse> => {
  const response = await api.get<VentaResponse>(`ventas/sap/${sap}`);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Venta no encontrada');
  }
  
  return response.data;
};

// Obtener ventas por rango de fechas
export const getVentasByDateRange = async (
  start: string, 
  end: string
): Promise<VentaResponse[]> => {
  const response = await api.get<VentaResponse[]>(
    `ventas/fechas?start=${start}&end=${end}`
  );
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Error al buscar ventas');
  }
  
  return response.data;
};

// Obtener estadísticas de ventas
export const getEstadisticas = async (): Promise<EstadisticasResponse> => {
  const response = await api.get<EstadisticasResponse>('ventas/estadisticas');
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Error al cargar estadísticas');
  }
  
  return response.data;
};

// Crear nueva venta
export const createVenta = async (ventaData: any): Promise<VentaResponse> => {
  const response = await api.post<VentaResponse>('ventas', ventaData);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Error al crear venta');
  }
  
  return response.data;
};

// Actualizar venta
export const updateVenta = async (
  id: number | string, 
  ventaData: any
): Promise<VentaResponse> => {
  const response = await api.put<VentaResponse>(`ventas/${id}`, ventaData);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Error al actualizar venta');
  }
  
  return response.data;
};

// Eliminar venta
export const deleteVenta = async (id: number | string): Promise<void> => {
  const response = await api.delete<void>(`ventas/${id}`);
  
  if (!response.success) {
    throw new Error(response.message || 'Error al eliminar venta');
  }
};

// Helper para mapear respuesta API a tipo Sale
export const mapVentaToSale = (venta: VentaResponse): Sale => {
  return {
    id: `V-${venta.venta_id}`,
    customerName: `${venta.cliente_nombre || ''} ${venta.cliente_apellido || ''}`.trim(),
    dni: venta.cliente_documento || '',
    phoneNumber: venta.cliente_telefono || '',
    status: (venta.estado_actual as SaleStatus) || SaleStatus.INICIAL,
    logisticStatus: LogisticStatus.INICIAL, // Se obtiene del correo
    lineStatus: venta.tipo_venta === 'PORTABILIDAD' ? 
      (venta.stl ? 'PENDIENTE PORTABILIDAD' : 'PENDIENTE PRECARGA') : 
      'PENDIENTE PRECARGA',
    productType: venta.tipo_venta === 'PORTABILIDAD' ? 
      'PORTABILIDAD' : 'LINEA_NUEVA',
    originMarket: 'PREPAGO', // Default, se obtiene de portabilidad
    originCompany: undefined,
    plan: venta.plan_nombre || '',
    promotion: venta.promocion_nombre || '',
    priority: 'MEDIA',
    date: venta.fecha_creacion.split('T')[0],
    amount: venta.plan_precio || 0,
    comments: [],
    advisor: `${venta.vendedor_nombre || ''} ${venta.vendedor_apellido || ''}`.trim(),
    supervisor: '' // Se obtiene del supervisor asignado
  };
};

export type { 
  VentaResponse, 
  VentaListResponse, 
  EstadisticasResponse 
};
