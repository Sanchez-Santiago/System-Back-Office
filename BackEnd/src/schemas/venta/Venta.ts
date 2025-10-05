// Venta.ts
import { z } from "zod";

export const ChipEnum = z.enum(["sim", "esim"]);

export const VentaSchema = z.object({
  idventa: z.number().int().positive(),
  sds: z.string().max(15),
  stl: z.string().max(20),
  back_office: z.string().uuid(), // FK a back_office.usuario_id
  sap: z.string().max(25).nullable().optional(), // FK a correo.sap
  chip: ChipEnum,
  cliente: z.string().uuid(), // FK a cliente.persona_id
  vendedor: z.string().uuid(), // FK a vendedor.usuario
  plan: z.number().int().positive(), // FK a plan.idplan
  promocion: z.number().int().positive().nullable().optional(), // FK a promocion.idpromocion
});

export const VentaCreateSchema = VentaSchema.omit({
  idventa: true,
});

export const VentaUpdateSchema = VentaSchema.omit({
  idventa: true,
}).partial();

// Para respuestas con datos relacionados
export const VentaResponseSchema = VentaSchema.extend({
  cliente_nombre: z.string(),
  cliente_apellido: z.string(),
  vendedor_nombre: z.string(),
  vendedor_apellido: z.string(),
  plan_nombre: z.string(),
  plan_precio: z.number(),
  promocion_nombre: z.string().optional(),
  estado_actual: z.string().optional(),
});

export type Venta = z.infer<typeof VentaSchema>;
export type VentaCreate = z.infer<typeof VentaCreateSchema>;
export type VentaUpdate = z.infer<typeof VentaUpdateSchema>;
export type VentaResponse = z.infer<typeof VentaResponseSchema>;
export type ChipType = z.infer<typeof ChipEnum>;
