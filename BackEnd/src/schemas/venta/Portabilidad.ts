// Portabilidad.ts
import { z } from "zod";

export const EstadoPortabilidadEnum = z.enum(['ACTIVADA', 'CANCELADA', 'PENDIENTE']);

export const PortabilidadSchema = z.object({
  venta: z.number().int().positive(), // FK a venta.idventa (PK)
  spn: z.string().max(20),
  empresa_origen: z.string().max(45),
  mercado_origen: z.string().max(45),
  numero_porta: z.string().max(20),
  pin: z.number().int().nullable().optional(),
  numero_gestor: z.string().max(20).nullable().optional(),
  estado: EstadoPortabilidadEnum.default('PENDIENTE'),
});

export const PortabilidadCreateSchema = PortabilidadSchema.omit({
  estado: true,
});

export const PortabilidadUpdateSchema = PortabilidadSchema.omit({
  venta: true,
}).partial();

export type EstadoPortabilidad = z.infer<typeof EstadoPortabilidadEnum>;

export type Portabilidad = z.infer<typeof PortabilidadSchema>;
export type PortabilidadCreate = z.infer<typeof PortabilidadCreateSchema>;
export type PortabilidadUpdate = z.infer<typeof PortabilidadUpdateSchema>;
