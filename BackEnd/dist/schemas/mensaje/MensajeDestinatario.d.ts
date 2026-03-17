import { z } from "zod";
export declare const MensajeDestinatarioSchema: z.ZodObject<{
    mensaje_id: z.ZodNumber;
    usuario_id: z.ZodString;
    leida: z.ZodDefault<z.ZodBoolean>;
    fecha_lectura: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    usuario_id: string;
    mensaje_id: number;
    leida: boolean;
    fecha_lectura?: Date | null | undefined;
}, {
    usuario_id: string;
    mensaje_id: number;
    leida?: boolean | undefined;
    fecha_lectura?: Date | null | undefined;
}>;
export declare const MarcarLeidoSchema: z.ZodObject<{
    leida: z.ZodDefault<z.ZodBoolean>;
    fecha_lectura: z.ZodOptional<z.ZodDefault<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    leida: boolean;
    fecha_lectura?: Date | undefined;
}, {
    leida?: boolean | undefined;
    fecha_lectura?: Date | undefined;
}>;
export declare const MensajeConEstadoSchema: z.ZodObject<{
    mensaje_id: z.ZodNumber;
    tipo: z.ZodEnum<["ALERTA", "NOTIFICACION"]>;
    titulo: z.ZodString;
    comentario: z.ZodString;
    fecha_creacion: z.ZodDate;
    resuelto: z.ZodNullable<z.ZodBoolean>;
    fecha_resolucion: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
    usuario_creador_id: z.ZodString;
    referencia_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    leida: z.ZodBoolean;
    fecha_lectura: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    fecha_creacion: Date;
    mensaje_id: number;
    tipo: "ALERTA" | "NOTIFICACION";
    titulo: string;
    comentario: string;
    resuelto: boolean | null;
    usuario_creador_id: string;
    leida: boolean;
    fecha_resolucion?: Date | null | undefined;
    referencia_id?: number | null | undefined;
    fecha_lectura?: Date | null | undefined;
}, {
    fecha_creacion: Date;
    mensaje_id: number;
    tipo: "ALERTA" | "NOTIFICACION";
    titulo: string;
    comentario: string;
    resuelto: boolean | null;
    usuario_creador_id: string;
    leida: boolean;
    fecha_resolucion?: Date | null | undefined;
    referencia_id?: number | null | undefined;
    fecha_lectura?: Date | null | undefined;
}>;
export type MensajeDestinatario = z.infer<typeof MensajeDestinatarioSchema>;
export type MarcarLeido = z.infer<typeof MarcarLeidoSchema>;
export type MensajeConEstado = z.infer<typeof MensajeConEstadoSchema>;
//# sourceMappingURL=MensajeDestinatario.d.ts.map