// ============================================
// ✅ NUEVO: BackEnd/src/schemas/Permisos.ts
// ============================================
import { z } from "zod";
export const PermisoSchema = z.object({
    permisos_id: z.number().int().positive(),
    nombre: z.string().min(1).max(45),
});
export const PermisoCreateSchema = PermisoSchema.omit({
    permisos_id: true,
});
//# sourceMappingURL=Permisos.js.map