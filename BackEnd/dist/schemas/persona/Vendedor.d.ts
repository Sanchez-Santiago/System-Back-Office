import { z } from "zod";
export declare const VendedorSchema: z.ZodObject<{
    vendedor_id: z.ZodNumber;
    usuario: z.ZodString;
}, "strip", z.ZodTypeAny, {
    usuario: string;
    vendedor_id: number;
}, {
    usuario: string;
    vendedor_id: number;
}>;
export declare const VendedorCreateSchema: z.ZodObject<{
    usuario: z.ZodString;
}, "strip", z.ZodTypeAny, {
    usuario: string;
}, {
    usuario: string;
}>;
export declare const VendedorResponseSchema: z.ZodObject<{
    vendedor_id: z.ZodNumber;
    usuario: z.ZodString;
} & {
    legajo: z.ZodString;
    nombre: z.ZodString;
    apellido: z.ZodString;
    email: z.ZodString;
    telefono: z.ZodOptional<z.ZodString>;
    estado: z.ZodEnum<["ACTIVO", "INACTIVO"]>;
}, "strip", z.ZodTypeAny, {
    nombre: string;
    apellido: string;
    email: string;
    legajo: string;
    estado: "ACTIVO" | "INACTIVO";
    usuario: string;
    vendedor_id: number;
    telefono?: string | undefined;
}, {
    nombre: string;
    apellido: string;
    email: string;
    legajo: string;
    estado: "ACTIVO" | "INACTIVO";
    usuario: string;
    vendedor_id: number;
    telefono?: string | undefined;
}>;
export type Vendedor = z.infer<typeof VendedorSchema>;
export type VendedorCreate = z.infer<typeof VendedorCreateSchema>;
export type VendedorResponse = z.infer<typeof VendedorResponseSchema>;
//# sourceMappingURL=Vendedor.d.ts.map