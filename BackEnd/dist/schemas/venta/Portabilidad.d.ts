import { z } from "zod";
export declare const PortabilidadSchema: z.ZodObject<{
    venta: z.ZodNumber;
    spn: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | null | undefined, string | null | undefined>;
    empresa_origen: z.ZodNumber;
    mercado_origen: z.ZodEffects<z.ZodString, string, string>;
    numero_portar: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    pin: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    fecha_vencimiento_pin: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    fecha_portacion: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    venta: number;
    empresa_origen: number;
    mercado_origen: string;
    spn?: string | null | undefined;
    numero_portar?: string | null | undefined;
    pin?: string | null | undefined;
    fecha_vencimiento_pin?: Date | null | undefined;
    fecha_portacion?: Date | undefined;
}, {
    venta: number;
    empresa_origen: number;
    mercado_origen: string;
    spn?: string | null | undefined;
    numero_portar?: string | null | undefined;
    pin?: string | null | undefined;
    fecha_vencimiento_pin?: Date | null | undefined;
    fecha_portacion?: Date | undefined;
}>;
export declare const PortabilidadCreateSchema: z.ZodObject<Omit<{
    venta: z.ZodNumber;
    spn: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | null | undefined, string | null | undefined>;
    empresa_origen: z.ZodNumber;
    mercado_origen: z.ZodEffects<z.ZodString, string, string>;
    numero_portar: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    pin: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    fecha_vencimiento_pin: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    fecha_portacion: z.ZodOptional<z.ZodDate>;
}, never>, "strip", z.ZodTypeAny, {
    venta: number;
    empresa_origen: number;
    mercado_origen: string;
    spn?: string | null | undefined;
    numero_portar?: string | null | undefined;
    pin?: string | null | undefined;
    fecha_vencimiento_pin?: Date | null | undefined;
    fecha_portacion?: Date | undefined;
}, {
    venta: number;
    empresa_origen: number;
    mercado_origen: string;
    spn?: string | null | undefined;
    numero_portar?: string | null | undefined;
    pin?: string | null | undefined;
    fecha_vencimiento_pin?: Date | null | undefined;
    fecha_portacion?: Date | undefined;
}>;
export declare const PortabilidadUpdateSchema: z.ZodObject<{
    spn: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | null | undefined, string | null | undefined>>;
    empresa_origen: z.ZodOptional<z.ZodNumber>;
    mercado_origen: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    numero_portar: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    pin: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    fecha_vencimiento_pin: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodDate>>>;
    fecha_portacion: z.ZodOptional<z.ZodOptional<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    spn?: string | null | undefined;
    empresa_origen?: number | undefined;
    mercado_origen?: string | undefined;
    numero_portar?: string | null | undefined;
    pin?: string | null | undefined;
    fecha_vencimiento_pin?: Date | null | undefined;
    fecha_portacion?: Date | undefined;
}, {
    spn?: string | null | undefined;
    empresa_origen?: number | undefined;
    mercado_origen?: string | undefined;
    numero_portar?: string | null | undefined;
    pin?: string | null | undefined;
    fecha_vencimiento_pin?: Date | null | undefined;
    fecha_portacion?: Date | undefined;
}>;
export type Portabilidad = z.infer<typeof PortabilidadSchema>;
export type PortabilidadCreate = z.infer<typeof PortabilidadCreateSchema>;
export type PortabilidadUpdate = z.infer<typeof PortabilidadUpdateSchema>;
//# sourceMappingURL=Portabilidad.d.ts.map