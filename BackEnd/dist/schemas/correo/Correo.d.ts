import { z } from "zod";
/**
 * Schema completo de Correo según la base de datos
 * Incluye TODOS los campos de la tabla correo
 */
export declare const CorreoSchema: z.ZodObject<{
    sap_id: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    sap: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | undefined, string | null | undefined>;
    telefono_contacto: z.ZodString;
    telefono_alternativo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    destinatario: z.ZodString;
    persona_autorizada: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    direccion: z.ZodString;
    numero_casa: z.ZodNumber;
    entre_calles: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    barrio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    localidad: z.ZodString;
    departamento: z.ZodString;
    codigo_postal: z.ZodNumber;
    fecha_creacion: z.ZodDate;
    fecha_limite: z.ZodDate;
    piso: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    departamento_numero: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    geolocalizacion: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    comentario_cartero: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    fecha_creacion: Date;
    telefono_contacto: string;
    destinatario: string;
    direccion: string;
    numero_casa: number;
    localidad: string;
    departamento: string;
    codigo_postal: number;
    fecha_limite: Date;
    telefono_alternativo?: string | null | undefined;
    sap?: string | undefined;
    sap_id?: string | undefined;
    persona_autorizada?: string | null | undefined;
    entre_calles?: string | null | undefined;
    barrio?: string | null | undefined;
    piso?: string | null | undefined;
    departamento_numero?: string | null | undefined;
    geolocalizacion?: string | null | undefined;
    comentario_cartero?: string | null | undefined;
}, {
    fecha_creacion: Date;
    telefono_contacto: string;
    destinatario: string;
    direccion: string;
    numero_casa: number;
    localidad: string;
    departamento: string;
    codigo_postal: number;
    fecha_limite: Date;
    telefono_alternativo?: string | null | undefined;
    sap?: string | null | undefined;
    sap_id?: string | undefined;
    persona_autorizada?: string | null | undefined;
    entre_calles?: string | null | undefined;
    barrio?: string | null | undefined;
    piso?: string | null | undefined;
    departamento_numero?: string | null | undefined;
    geolocalizacion?: string | null | undefined;
    comentario_cartero?: string | null | undefined;
}>;
/**
 * Schema para crear un correo nuevo
 * Omite campos autogenerados por la DB
 */
export declare const CorreoCreateSchema: z.ZodObject<Omit<{
    sap_id: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    sap: z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | undefined, string | null | undefined>;
    telefono_contacto: z.ZodString;
    telefono_alternativo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    destinatario: z.ZodString;
    persona_autorizada: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    direccion: z.ZodString;
    numero_casa: z.ZodNumber;
    entre_calles: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    barrio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    localidad: z.ZodString;
    departamento: z.ZodString;
    codigo_postal: z.ZodNumber;
    fecha_creacion: z.ZodDate;
    fecha_limite: z.ZodDate;
    piso: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    departamento_numero: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    geolocalizacion: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    comentario_cartero: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "fecha_creacion" | "fecha_limite"> & {
    usuario_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    telefono_contacto: string;
    destinatario: string;
    direccion: string;
    numero_casa: number;
    localidad: string;
    departamento: string;
    codigo_postal: number;
    telefono_alternativo?: string | null | undefined;
    usuario_id?: string | undefined;
    sap?: string | undefined;
    sap_id?: string | undefined;
    persona_autorizada?: string | null | undefined;
    entre_calles?: string | null | undefined;
    barrio?: string | null | undefined;
    piso?: string | null | undefined;
    departamento_numero?: string | null | undefined;
    geolocalizacion?: string | null | undefined;
    comentario_cartero?: string | null | undefined;
}, {
    telefono_contacto: string;
    destinatario: string;
    direccion: string;
    numero_casa: number;
    localidad: string;
    departamento: string;
    codigo_postal: number;
    telefono_alternativo?: string | null | undefined;
    usuario_id?: string | undefined;
    sap?: string | null | undefined;
    sap_id?: string | undefined;
    persona_autorizada?: string | null | undefined;
    entre_calles?: string | null | undefined;
    barrio?: string | null | undefined;
    piso?: string | null | undefined;
    departamento_numero?: string | null | undefined;
    geolocalizacion?: string | null | undefined;
    comentario_cartero?: string | null | undefined;
}>;
/**
 * Schema para actualizar un correo existente
 * - No se puede cambiar el sap_id (es la PK)
 * - No se puede cambiar fecha_creacion
 * - Todos los demás campos son opcionales
 */
export declare const CorreoUpdateSchema: z.ZodObject<{
    telefono_alternativo: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    sap: z.ZodOptional<z.ZodEffects<z.ZodOptional<z.ZodNullable<z.ZodString>>, string | undefined, string | null | undefined>>;
    telefono_contacto: z.ZodOptional<z.ZodString>;
    destinatario: z.ZodOptional<z.ZodString>;
    persona_autorizada: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    direccion: z.ZodOptional<z.ZodString>;
    numero_casa: z.ZodOptional<z.ZodNumber>;
    entre_calles: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    barrio: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    localidad: z.ZodOptional<z.ZodString>;
    departamento: z.ZodOptional<z.ZodString>;
    codigo_postal: z.ZodOptional<z.ZodNumber>;
    fecha_limite: z.ZodOptional<z.ZodDate>;
    piso: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    departamento_numero: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    geolocalizacion: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    comentario_cartero: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    telefono_alternativo?: string | null | undefined;
    sap?: string | undefined;
    telefono_contacto?: string | undefined;
    destinatario?: string | undefined;
    persona_autorizada?: string | null | undefined;
    direccion?: string | undefined;
    numero_casa?: number | undefined;
    entre_calles?: string | null | undefined;
    barrio?: string | null | undefined;
    localidad?: string | undefined;
    departamento?: string | undefined;
    codigo_postal?: number | undefined;
    fecha_limite?: Date | undefined;
    piso?: string | null | undefined;
    departamento_numero?: string | null | undefined;
    geolocalizacion?: string | null | undefined;
    comentario_cartero?: string | null | undefined;
}, {
    telefono_alternativo?: string | null | undefined;
    sap?: string | null | undefined;
    telefono_contacto?: string | undefined;
    destinatario?: string | undefined;
    persona_autorizada?: string | null | undefined;
    direccion?: string | undefined;
    numero_casa?: number | undefined;
    entre_calles?: string | null | undefined;
    barrio?: string | null | undefined;
    localidad?: string | undefined;
    departamento?: string | undefined;
    codigo_postal?: number | undefined;
    fecha_limite?: Date | undefined;
    piso?: string | null | undefined;
    departamento_numero?: string | null | undefined;
    geolocalizacion?: string | null | undefined;
    comentario_cartero?: string | null | undefined;
}>;
/**
 * Schema para validar parámetros de búsqueda/filtrado
 */
export declare const CorreoFilterSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    name: z.ZodOptional<z.ZodString>;
    localidad: z.ZodOptional<z.ZodString>;
    departamento: z.ZodOptional<z.ZodString>;
    codigo_postal: z.ZodOptional<z.ZodNumber>;
    fecha_desde: z.ZodOptional<z.ZodDate>;
    fecha_hasta: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    name?: string | undefined;
    localidad?: string | undefined;
    departamento?: string | undefined;
    codigo_postal?: number | undefined;
    fecha_desde?: Date | undefined;
    fecha_hasta?: Date | undefined;
}, {
    limit?: number | undefined;
    page?: number | undefined;
    name?: string | undefined;
    localidad?: string | undefined;
    departamento?: string | undefined;
    codigo_postal?: number | undefined;
    fecha_desde?: Date | undefined;
    fecha_hasta?: Date | undefined;
}>;
/**
 * Schema para búsqueda por SAP ID
 */
