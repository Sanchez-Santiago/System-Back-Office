// Empresa.ts
import { z } from "zod";

export const EmpresaSchema = z.object({
  id_empresa: z.number().int().positive(),
  nombre: z.string().min(1).max(45),
  cuit: z.string()
    .max(45)
    .regex(/^\d{2}-\d{8}-\d{1}$/, "Formato de CUIT inválido (XX-XXXXXXXX-X)"),
  entidad: z.number().int(),
});

export const EmpresaCreateSchema = EmpresaSchema.omit({
  id_empresa: true,
});

export const EmpresaUpdateSchema = EmpresaSchema.omit({
  id_empresa: true,
}).partial();

export type Empresa = z.infer<typeof EmpresaSchema>;
export type EmpresaCreate = z.infer<typeof EmpresaCreateSchema>;
export type EmpresaUpdate = z.infer<typeof EmpresaUpdateSchema>;
