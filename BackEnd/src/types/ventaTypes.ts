import { VentaCreate, VentaUpdate } from "../schemas/venta/Venta.ts";
import { CorreoCreate } from "../schemas/correo/Correo.ts";
import { PortabilidadCreate } from "../schemas/venta/Portabilidad.ts";

export interface VentaRequest {
  venta: Omit<VentaCreate, "vendedor_id">;
  correo?: CorreoCreate;
  portabilidad?: PortabilidadCreate;
}

export interface VentaResponse {
  success: boolean;
  data?: VentaCreate & { venta_id: number };
  message?: string;
  errors?: { field: string; message: string }[];
  pagination?: { page: number; limit: number; total: number };
}

export interface PaginationQuery {
  page: number;
  limit: number;
}

export interface DateRangeQuery {
  start: Date;
  end: Date;
}

export interface VentaUpdateRequest {
  id: string;
  venta: VentaUpdate;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}
