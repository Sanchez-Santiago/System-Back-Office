// LineaNueva.ts
import { z } from "zod";
export const EstadoLineaNuevaEnum = z.enum([
    "ACTIVADA",
    "CANCELADA",
    "PENDIENTE",
]);
export const LineaNuevaSchema = z.object({
    venta: z.number().int().positive(),
});
export const LineaNuevaCreateSchema = LineaNuevaSchema.omit({});
export const LineaNuevaUpdateSchema = LineaNuevaSchema.omit({
    venta: true,
}).partial();
//# sourceMappingURL=LineaNueva.js.map