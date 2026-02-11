// services/ventaDetalle.ts
// Servicio para obtener detalles completos de una venta

import { api } from './api';
import { getComentariosByVenta, ComentarioResponse } from './comentarios';

interface VentaDetalleResponse {
  venta_id: number;
  sds: string;
  chip: 'SIM' | 'ESIM';
  stl?: string;
  tipo_venta: 'PORTABILIDAD' | 'LINEA_NUEVA';
  cliente_id: string;
  vendedor_id: string;
  multiple: number;
  plan_id: number;
  empresa_origen_id: number;
  fecha_creacion: string;
  fecha_modificacion?: string;
  // Datos relacionados (joins)
  cliente_nombre: string;
  cliente_apellido: string;
  cliente_documento: string;
  cliente_email: string;
  cliente_telefono: string;
  cliente_direccion?: string;
  cliente_localidad?: string;
  vendedor_nombre: string;
  vendedor_apellido: string;
  vendedor_email: string;
  plan_nombre: string;
  plan_precio: number;
  promocion_nombre?: string;
  empresa_origen_nombre: string;
}

interface LineaNuevaResponse {
  linea_nueva_id: number;
  venta_id: number;
  estado: string;
  iccid?: string;
  numero_activacion?: string;
  fecha_creacion: string;
}

interface PortabilidadResponse {
  portabilidad_id: number;
  venta_id: number;
  numero_portar: string;
  operador_origen_id: number;
  operador_origen_nombre: string;
  nro_portabilidad?: string;
  nro_postpago?: string;
  estado: string;
  fecha_solicitud: string;
}

interface EstadoVentaResponse {
  estado_venta_id: number;
  venta_id: number;
  estado_anterior?: string;
  estado_nuevo: string;
  fecha_cambio: string;
  usuario_id: string;
  observaciones?: string;
  usuario_nombre: string;
}

interface CorreoVentaResponse {
  correo_id: number;
  venta_id: number;
  cliente_id: string;
  destinatario_nombre: string;
  destinatario_direccion: string;
  destinatario_localidad: string;
  destinatario_provincia: string;
  codigo_postal: string;
  tipo_envio: 'CHICO' | 'GRANDE';
  estado_actual: string;
  fecha_envio: string;
  numero_seguimiento?: string;
}

interface VentaCompletaResponse {
  venta: VentaDetalleResponse;
  comentarios: ComentarioResponse[];
  linea_nueva?: LineaNuevaResponse;
  portabilidad?: PortabilidadResponse;
  estados: EstadoVentaResponse[];
  correos: CorreoVentaResponse[];
}

// Obtener datos básicos de una venta por ID
export const getVentaById = async (id: number | string): Promise<VentaDetalleResponse> => {
  const response = await api.get<VentaDetalleResponse>(`ventas/${id}`);
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Venta no encontrada');
  }
  
  return response.data;
};

// Obtener datos de línea nueva
export const getLineaNuevaByVenta = async (ventaId: number | string): Promise<LineaNuevaResponse | null> => {
  const response = await api.get<LineaNuevaResponse>(`linea-nueva/${ventaId}`);
  
  if (!response.success || !response.data) {
    return null;
  }
  
  return response.data;
};

// Obtener datos de portabilidad
export const getPortabilidadByVenta = async (ventaId: number | string): Promise<PortabilidadResponse | null> => {
  const response = await api.get<PortabilidadResponse>(`portabilidad/${ventaId}`);
  
  if (!response.success || !response.data) {
    return null;
  }
  
  return response.data;
};

// Obtener estados de la venta
export const getEstadosByVenta = async (ventaId: number | string): Promise<EstadoVentaResponse[]> => {
  const response = await api.get<EstadoVentaResponse[]>(`estados-venta/venta/${ventaId}`);
  
  if (!response.success || !response.data) {
    return [];
  }
  
  return response.data;
};

// Obtener correos de la venta (por SAP)
export const getCorreosByVenta = async (sap: string): Promise<CorreoVentaResponse[]> => {
  const response = await api.get<CorreoVentaResponse[]>(`correos/search/sap?sap=${sap}`);
  
  if (!response.success || !response.data) {
    return [];
  }
  
  return response.data;
};

// Obtener venta completa con todos sus datos relacionados
export const getVentaCompleta = async (ventaId: number | string): Promise<VentaCompletaResponse> => {
  const ventaResponse = await getVentaById(ventaId);
  
  // Hacer requests en paralelo para datos relacionados
  const [
    comentarios,
    linea_nueva,
    portabilidad,
    estados,
    correos
  ] = await Promise.allSettled([
    getComentariosByVenta(Number(ventaId)),
    getLineaNuevaByVenta(ventaId),
    getPortabilidadByVenta(ventaId),
    getEstadosByVenta(ventaId),
    ventaResponse.sap ? getCorreosByVenta(ventaResponse.sap) : Promise.resolve([])
  ]);
  
  return {
    venta: ventaResponse,
    comentarios: comentarios.status === 'fulfilled' ? comentarios.value : [],
    linea_nueva: linea_nueva.status === 'fulfilled' ? linea_nueva.value : undefined,
    portabilidad: portabilidad.status === 'fulfilled' ? portabilidad.value : undefined,
    estados: estados.status === 'fulfilled' ? estados.value : [],
    correos: correos.status === 'fulfilled' ? correos.value : []
  };
};

export type {
  VentaDetalleResponse,
  LineaNuevaResponse,
  PortabilidadResponse,
  EstadoVentaResponse,
  CorreoVentaResponse,
  VentaCompletaResponse
};