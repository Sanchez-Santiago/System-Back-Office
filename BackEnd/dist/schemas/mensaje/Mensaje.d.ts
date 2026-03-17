import { z } from "zod";
export declare const TipoMensajeEnum: z.ZodEnum<["ALERTA", "NOTIFICACION"]>;
export declare const TipoDestinatarioEnum: z.ZodEnum<["USUARIO", "ROL", "CELULA", "VENTA_RELACIONADA", "GLOBAL"]>;
export declare const MensajeSchema: z.ZodObject<{
    mensaje_id: z.ZodNumber;
    tipo: z.ZodEnum<["ALERTA", "NOTIFICACION"]>;
    titulo: z.ZodString;
    comentario: z.ZodString;
    fecha_creacion: z.ZodDate;
    resuelto: z.ZodNullable<z.ZodBoolean>;
    fecha_resolucion: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    usuario_creador_id: z.ZodString;
    referencia_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    fecha_creacion: Date;
    mensaje_id: number;
    tipo: "ALERTA" | "NOTIFICACION";
    titulo: string;
    comentario: string;
    resuelto: boolean | null;
    usuario_creador_id: string;
    fecha_resolucion?: Date | null | undefined;
    referencia_id?: number | null | undefined;
}, {
    fecha_creacion: Date;
    mensaje_id: number;
    tipo: "ALERTA" | "NOTIFICACION";
    titulo: string;
    comentario: string;
    resuelto: boolean | null;
    usuario_creador_id: string;
    fecha_resolucion?: Date | null | undefined;
    referencia_id?: number | null | undefined;
}>;
export declare const MensajeCreateSchema: z.ZodObject<Omit<{
    mensaje_id: z.ZodNumber;
    tipo: z.ZodEnum<["ALERTA", "NOTIFICACION"]>;
    titulo: z.ZodString;
    comentario: z.ZodString;
    fecha_creacion: z.ZodDate;
    resuelto: z.ZodNullable<z.ZodBoolean>;
    fecha_resolucion: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    usuario_creador_id: z.ZodString;
    referencia_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "fecha_creacion" | "mensaje_id" | "resuelto" | "fecha_resolucion"> & {
    destinatarios: z.ZodOptional<z.ZodObject<{
        tipo: z.ZodEnum<["USUARIO", "ROL", "CELULA", "VENTA_RELACIONADA", "GLOBAL"]>;
        valor: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        tipo: "USUARIO" | "ROL" | "CELULA" | "VENTA_RELACIONADA" | "GLOBAL";
        valor?: string | undefined;
    }, {
        tipo: "USUARIO" | "ROL" | "CELULA" | "VENTA_RELACIONADA" | "GLOBAL";
        valor?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    tipo: "ALERTA" | "NOTIFICACION";
    titulo: string;
    comentario: string;
    usuario_creador_id: string;
    referencia_id?: number | null | undefined;
    destinatarios?: {
        tipo: "USUARIO" | "ROL" | "CELULA" | "VENTA_RELACIONADA" | "GLOBAL";
        valor?: string | undefined;
    } | undefined;
}, {
    tipo: "ALERTA" | "NOTIFICACION";
    titulo: string;
    comentario: string;
    usuario_creador_id: string;
    referencia_id?: number | null | undefined;
    destinatarios?: {
        tipo: "USUARIO" | "ROL" | "CELULA" | "VENTA_RELACIONADA" | "GLOBAL";
        valor?: string | undefined;
    } | undefined;
}>;
export declare const MensajeUpdateSchema: z.ZodObject<{
    titulo: z.ZodOptional<z.ZodString>;
    comentario: z.ZodOptional<z.ZodString>;
    resuelto: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    titulo?: string | undefined;
    comentario?: string | undefined;
    resuelto?: boolean | undefined;
}, {
    titulo?: string | undefined;
    comentario?: string | undefined;
    resuelto?: boolean | undefined;
}>;
export declare const ResolverAlertaSchema: z.ZodObject<{
    mensaje_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    mensaje_id: number;
}, {
    mensaje_id: number;
}>;
export type TipoMensaje = z.infer<typeof TipoMensajeEnum>;
export type TipoDestinatario = z.infer<typeof TipoDestinatarioEnum>;
export type Mensaje = z.infer<typeof MensajeSchema>;
export type MensajeCreate = z.infer<typeof MensajeCreateSchema>;
export type MensajeUpdate = z.infer<typeof MensajeUpdateSchema>;
//# sourceMappingURL=Mensaje.d.ts.map