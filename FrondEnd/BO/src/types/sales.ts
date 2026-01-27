// src/types/sales.ts
export type ChipType = "SIM" | "ESIM";
export type SaleType = "PORTABILIDAD" | "LINEA_NUEVA";
export type SaleStatus = "Completada" | "Pendiente" | "Cancelada";

// Interfaces para la estructura completa de ventas
export interface Correo {
  sap_id: string;
  telefono_contacto: string;
  telefono_alternativo?: string;
  destinatario: string;
  persona_autorizada?: string;
  direccion: string;
  numero_casa: number;
  entre_calles?: string;
  barrio?: string;
  localidad: string;
  departamento: string;
  codigo_postal: number;
}

export interface CorreoCreate {
  telefono_contacto: string;
  telefono_alternativo?: string;
  destinatario: string;
  persona_autorizada?: string;
  direccion: string;
  numero_casa: number;
  entre_calles?: string;
  barrio?: string;
  localidad: string;
  departamento: string;
  codigo_postal: number;
}

export interface Portabilidad {
  spn: string;
  empresa_origen_id: number;
  mercado_origen: string;
  numero_porta: string;
  pin: number;
}

export interface PortabilidadCreate {
  spn: string;
  empresa_origen_id: number;
  mercado_origen: string;
  numero_porta: string;
  pin: number;
}

export interface Sale {
  venta_id: number;
  sds: string;
  chip: ChipType;
  tipo_venta: SaleType;
  stl?: string | null;
  sap?: string | null;
  cliente_id: string;
  vendedor_id: string;
  multiple: number;
  plan_id: number;
  empresa_origen_id: number;
  promocion_id?: number | null;
  fecha_creacion: string;
  fecha_modificacion?: string | null;
  // Related data from backend
  cliente_nombre: string;
  cliente_apellido: string;
  vendedor_nombre: string;
  vendedor_apellido: string;
  plan_nombre: string;
  plan_precio: number;
  promocion_nombre?: string;
  estado_actual?: string;
}

export interface SaleCreate {
  sds: string;
  chip: ChipType;
  tipo_venta: SaleType;
  stl?: string;
  sap?: string;
  cliente_id: string;
  multiple?: number;
  plan_id: number;
  empresa_origen_id: number;
  promocion_id?: number;
}

// Interface para la creación completa de ventas
export interface SaleCreateRequest {
  venta: SaleCreate;
  correo: CorreoCreate;
  portabilidad?: PortabilidadCreate;
}

export interface SaleUpdate extends Partial<SaleCreate> {}

export interface SalesResponse {
  success: boolean;
  data: Sale[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SalesStats {
  totalVentas: number;
  ventasPorPlan: Array<{ plan_id: number; plan_nombre: string; cantidad: number }>;
  ventasPorVendedor: Array<{ vendedor_id: string; vendedor_nombre: string; cantidad: number }>;
  ventasPorMes: Array<{ mes: string; cantidad: number }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}