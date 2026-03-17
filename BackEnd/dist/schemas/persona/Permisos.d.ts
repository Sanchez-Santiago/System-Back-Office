import { z } from "zod";
export declare const PermisoSchema: z.ZodObject<{
    permisos_id: z.ZodNumber;
    nombre: z.ZodString;
}, "strip", z.ZodTypeAny, {
    nombre: string;
    permisos_id: number;
}, {
    nombre: string;
    permisos_id: number;
}>;
export declare const PermisoCreateSchema: z.ZodObject<Omit<{
    permisos_id: z.ZodNumber;
    nombre: z.ZodString;
}, "permisos_id">, "strip", z.ZodTypeAny, {
    nombre: string;
}, {
    nombre: string;
}>;
export type Permiso = z.infer<typeof PermisoSchema>;
export type PermisoCreate = z.infer<typeof PermisoCreateSchema>;
//# sourceMappingURL=Permisos.d.ts.map