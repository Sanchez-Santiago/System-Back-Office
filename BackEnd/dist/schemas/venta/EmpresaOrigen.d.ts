import { z } from "zod";
export declare const EmpresaOrigenSchema: z.ZodObject<{
    empresa_origen_id: z.ZodNumber;
    nombre_empresa: z.ZodString;
    pais: z.ZodString;
}, "strip", z.ZodTypeAny, {
    empresa_origen_id: number;
    pais: string;
    nombre_empresa: string;
}, {
    empresa_origen_id: number;
    pais: string;
    nombre_empresa: string;
}>;
export declare const EmpresaOrigenCreateSchema: z.ZodObject<Omit<{
    empresa_origen_id: z.ZodNumber;
    nombre_empresa: z.ZodString;
    pais: z.ZodString;
}, "empresa_origen_id">, "strip", z.ZodTypeAny, {
    pais: string;
    nombre_empresa: string;
}, {
    pais: string;
    nombre_empresa: string;
}>;
export declare const EmpresaOrigenUpdateSchema: z.ZodObject<{
    pais: z.ZodOptional<z.ZodString>;
    nombre_empresa: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    pais?: string | undefined;
    nombre_empresa?: string | undefined;
}, {
    pais?: string | undefined;
    nombre_empresa?: string | undefined;
}>;
export type EmpresaOrigen = z.infer<typeof EmpresaOrigenSchema>;
export type EmpresaOrigenCreate = z.infer<typeof EmpresaOrigenCreateSchema>;
export type EmpresaOrigenUpdate = z.infer<typeof EmpresaOrigenUpdateSchema>;
//# sourceMappingURL=EmpresaOrigen.d.ts.map