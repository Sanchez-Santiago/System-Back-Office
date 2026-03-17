import { z } from "zod";
export declare const CelulaSchema: z.ZodObject<{
    id_celula: z.ZodNumber;
    empresa: z.ZodNumber;
    nombre: z.ZodDefault<z.ZodString>;
    tipo_cuenta: z.ZodString;
}, "strip", z.ZodTypeAny, {
    nombre: string;
    empresa: number;
    id_celula: number;
    tipo_cuenta: string;
}, {
    empresa: number;
    id_celula: number;
    tipo_cuenta: string;
    nombre?: string | undefined;
}>;
export declare const CelulaCreateSchema: z.ZodObject<Omit<{
    id_celula: z.ZodNumber;
    empresa: z.ZodNumber;
    nombre: z.ZodDefault<z.ZodString>;
    tipo_cuenta: z.ZodString;
}, "id_celula">, "strip", z.ZodTypeAny, {
    nombre: string;
    empresa: number;
    tipo_cuenta: string;
}, {
    empresa: number;
    tipo_cuenta: string;
    nombre?: string | undefined;
}>;
export declare const CelulaUpdateSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    tipo_cuenta: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    nombre?: string | undefined;
    tipo_cuenta?: string | undefined;
}, {
    nombre?: string | undefined;
    tipo_cuenta?: string | undefined;
}>;
export type Celula = z.infer<typeof CelulaSchema>;
export type CelulaCreate = z.infer<typeof CelulaCreateSchema>;
export type CelulaUpdate = z.infer<typeof CelulaUpdateSchema>;
//# sourceMappingURL=Celula.d.ts.map