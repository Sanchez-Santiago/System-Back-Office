// BackEnd/src/schemas/empresa/Empresa.ts
import { z } from "zod";
export const EmpresaSchema = z.object({
    id_empresa: z.number().int().positive(),
    nombre: z.string().min(1).max(45),
    cuit: z.string().min(1).max(45),
    entidad: z.number().int(),
});
export const EmpresaCreateSchema = EmpresaSchema.omit({
    id_empresa: true,
});
export const EmpresaUpdateSchema = EmpresaSchema.omit({
    id_empresa: true,
}).partial();
//# sourceMappingURL=Empresa.js.map