export declare const CorreoSapIdSchema: z.ZodObject<{
    sap_id: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    sap_id: string;
}, {
    sap_id: string;
}>;
/**
 * Schema para búsqueda por localidad
 */
export declare const CorreoLocalidadSchema: z.ZodObject<{
    localidad: z.ZodString;
}, "strip", z.ZodTypeAny, {
    localidad: string;
}, {
    localidad: string;
}>;
/**
 * Schema para búsqueda por departamento
 */
export declare const CorreoDepartamentoSchema: z.ZodObject<{
    departamento: z.ZodString;
}, "strip", z.ZodTypeAny, {
    departamento: string;
}, {
    departamento: string;
}>;
/**
 * Schema para búsqueda por código postal
 */
export declare const CorreoCodigoPostalSchema: z.ZodObject<{
    codigoPostal: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    codigoPostal: number;
}, {
    codigoPostal: number;
}>;
/**
 * Schema para obtener correos próximos a vencer
 */
export declare const CorreoProximosVencerSchema: z.ZodObject<{
    dias: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    dias: number;
}, {
    dias?: number | undefined;
}>;
export type Correo = z.infer<typeof CorreoSchema>;
export type CorreoCreate = z.infer<typeof CorreoCreateSchema>;
export type CorreoUpdate = z.infer<typeof CorreoUpdateSchema>;
export type CorreoFilter = z.infer<typeof CorreoFilterSchema>;
export type CorreoSapId = z.infer<typeof CorreoSapIdSchema>;
export type CorreoLocalidad = z.infer<typeof CorreoLocalidadSchema>;
export type CorreoDepartamento = z.infer<typeof CorreoDepartamentoSchema>;
export type CorreoCodigoPostal = z.infer<typeof CorreoCodigoPostalSchema>;
export type CorreoProximosVencer = z.infer<typeof CorreoProximosVencerSchema>;
/**
 * Valida que la fecha límite sea posterior a la fecha de creación
 */
export declare const validateFechas: (data: {
    fecha_creacion: Date;
    fecha_limite: Date;
}) => boolean;
/**
 * Valida formato de teléfono argentino (básico)
 */
export declare const validateTelefonoArgentino: (telefono: string) => boolean;
/**
 * Valida que el código postal sea válido para Argentina
 */
export declare const validateCodigoPostalArgentino: (cp: number) => boolean;
//# sourceMappingURL=Correo.d.ts.map