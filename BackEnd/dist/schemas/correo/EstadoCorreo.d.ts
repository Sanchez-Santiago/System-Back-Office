import { z } from "zod";
export declare const LogisticStatusEnum: z.ZodEnum<["INICIAL", "ASIGNADO", "EN TRANSITO", "INGRESADO CENTRO LOGISTICO - ECOMMERCE", "INGRESADO EN AGENCIA", "INGRESADO PICK UP CENTER UES", "DEVUELTO", "DEVUELTO AL CLIENTE", "ENTREGADO", "NO ENTREGADO", "RENDIDO AL CLIENTE", "RECLAMO UES"]>;
export declare const EstadoCorreoSchema: z.ZodObject<{
    estado_correo_id: z.ZodNumber;
    sap_id: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    estado: z.ZodEnum<["INICIAL", "ASIGNADO", "EN TRANSITO", "INGRESADO CENTRO LOGISTICO - ECOMMERCE", "INGRESADO EN AGENCIA", "INGRESADO PICK UP CENTER UES", "DEVUELTO", "DEVUELTO AL CLIENTE", "ENTREGADO", "NO ENTREGADO", "RENDIDO AL CLIENTE", "RECLAMO UES"]>;
    descripcion: z.ZodNullable<z.ZodString>;
    fecha_creacion: z.ZodDate;
    usuario_id: z.ZodString;
    ubicacion_actual: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    estado: "INICIAL" | "ASIGNADO" | "EN TRANSITO" | "INGRESADO CENTRO LOGISTICO - ECOMMERCE" | "INGRESADO EN AGENCIA" | "INGRESADO PICK UP CENTER UES" | "DEVUELTO" | "DEVUELTO AL CLIENTE" | "ENTREGADO" | "NO ENTREGADO" | "RENDIDO AL CLIENTE" | "RECLAMO UES";
    usuario_id: string;
    fecha_creacion: Date;
    descripcion: string | null;
    estado_correo_id: number;
    sap_id?: string | undefined;
    ubicacion_actual?: string | null | undefined;
}, {
    estado: "INICIAL" | "ASIGNADO" | "EN TRANSITO" | "INGRESADO CENTRO LOGISTICO - ECOMMERCE" | "INGRESADO EN AGENCIA" | "INGRESADO PICK UP CENTER UES" | "DEVUELTO" | "DEVUELTO AL CLIENTE" | "ENTREGADO" | "NO ENTREGADO" | "RENDIDO AL CLIENTE" | "RECLAMO UES";
    usuario_id: string;
    fecha_creacion: Date;
    descripcion: string | null;
    estado_correo_id: number;
    sap_id?: string | undefined;
    ubicacion_actual?: string | null | undefined;
}>;
export declare const EstadoCorreoCreateSchema: z.ZodObject<Omit<{
    estado_correo_id: z.ZodNumber;
    sap_id: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    estado: z.ZodEnum<["INICIAL", "ASIGNADO", "EN TRANSITO", "INGRESADO CENTRO LOGISTICO - ECOMMERCE", "INGRESADO EN AGENCIA", "INGRESADO PICK UP CENTER UES", "DEVUELTO", "DEVUELTO AL CLIENTE", "ENTREGADO", "NO ENTREGADO", "RENDIDO AL CLIENTE", "RECLAMO UES"]>;
    descripcion: z.ZodNullable<z.ZodString>;
    fecha_creacion: z.ZodDate;
    usuario_id: z.ZodString;
    ubicacion_actual: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "fecha_creacion" | "estado_correo_id">, "strip", z.ZodTypeAny, {
    estado: "INICIAL" | "ASIGNADO" | "EN TRANSITO" | "INGRESADO CENTRO LOGISTICO - ECOMMERCE" | "INGRESADO EN AGENCIA" | "INGRESADO PICK UP CENTER UES" | "DEVUELTO" | "DEVUELTO AL CLIENTE" | "ENTREGADO" | "NO ENTREGADO" | "RENDIDO AL CLIENTE" | "RECLAMO UES";
    usuario_id: string;
    descripcion: string | null;
    sap_id?: string | undefined;
    ubicacion_actual?: string | null | undefined;
}, {
    estado: "INICIAL" | "ASIGNADO" | "EN TRANSITO" | "INGRESADO CENTRO LOGISTICO - ECOMMERCE" | "INGRESADO EN AGENCIA" | "INGRESADO PICK UP CENTER UES" | "DEVUELTO" | "DEVUELTO AL CLIENTE" | "ENTREGADO" | "NO ENTREGADO" | "RENDIDO AL CLIENTE" | "RECLAMO UES";
    usuario_id: string;
    descripcion: string | null;
    sap_id?: string | undefined;
    ubicacion_actual?: string | null | undefined;
}>;
export declare const EstadoCorreoUpdateSchema: z.ZodObject<{
    estado: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    descripcion: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    ubicacion_actual: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    estado?: string | undefined;
    descripcion?: string | null | undefined;
    ubicacion_actual?: string | null | undefined;
}, {
    estado?: string | undefined;
    descripcion?: string | null | undefined;
    ubicacion_actual?: string | null | undefined;
}>;
export type EstadoCorreo = z.infer<typeof EstadoCorreoSchema>;
export type EstadoCorreoCreate = z.infer<typeof EstadoCorreoCreateSchema>;
export type EstadoCorreoUpdate = z.infer<typeof EstadoCorreoUpdateSchema>;
//# sourceMappingURL=EstadoCorreo.d.ts.map