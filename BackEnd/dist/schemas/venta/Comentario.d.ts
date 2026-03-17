import { z } from "zod";
export declare const TipoComentarioEnum: z.ZodEnum<["GENERAL", "IMPORTANTE", "SISTEMA", "SEGUIMIENTO"]>;
export declare const ComentarioSchema: z.ZodObject<{
    comentario_id: z.ZodNumber;
    titulo: z.ZodString;
    comentario: z.ZodString;
    fecha_creacion: z.ZodDate;
    venta_id: z.ZodNumber;
    usuarios_id: z.ZodString;
    tipo_comentario: z.ZodEnum<["GENERAL", "IMPORTANTE", "SISTEMA", "SEGUIMIENTO"]>;
}, "strip", z.ZodTypeAny, {
    fecha_creacion: Date;
    venta_id: number;
    titulo: string;
    comentario: string;
    comentario_id: number;
    usuarios_id: string;
    tipo_comentario: "GENERAL" | "IMPORTANTE" | "SISTEMA" | "SEGUIMIENTO";
}, {
    fecha_creacion: Date;
    venta_id: number;
    titulo: string;
    comentario: string;
    comentario_id: number;
    usuarios_id: string;
    tipo_comentario: "GENERAL" | "IMPORTANTE" | "SISTEMA" | "SEGUIMIENTO";
}>;
export declare const ComentarioCreateSchema: z.ZodObject<Omit<{
    comentario_id: z.ZodNumber;
    titulo: z.ZodString;
    comentario: z.ZodString;
    fecha_creacion: z.ZodDate;
    venta_id: z.ZodNumber;
    usuarios_id: z.ZodString;
    tipo_comentario: z.ZodEnum<["GENERAL", "IMPORTANTE", "SISTEMA", "SEGUIMIENTO"]>;
}, "fecha_creacion" | "comentario_id"> & {
    fecha_creacion: z.ZodOptional<z.ZodDefault<z.ZodDate>>;
}, "strip", z.ZodTypeAny, {
    venta_id: number;
    titulo: string;
    comentario: string;
    usuarios_id: string;
    tipo_comentario: "GENERAL" | "IMPORTANTE" | "SISTEMA" | "SEGUIMIENTO";
    fecha_creacion?: Date | undefined;
}, {
    venta_id: number;
    titulo: string;
    comentario: string;
    usuarios_id: string;
    tipo_comentario: "GENERAL" | "IMPORTANTE" | "SISTEMA" | "SEGUIMIENTO";
    fecha_creacion?: Date | undefined;
}>;
export declare const ComentarioUpdateSchema: z.ZodObject<{
    titulo: z.ZodOptional<z.ZodString>;
    comentario: z.ZodOptional<z.ZodString>;
    tipo_comentario: z.ZodOptional<z.ZodEnum<["GENERAL", "IMPORTANTE", "SISTEMA", "SEGUIMIENTO"]>>;
}, "strip", z.ZodTypeAny, {
    titulo?: string | undefined;
    comentario?: string | undefined;
    tipo_comentario?: "GENERAL" | "IMPORTANTE" | "SISTEMA" | "SEGUIMIENTO" | undefined;
}, {
    titulo?: string | undefined;
    comentario?: string | undefined;
    tipo_comentario?: "GENERAL" | "IMPORTANTE" | "SISTEMA" | "SEGUIMIENTO" | undefined;
}>;
export declare const ComentarioConUsuarioSchema: z.ZodObject<{
    comentario_id: z.ZodNumber;
    titulo: z.ZodString;
    comentario: z.ZodString;
    fecha_creacion: z.ZodDate;
    venta_id: z.ZodNumber;
    usuarios_id: z.ZodString;
    tipo_comentario: z.ZodEnum<["GENERAL", "IMPORTANTE", "SISTEMA", "SEGUIMIENTO"]>;
} & {
    usuario_nombre: z.ZodString;
    usuario_apellido: z.ZodString;
    usuario_legajo: z.ZodString;
    usuario_rol: z.ZodString;
}, "strip", z.ZodTypeAny, {
    fecha_creacion: Date;
    venta_id: number;
    titulo: string;
    comentario: string;
    comentario_id: number;
    usuarios_id: string;
    tipo_comentario: "GENERAL" | "IMPORTANTE" | "SISTEMA" | "SEGUIMIENTO";
    usuario_nombre: string;
    usuario_apellido: string;
    usuario_legajo: string;
    usuario_rol: string;
}, {
    fecha_creacion: Date;
    venta_id: number;
    titulo: string;
    comentario: string;
    comentario_id: number;
    usuarios_id: string;
    tipo_comentario: "GENERAL" | "IMPORTANTE" | "SISTEMA" | "SEGUIMIENTO";
    usuario_nombre: string;
    usuario_apellido: string;
    usuario_legajo: string;
    usuario_rol: string;
}>;
export type TipoComentario = z.infer<typeof TipoComentarioEnum>;
export type Comentario = z.infer<typeof ComentarioSchema>;
export type ComentarioCreate = z.infer<typeof ComentarioCreateSchema>;
export type ComentarioUpdate = z.infer<typeof ComentarioUpdateSchema>;
export type ComentarioConUsuario = z.infer<typeof ComentarioConUsuarioSchema>;
//# sourceMappingURL=Comentario.d.ts.map