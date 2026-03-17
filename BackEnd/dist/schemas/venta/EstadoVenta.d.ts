import { z } from "zod";
export declare const EstadoVentaEnum: z.ZodEnum<["INICIAL", "REPACTAR", "AGENDADO", "APROBADO ABD", "CREADO SIN DOCU", "CREADO DOCU OK", "CREADO", "PENDIENTE DOCU/PIN", "PIN INGRESADO", "PENDIENTE CARGA PIN", "EVALUANDO DONANTE", "APROBADO", "ACTIVADO NRO PORTADO", "ACTIVADO NRO CLARO", "ACTIVADO", "EXITOSO", "RECHAZADO DONANTE", "RECHAZADO ABD", "CANCELADO", "SPN CANCELADA", "CLIENTE DESISTE"]>;
export declare const EstadoVentaSchema: z.ZodObject<{
    estado_id: z.ZodNumber;
    venta_id: z.ZodNumber;
    estado: z.ZodEnum<["INICIAL", "REPACTAR", "AGENDADO", "APROBADO ABD", "CREADO SIN DOCU", "CREADO DOCU OK", "CREADO", "PENDIENTE DOCU/PIN", "PIN INGRESADO", "PENDIENTE CARGA PIN", "EVALUANDO DONANTE", "APROBADO", "ACTIVADO NRO PORTADO", "ACTIVADO NRO CLARO", "ACTIVADO", "EXITOSO", "RECHAZADO DONANTE", "RECHAZADO ABD", "CANCELADO", "SPN CANCELADA", "CLIENTE DESISTE"]>;
    descripcion: z.ZodString;
    fecha_creacion: z.ZodDate;
    usuario_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    estado: "INICIAL" | "REPACTAR" | "AGENDADO" | "APROBADO ABD" | "CREADO SIN DOCU" | "CREADO DOCU OK" | "CREADO" | "PENDIENTE DOCU/PIN" | "PIN INGRESADO" | "PENDIENTE CARGA PIN" | "EVALUANDO DONANTE" | "APROBADO" | "ACTIVADO NRO PORTADO" | "ACTIVADO NRO CLARO" | "ACTIVADO" | "EXITOSO" | "RECHAZADO DONANTE" | "RECHAZADO ABD" | "CANCELADO" | "SPN CANCELADA" | "CLIENTE DESISTE";
    usuario_id: string;
    fecha_creacion: Date;
    venta_id: number;
    estado_id: number;
    descripcion: string;
}, {
    estado: "INICIAL" | "REPACTAR" | "AGENDADO" | "APROBADO ABD" | "CREADO SIN DOCU" | "CREADO DOCU OK" | "CREADO" | "PENDIENTE DOCU/PIN" | "PIN INGRESADO" | "PENDIENTE CARGA PIN" | "EVALUANDO DONANTE" | "APROBADO" | "ACTIVADO NRO PORTADO" | "ACTIVADO NRO CLARO" | "ACTIVADO" | "EXITOSO" | "RECHAZADO DONANTE" | "RECHAZADO ABD" | "CANCELADO" | "SPN CANCELADA" | "CLIENTE DESISTE";
    usuario_id: string;
    fecha_creacion: Date;
    venta_id: number;
    estado_id: number;
    descripcion: string;
}>;
export declare const EstadoVentaCreateSchema: z.ZodObject<Omit<{
    estado_id: z.ZodNumber;
    venta_id: z.ZodNumber;
    estado: z.ZodEnum<["INICIAL", "REPACTAR", "AGENDADO", "APROBADO ABD", "CREADO SIN DOCU", "CREADO DOCU OK", "CREADO", "PENDIENTE DOCU/PIN", "PIN INGRESADO", "PENDIENTE CARGA PIN", "EVALUANDO DONANTE", "APROBADO", "ACTIVADO NRO PORTADO", "ACTIVADO NRO CLARO", "ACTIVADO", "EXITOSO", "RECHAZADO DONANTE", "RECHAZADO ABD", "CANCELADO", "SPN CANCELADA", "CLIENTE DESISTE"]>;
    descripcion: z.ZodString;
    fecha_creacion: z.ZodDate;
    usuario_id: z.ZodString;
}, "fecha_creacion" | "estado_id">, "strip", z.ZodTypeAny, {
    estado: "INICIAL" | "REPACTAR" | "AGENDADO" | "APROBADO ABD" | "CREADO SIN DOCU" | "CREADO DOCU OK" | "CREADO" | "PENDIENTE DOCU/PIN" | "PIN INGRESADO" | "PENDIENTE CARGA PIN" | "EVALUANDO DONANTE" | "APROBADO" | "ACTIVADO NRO PORTADO" | "ACTIVADO NRO CLARO" | "ACTIVADO" | "EXITOSO" | "RECHAZADO DONANTE" | "RECHAZADO ABD" | "CANCELADO" | "SPN CANCELADA" | "CLIENTE DESISTE";
    usuario_id: string;
    venta_id: number;
    descripcion: string;
}, {
    estado: "INICIAL" | "REPACTAR" | "AGENDADO" | "APROBADO ABD" | "CREADO SIN DOCU" | "CREADO DOCU OK" | "CREADO" | "PENDIENTE DOCU/PIN" | "PIN INGRESADO" | "PENDIENTE CARGA PIN" | "EVALUANDO DONANTE" | "APROBADO" | "ACTIVADO NRO PORTADO" | "ACTIVADO NRO CLARO" | "ACTIVADO" | "EXITOSO" | "RECHAZADO DONANTE" | "RECHAZADO ABD" | "CANCELADO" | "SPN CANCELADA" | "CLIENTE DESISTE";
    usuario_id: string;
    venta_id: number;
    descripcion: string;
}>;
export declare const EstadoVentaUpdateSchema: z.ZodObject<{
    estado: z.ZodOptional<z.ZodEnum<["INICIAL", "REPACTAR", "AGENDADO", "APROBADO ABD", "CREADO SIN DOCU", "CREADO DOCU OK", "CREADO", "PENDIENTE DOCU/PIN", "PIN INGRESADO", "PENDIENTE CARGA PIN", "EVALUANDO DONANTE", "APROBADO", "ACTIVADO NRO PORTADO", "ACTIVADO NRO CLARO", "ACTIVADO", "EXITOSO", "RECHAZADO DONANTE", "RECHAZADO ABD", "CANCELADO", "SPN CANCELADA", "CLIENTE DESISTE"]>>;
    usuario_id: z.ZodOptional<z.ZodString>;
    fecha_creacion: z.ZodOptional<z.ZodDate>;
    venta_id: z.ZodOptional<z.ZodNumber>;
    descripcion: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    estado?: "INICIAL" | "REPACTAR" | "AGENDADO" | "APROBADO ABD" | "CREADO SIN DOCU" | "CREADO DOCU OK" | "CREADO" | "PENDIENTE DOCU/PIN" | "PIN INGRESADO" | "PENDIENTE CARGA PIN" | "EVALUANDO DONANTE" | "APROBADO" | "ACTIVADO NRO PORTADO" | "ACTIVADO NRO CLARO" | "ACTIVADO" | "EXITOSO" | "RECHAZADO DONANTE" | "RECHAZADO ABD" | "CANCELADO" | "SPN CANCELADA" | "CLIENTE DESISTE" | undefined;
    usuario_id?: string | undefined;
    fecha_creacion?: Date | undefined;
    venta_id?: number | undefined;
    descripcion?: string | undefined;
}, {
    estado?: "INICIAL" | "REPACTAR" | "AGENDADO" | "APROBADO ABD" | "CREADO SIN DOCU" | "CREADO DOCU OK" | "CREADO" | "PENDIENTE DOCU/PIN" | "PIN INGRESADO" | "PENDIENTE CARGA PIN" | "EVALUANDO DONANTE" | "APROBADO" | "ACTIVADO NRO PORTADO" | "ACTIVADO NRO CLARO" | "ACTIVADO" | "EXITOSO" | "RECHAZADO DONANTE" | "RECHAZADO ABD" | "CANCELADO" | "SPN CANCELADA" | "CLIENTE DESISTE" | undefined;
    usuario_id?: string | undefined;
    fecha_creacion?: Date | undefined;
    venta_id?: number | undefined;
    descripcion?: string | undefined;
}>;
export type EstadoVenta = z.infer<typeof EstadoVentaSchema>;
export type EstadoVentaCreate = z.infer<typeof EstadoVentaCreateSchema>;
export type EstadoVentaUpdate = z.infer<typeof EstadoVentaUpdateSchema>;
export type EstadoVentaEstado = z.infer<typeof EstadoVentaEnum>;
//# sourceMappingURL=EstadoVenta.d.ts.map