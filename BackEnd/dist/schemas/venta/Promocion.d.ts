import { z } from "zod";
export declare const PromocionSchema: z.ZodObject<{
    promocion_id: z.ZodNumber;
    nombre: z.ZodEffects<z.ZodString, string, string>;
    beneficios: z.ZodOptional<z.ZodString>;
    empresa_origen_id: z.ZodNumber;
    fecha_creacion: z.ZodDefault<z.ZodOptional<z.ZodDate>>;
    descuento: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    fecha_terminacion: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    activo: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    nombre: string;
    fecha_creacion: Date;
    promocion_id: number;
    empresa_origen_id: number;
    activo: boolean;
    descuento: number;
    beneficios?: string | undefined;
    fecha_terminacion?: Date | null | undefined;
}, {
    nombre: string;
    promocion_id: number;
    empresa_origen_id: number;
    fecha_creacion?: Date | undefined;
    beneficios?: string | undefined;
    activo?: boolean | undefined;
    descuento?: number | undefined;
    fecha_terminacion?: Date | null | undefined;
}>;
export declare const PromocionCreateSchema: z.ZodObject<Omit<{
    promocion_id: z.ZodNumber;
    nombre: z.ZodEffects<z.ZodString, string, string>;
    beneficios: z.ZodOptional<z.ZodString>;
    empresa_origen_id: z.ZodNumber;
    fecha_creacion: z.ZodDefault<z.ZodOptional<z.ZodDate>>;
    descuento: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    fecha_terminacion: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    activo: z.ZodDefault<z.ZodBoolean>;
}, "promocion_id">, "strip", z.ZodTypeAny, {
    nombre: string;
    fecha_creacion: Date;
    empresa_origen_id: number;
    activo: boolean;
    descuento: number;
    beneficios?: string | undefined;
    fecha_terminacion?: Date | null | undefined;
}, {
    nombre: string;
    empresa_origen_id: number;
    fecha_creacion?: Date | undefined;
    beneficios?: string | undefined;
    activo?: boolean | undefined;
    descuento?: number | undefined;
    fecha_terminacion?: Date | null | undefined;
}>;
export declare const PromocionUpdateSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    fecha_creacion: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodDate>>>;
    empresa_origen_id: z.ZodOptional<z.ZodNumber>;
    beneficios: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    activo: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    descuento: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodNumber>>>;
    fecha_terminacion: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodDate>>>;
}, "strip", z.ZodTypeAny, {
    nombre?: string | undefined;
    fecha_creacion?: Date | undefined;
    empresa_origen_id?: number | undefined;
    beneficios?: string | undefined;
    activo?: boolean | undefined;
    descuento?: number | undefined;
    fecha_terminacion?: Date | null | undefined;
}, {
    nombre?: string | undefined;
    fecha_creacion?: Date | undefined;
    empresa_origen_id?: number | undefined;
    beneficios?: string | undefined;
    activo?: boolean | undefined;
    descuento?: number | undefined;
    fecha_terminacion?: Date | null | undefined;
}>;
export type Promocion = z.infer<typeof PromocionSchema>;
export type PromocionCreate = z.infer<typeof PromocionCreateSchema>;
export type PromocionUpdate = z.infer<typeof PromocionUpdateSchema>;
//# sourceMappingURL=Promocion.d.ts.map