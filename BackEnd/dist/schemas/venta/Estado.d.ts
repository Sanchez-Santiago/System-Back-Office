import { z } from "zod";
export declare const EstadoVentaEnum: z.ZodEnum<["INICIAL", "EN_PROCESO", "PENDIENTE_DOCUMENTACION", "APROBADO", "ACTIVADO", "RECHAZADO", "CANCELADO"]>;
export declare const EstadosSchema: z.ZodObject<{
    estado_id: z.ZodNumber;
    venta_id: z.ZodNumber;
    estado: z.ZodDefault<z.ZodEnum<["INICIAL", "EN_PROCESO", "PENDIENTE_DOCUMENTACION", "APROBADO", "ACTIVADO", "RECHAZADO", "CANCELADO"]>>;
    descripcion: z.ZodString;
    fecha_creacion: z.ZodDate;
    usuario_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    estado: "INICIAL" | "APROBADO" | "ACTIVADO" | "CANCELADO" | "EN_PROCESO" | "PENDIENTE_DOCUMENTACION" | "RECHAZADO";
    usuario_id: string;
    fecha_creacion: Date;
    venta_id: number;
    estado_id: number;
    descripcion: string;
}, {
    usuario_id: string;
    fecha_creacion: Date;
    venta_id: number;
    estado_id: number;
    descripcion: string;
    estado?: "INICIAL" | "APROBADO" | "ACTIVADO" | "CANCELADO" | "EN_PROCESO" | "PENDIENTE_DOCUMENTACION" | "RECHAZADO" | undefined;
}>;
export declare const EstadosCreateSchema: z.ZodObject<Omit<{
    estado_id: z.ZodNumber;
    venta_id: z.ZodNumber;
    estado: z.ZodDefault<z.ZodEnum<["INICIAL", "EN_PROCESO", "PENDIENTE_DOCUMENTACION", "APROBADO", "ACTIVADO", "RECHAZADO", "CANCELADO"]>>;
    descripcion: z.ZodString;
    fecha_creacion: z.ZodDate;
    usuario_id: z.ZodString;
}, "fecha_creacion" | "estado_id"> & {
    fecha_creacion: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    estado: "INICIAL" | "APROBADO" | "ACTIVADO" | "CANCELADO" | "EN_PROCESO" | "PENDIENTE_DOCUMENTACION" | "RECHAZADO";
    usuario_id: string;
    fecha_creacion: Date;
    venta_id: number;
    descripcion: string;
}, {
    usuario_id: string;
    venta_id: number;
    descripcion: string;
    estado?: "INICIAL" | "APROBADO" | "ACTIVADO" | "CANCELADO" | "EN_PROCESO" | "PENDIENTE_DOCUMENTACION" | "RECHAZADO" | undefined;
    fecha_creacion?: Date | undefined;
}>;
export declare const EstadosUpdateSchema: z.ZodObject<{
    estado: z.ZodOptional<z.ZodDefault<z.ZodEnum<["INICIAL", "EN_PROCESO", "PENDIENTE_DOCUMENTACION", "APROBADO", "ACTIVADO", "RECHAZADO", "CANCELADO"]>>>;
    usuario_id: z.ZodOptional<z.ZodString>;
    fecha_creacion: z.ZodOptional<z.ZodDate>;
    descripcion: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    estado?: "INICIAL" | "APROBADO" | "ACTIVADO" | "CANCELADO" | "EN_PROCESO" | "PENDIENTE_DOCUMENTACION" | "RECHAZADO" | undefined;
    usuario_id?: string | undefined;
    fecha_creacion?: Date | undefined;
    descripcion?: string | undefined;
}, {
    estado?: "INICIAL" | "APROBADO" | "ACTIVADO" | "CANCELADO" | "EN_PROCESO" | "PENDIENTE_DOCUMENTACION" | "RECHAZADO" | undefined;
    usuario_id?: string | undefined;
    fecha_creacion?: Date | undefined;
    descripcion?: string | undefined;
}>;
export type Estados = z.infer<typeof EstadosSchema>;
export type EstadosCreate = z.infer<typeof EstadosCreateSchema>;
export type EstadosUpdate = z.infer<typeof EstadosUpdateSchema>;
export type EstadoVenta = z.infer<typeof EstadoVentaEnum>;
//# sourceMappingURL=Estado.d.ts.map