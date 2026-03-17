import { z } from "zod";
export declare const EmpresaSchema: z.ZodObject<{
    id_empresa: z.ZodNumber;
    nombre: z.ZodString;
    cuit: z.ZodString;
    entidad: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    nombre: string;
    cuit: string;
    entidad: number;
    id_empresa: number;
}, {
    nombre: string;
    cuit: string;
    entidad: number;
    id_empresa: number;
}>;
export declare const EmpresaCreateSchema: z.ZodObject<Omit<{
    id_empresa: z.ZodNumber;
    nombre: z.ZodString;
    cuit: z.ZodString;
    entidad: z.ZodNumber;
}, "id_empresa">, "strip", z.ZodTypeAny, {
    nombre: string;
    cuit: string;
    entidad: number;
}, {
    nombre: string;
    cuit: string;
    entidad: number;
}>;
export declare const EmpresaUpdateSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodString>;
    cuit: z.ZodOptional<z.ZodString>;
    entidad: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    nombre?: string | undefined;
    cuit?: string | undefined;
    entidad?: number | undefined;
}, {
    nombre?: string | undefined;
    cuit?: string | undefined;
    entidad?: number | undefined;
}>;
export type Empresa = z.infer<typeof EmpresaSchema>;
export type EmpresaCreate = z.infer<typeof EmpresaCreateSchema>;
export type EmpresaUpdate = z.infer<typeof EmpresaUpdateSchema>;
//# sourceMappingURL=Empresa.d.ts.map