import { z } from "zod";
export declare const EstadoLineaNuevaEnum: z.ZodEnum<["ACTIVADA", "CANCELADA", "PENDIENTE"]>;
export declare const LineaNuevaSchema: z.ZodObject<{
    venta: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    venta: number;
}, {
    venta: number;
}>;
export declare const LineaNuevaCreateSchema: z.ZodObject<Omit<{
    venta: z.ZodNumber;
}, never>, "strip", z.ZodTypeAny, {
    venta: number;
}, {
    venta: number;
}>;
export declare const LineaNuevaUpdateSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type LineaNueva = z.infer<typeof LineaNuevaSchema>;
export type LineaNuevaCreate = z.infer<typeof LineaNuevaCreateSchema>;
export type LineaNuevaUpdate = z.infer<typeof LineaNuevaUpdateSchema>;
export type EstadoLineaNueva = z.infer<typeof EstadoLineaNuevaEnum>;
//# sourceMappingURL=LineaNueva.d.ts.map