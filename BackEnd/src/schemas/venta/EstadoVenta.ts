// ============================================
// BackEnd/src/schemas/venta/EstadoVenta.ts
// ============================================
import { z } from "zod";

export const EstadoVentaEnum = z.enum([
  "PENDIENTE_DE_CARGA",
  "CREADO_SIN_DOCU",
  "CREADO_DOCU_OK",
  "EN_TRANSPORTE",
  "ENTREGADO",
  "PENDIENTE_DE_PIN",
  "CANCELADO",
  "REPACTAR",
  "EN_REVISION",
  "APROBADO",
  "RECHAZADO",
]);

export const EstadoVentaSchema = z.object({
  estado_id: z.number().int().positive(),
  venta_id: z.number().int().positive(),
  estado: EstadoVentaEnum,
  descripcion: z.string().max(75),
  fecha_creacion: z.coerce.date(),
  usuario_id: z.string().uuid(),
});

export const EstadoVentaCreateSchema = EstadoVentaSchema.omit({
  estado_id: true,
});

export const EstadoVentaUpdateSchema = EstadoVentaSchema.omit({
  estado_id: true,
}).partial();

export type EstadoVenta = z.infer<typeof EstadoVentaSchema>;
export type EstadoVentaCreate = z.infer<typeof EstadoVentaCreateSchema>;
export type EstadoVentaUpdate = z.infer<typeof EstadoVentaUpdateSchema>;
export type EstadoVentaEstado = z.infer<typeof EstadoVentaEnum>;