import { z } from "zod";
/**
 * ✅ Roles del sistema según nueva BD
 */
export declare const ROLES: z.ZodEnum<["ADMIN", "SUPERADMIN", "SUPERVISOR", "BACK_OFFICE", "VENDEDOR"]>;
/**
 * ✅ Permisos disponibles en el sistema
 */
export declare const PERMISOS: z.ZodEnum<["ADMIN", "SUPERADMIN", "VENDEDOR", "BACK_OFFICE", "SUPERVISOR"]>;
/**
 * Estados posibles de un usuario
 */
export declare const EstadoEnum: z.ZodEnum<["ACTIVO", "INACTIVO", "SUSPENDIDO"]>;
/**
 * ✅ ACTUALIZADO: Schema base de usuario SIN password_hash
 * La contraseña ahora está en la tabla password separada
 */
export declare const UsuarioBaseSchema: z.ZodObject<{
    persona_id: z.ZodString;
    legajo: z.ZodEffects<z.ZodString, string, string>;
    rol: z.ZodEnum<["ADMIN", "SUPERADMIN", "SUPERVISOR", "BACK_OFFICE", "VENDEDOR"]>;
    permisos: z.ZodArray<z.ZodEnum<["ADMIN", "SUPERADMIN", "VENDEDOR", "BACK_OFFICE", "SUPERVISOR"]>, "many">;
    exa: z.ZodEffects<z.ZodString, string, string>;
    celula: z.ZodNumber;
    estado: z.ZodDefault<z.ZodEnum<["ACTIVO", "INACTIVO", "SUSPENDIDO"]>>;
}, "strip", z.ZodTypeAny, {
    persona_id: string;
    legajo: string;
    rol: "ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR";
    permisos: ("ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR")[];
    exa: string;
    celula: number;
    estado: "ACTIVO" | "INACTIVO" | "SUSPENDIDO";
}, {
    persona_id: string;
    legajo: string;
    rol: "ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR";
    permisos: ("ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR")[];
    exa: string;
    celula: number;
    estado?: "ACTIVO" | "INACTIVO" | "SUSPENDIDO" | undefined;
}>;
/**
 * Schema completo de usuario (con datos de persona)
 * ✅ NO incluye password_hash
 */
export declare const UsuarioSchema: z.ZodObject<{
    persona_id: z.ZodString;
    legajo: z.ZodEffects<z.ZodString, string, string>;
    rol: z.ZodEnum<["ADMIN", "SUPERADMIN", "SUPERVISOR", "BACK_OFFICE", "VENDEDOR"]>;
    permisos: z.ZodArray<z.ZodEnum<["ADMIN", "SUPERADMIN", "VENDEDOR", "BACK_OFFICE", "SUPERVISOR"]>, "many">;
    exa: z.ZodEffects<z.ZodString, string, string>;
    celula: z.ZodNumber;
    estado: z.ZodDefault<z.ZodEnum<["ACTIVO", "INACTIVO", "SUSPENDIDO"]>>;
} & Pick<{
    id_persona: z.ZodString;
    nombre: z.ZodEffects<z.ZodString, string, string>;
    apellido: z.ZodEffects<z.ZodString, string, string>;
    fecha_nacimiento: z.ZodDate;
    documento: z.ZodString;
    email: z.ZodEffects<z.ZodString, string, string>;
    creado_en: z.ZodDefault<z.ZodDate>;
    telefono: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    telefono_alternativo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tipo_documento: z.ZodEffects<z.ZodString, string, string>;
    nacionalidad: z.ZodEffects<z.ZodString, string, string>;
    genero: z.ZodPipeline<z.ZodEffects<z.ZodString, string, string>, z.ZodEnum<["MASCULINO", "FEMENINO", "OTRO", "PREFIERO NO DECIR"]>>;
}, "nombre" | "apellido" | "fecha_nacimiento" | "documento" | "email" | "telefono" | "telefono_alternativo" | "tipo_documento" | "nacionalidad" | "genero">, "strip", z.ZodTypeAny, {
    nombre: string;
    apellido: string;
    fecha_nacimiento: Date;
    documento: string;
    email: string;
    tipo_documento: string;
    nacionalidad: string;
    genero: "MASCULINO" | "FEMENINO" | "OTRO" | "PREFIERO NO DECIR";
    persona_id: string;
    legajo: string;
    rol: "ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR";
    permisos: ("ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR")[];
    exa: string;
    celula: number;
    estado: "ACTIVO" | "INACTIVO" | "SUSPENDIDO";
    telefono?: string | null | undefined;
    telefono_alternativo?: string | null | undefined;
}, {
    nombre: string;
    apellido: string;
    fecha_nacimiento: Date;
    documento: string;
    email: string;
    tipo_documento: string;
    nacionalidad: string;
    genero: string;
    persona_id: string;
    legajo: string;
    rol: "ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR";
    permisos: ("ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR")[];
    exa: string;
    celula: number;
    telefono?: string | null | undefined;
    telefono_alternativo?: string | null | undefined;
    estado?: "ACTIVO" | "INACTIVO" | "SUSPENDIDO" | undefined;
}>;
/**
 * Schema para respuestas seguras (sin datos sensibles)
 */
export declare const UsuarioSecuritySchema: z.ZodObject<Pick<{
    persona_id: z.ZodString;
    legajo: z.ZodEffects<z.ZodString, string, string>;
    rol: z.ZodEnum<["ADMIN", "SUPERADMIN", "SUPERVISOR", "BACK_OFFICE", "VENDEDOR"]>;
    permisos: z.ZodArray<z.ZodEnum<["ADMIN", "SUPERADMIN", "VENDEDOR", "BACK_OFFICE", "SUPERVISOR"]>, "many">;
    exa: z.ZodEffects<z.ZodString, string, string>;
    celula: z.ZodNumber;
    estado: z.ZodDefault<z.ZodEnum<["ACTIVO", "INACTIVO", "SUSPENDIDO"]>>;
} & Pick<{
    id_persona: z.ZodString;
    nombre: z.ZodEffects<z.ZodString, string, string>;
    apellido: z.ZodEffects<z.ZodString, string, string>;
    fecha_nacimiento: z.ZodDate;
    documento: z.ZodString;
    email: z.ZodEffects<z.ZodString, string, string>;
    creado_en: z.ZodDefault<z.ZodDate>;
    telefono: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    telefono_alternativo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tipo_documento: z.ZodEffects<z.ZodString, string, string>;
    nacionalidad: z.ZodEffects<z.ZodString, string, string>;
    genero: z.ZodPipeline<z.ZodEffects<z.ZodString, string, string>, z.ZodEnum<["MASCULINO", "FEMENINO", "OTRO", "PREFIERO NO DECIR"]>>;
}, "nombre" | "apellido" | "fecha_nacimiento" | "documento" | "email" | "telefono" | "telefono_alternativo" | "tipo_documento" | "nacionalidad" | "genero">, "nombre" | "apellido" | "fecha_nacimiento" | "email" | "telefono" | "nacionalidad" | "persona_id" | "legajo" | "rol" | "permisos" | "exa" | "celula" | "estado">, "strip", z.ZodTypeAny, {
    nombre: string;
    apellido: string;
    fecha_nacimiento: Date;
    email: string;
    nacionalidad: string;
    persona_id: string;
    legajo: string;
    rol: "ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR";
    permisos: ("ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR")[];
    exa: string;
    celula: number;
    estado: "ACTIVO" | "INACTIVO" | "SUSPENDIDO";
    telefono?: string | null | undefined;
}, {
    nombre: string;
    apellido: string;
    fecha_nacimiento: Date;
    email: string;
    nacionalidad: string;
    persona_id: string;
    legajo: string;
    rol: "ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR";
    permisos: ("ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR")[];
    exa: string;
    celula: number;
    telefono?: string | null | undefined;
    estado?: "ACTIVO" | "INACTIVO" | "SUSPENDIDO" | undefined;
}>;
/**
 * ✅ Schema para CREAR usuario
 * NOTA IMPORTANTE: password_hash solo se usa aquí para crear el primer registro
 * en la tabla password. NO se almacena en la tabla usuario.
 */
export declare const UsuarioCreateSchema: z.ZodObject<Omit<{
    persona_id: z.ZodString;
    legajo: z.ZodEffects<z.ZodString, string, string>;
    rol: z.ZodEnum<["ADMIN", "SUPERADMIN", "SUPERVISOR", "BACK_OFFICE", "VENDEDOR"]>;
    permisos: z.ZodArray<z.ZodEnum<["ADMIN", "SUPERADMIN", "VENDEDOR", "BACK_OFFICE", "SUPERVISOR"]>, "many">;
    exa: z.ZodEffects<z.ZodString, string, string>;
    celula: z.ZodNumber;
    estado: z.ZodDefault<z.ZodEnum<["ACTIVO", "INACTIVO", "SUSPENDIDO"]>>;
} & Pick<{
    id_persona: z.ZodString;
    nombre: z.ZodEffects<z.ZodString, string, string>;
    apellido: z.ZodEffects<z.ZodString, string, string>;
    fecha_nacimiento: z.ZodDate;
    documento: z.ZodString;
    email: z.ZodEffects<z.ZodString, string, string>;
    creado_en: z.ZodDefault<z.ZodDate>;
    telefono: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    telefono_alternativo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tipo_documento: z.ZodEffects<z.ZodString, string, string>;
    nacionalidad: z.ZodEffects<z.ZodString, string, string>;
    genero: z.ZodPipeline<z.ZodEffects<z.ZodString, string, string>, z.ZodEnum<["MASCULINO", "FEMENINO", "OTRO", "PREFIERO NO DECIR"]>>;
}, "nombre" | "apellido" | "fecha_nacimiento" | "documento" | "email" | "telefono" | "telefono_alternativo" | "tipo_documento" | "nacionalidad" | "genero">, "persona_id"> & {
    password_hash: z.ZodString;
}, "strip", z.ZodTypeAny, {
    nombre: string;
    apellido: string;
    fecha_nacimiento: Date;
    documento: string;
    email: string;
    tipo_documento: string;
    nacionalidad: string;
    genero: "MASCULINO" | "FEMENINO" | "OTRO" | "PREFIERO NO DECIR";
    legajo: string;
    rol: "ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR";
    permisos: ("ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR")[];
    exa: string;
    celula: number;
    estado: "ACTIVO" | "INACTIVO" | "SUSPENDIDO";
    password_hash: string;
    telefono?: string | null | undefined;
    telefono_alternativo?: string | null | undefined;
}, {
    nombre: string;
    apellido: string;
    fecha_nacimiento: Date;
    documento: string;
    email: string;
    tipo_documento: string;
    nacionalidad: string;
    genero: string;
    legajo: string;
    rol: "ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR";
    permisos: ("ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR")[];
    exa: string;
    celula: number;
    password_hash: string;
    telefono?: string | null | undefined;
    telefono_alternativo?: string | null | undefined;
    estado?: "ACTIVO" | "INACTIVO" | "SUSPENDIDO" | undefined;
}>;
/**
 * Schema para ACTUALIZAR usuario
 * ✅ NO incluye password_hash (se actualiza via AuthService)
 */
export declare const UsuarioUpdateSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    apellido: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    fecha_nacimiento: z.ZodOptional<z.ZodDate>;
    documento: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    telefono: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    telefono_alternativo: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    tipo_documento: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    nacionalidad: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    genero: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, string, string>, z.ZodEnum<["MASCULINO", "FEMENINO", "OTRO", "PREFIERO NO DECIR"]>>>;
    legajo: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    rol: z.ZodOptional<z.ZodEnum<["ADMIN", "SUPERADMIN", "SUPERVISOR", "BACK_OFFICE", "VENDEDOR"]>>;
    permisos: z.ZodOptional<z.ZodArray<z.ZodEnum<["ADMIN", "SUPERADMIN", "VENDEDOR", "BACK_OFFICE", "SUPERVISOR"]>, "many">>;
    exa: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    celula: z.ZodOptional<z.ZodNumber>;
    estado: z.ZodOptional<z.ZodDefault<z.ZodEnum<["ACTIVO", "INACTIVO", "SUSPENDIDO"]>>>;
}, "strip", z.ZodTypeAny, {
    nombre?: string | undefined;
    apellido?: string | undefined;
    fecha_nacimiento?: Date | undefined;
    documento?: string | undefined;
    email?: string | undefined;
    telefono?: string | null | undefined;
    telefono_alternativo?: string | null | undefined;
    tipo_documento?: string | undefined;
    nacionalidad?: string | undefined;
    genero?: "MASCULINO" | "FEMENINO" | "OTRO" | "PREFIERO NO DECIR" | undefined;
    legajo?: string | undefined;
    rol?: "ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR" | undefined;
    permisos?: ("ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR")[] | undefined;
    exa?: string | undefined;
    celula?: number | undefined;
    estado?: "ACTIVO" | "INACTIVO" | "SUSPENDIDO" | undefined;
}, {
    nombre?: string | undefined;
    apellido?: string | undefined;
    fecha_nacimiento?: Date | undefined;
    documento?: string | undefined;
    email?: string | undefined;
    telefono?: string | null | undefined;
    telefono_alternativo?: string | null | undefined;
    tipo_documento?: string | undefined;
    nacionalidad?: string | undefined;
    genero?: string | undefined;
    legajo?: string | undefined;
    rol?: "ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR" | undefined;
    permisos?: ("ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR")[] | undefined;
    exa?: string | undefined;
    celula?: number | undefined;
    estado?: "ACTIVO" | "INACTIVO" | "SUSPENDIDO" | undefined;
}>;
/**
 * Schema para LOGIN
 */
export declare const UsuarioLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
/**
 * Schema para respuestas de API
 * ✅ NO incluye password_hash
 */
export declare const UsuarioResponseSchema: z.ZodObject<{
    persona_id: z.ZodString;
    legajo: z.ZodEffects<z.ZodString, string, string>;
    rol: z.ZodEnum<["ADMIN", "SUPERADMIN", "SUPERVISOR", "BACK_OFFICE", "VENDEDOR"]>;
    permisos: z.ZodArray<z.ZodEnum<["ADMIN", "SUPERADMIN", "VENDEDOR", "BACK_OFFICE", "SUPERVISOR"]>, "many">;
    exa: z.ZodEffects<z.ZodString, string, string>;
    celula: z.ZodNumber;
    estado: z.ZodDefault<z.ZodEnum<["ACTIVO", "INACTIVO", "SUSPENDIDO"]>>;
} & Pick<{
    id_persona: z.ZodString;
    nombre: z.ZodEffects<z.ZodString, string, string>;
    apellido: z.ZodEffects<z.ZodString, string, string>;
    fecha_nacimiento: z.ZodDate;
    documento: z.ZodString;
    email: z.ZodEffects<z.ZodString, string, string>;
    creado_en: z.ZodDefault<z.ZodDate>;
    telefono: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    telefono_alternativo: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tipo_documento: z.ZodEffects<z.ZodString, string, string>;
    nacionalidad: z.ZodEffects<z.ZodString, string, string>;
    genero: z.ZodPipeline<z.ZodEffects<z.ZodString, string, string>, z.ZodEnum<["MASCULINO", "FEMENINO", "OTRO", "PREFIERO NO DECIR"]>>;
}, "nombre" | "apellido" | "fecha_nacimiento" | "documento" | "email" | "telefono" | "telefono_alternativo" | "tipo_documento" | "nacionalidad" | "genero">, "strip", z.ZodTypeAny, {
    nombre: string;
    apellido: string;
    fecha_nacimiento: Date;
    documento: string;
    email: string;
    tipo_documento: string;
    nacionalidad: string;
    genero: "MASCULINO" | "FEMENINO" | "OTRO" | "PREFIERO NO DECIR";
    persona_id: string;
    legajo: string;
    rol: "ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR";
    permisos: ("ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR")[];
    exa: string;
    celula: number;
    estado: "ACTIVO" | "INACTIVO" | "SUSPENDIDO";
    telefono?: string | null | undefined;
    telefono_alternativo?: string | null | undefined;
}, {
    nombre: string;
    apellido: string;
    fecha_nacimiento: Date;
    documento: string;
    email: string;
    tipo_documento: string;
    nacionalidad: string;
    genero: string;
    persona_id: string;
    legajo: string;
    rol: "ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR";
    permisos: ("ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR")[];
    exa: string;
    celula: number;
    telefono?: string | null | undefined;
    telefono_alternativo?: string | null | undefined;
    estado?: "ACTIVO" | "INACTIVO" | "SUSPENDIDO" | undefined;
}>;
/**
 * Schema para tabla supervisor
 */
export declare const SupervisorSchema: z.ZodObject<{
    usuario_id: z.ZodString;
    supervisor: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    usuario_id: string;
    supervisor: number;
}, {
    usuario_id: string;
    supervisor: number;
}>;
/**
 * Schema para tabla back_office
 */
export declare const BackOfficeSchema: z.ZodObject<{
    usuario: z.ZodString;
    back_office: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    usuario: string;
    back_office: number;
}, {
    usuario: string;
    back_office: number;
}>;
/**
 * Schema para tabla vendedor
 */
export declare const VendedorSchema: z.ZodObject<{
    usuario_id: z.ZodString;
    vendedor: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    usuario_id: string;
    vendedor: number;
}, {
    usuario_id: string;
    vendedor: number;
}>;
/**
 * ✅ ACTUALIZADO: Schema para cambio de contraseña por el mismo usuario
 * Requiere contraseña actual y validaciones estrictas
 */
export declare const CambioPasswordSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    passwordActual: z.ZodString;
    passwordNueva: z.ZodString;
    passwordNuevaConfirmacion: z.ZodString;
}, "strip", z.ZodTypeAny, {
    passwordActual: string;
    passwordNueva: string;
    passwordNuevaConfirmacion: string;
}, {
    passwordActual: string;
    passwordNueva: string;
    passwordNuevaConfirmacion: string;
}>, {
    passwordActual: string;
    passwordNueva: string;
    passwordNuevaConfirmacion: string;
}, {
    passwordActual: string;
    passwordNueva: string;
    passwordNuevaConfirmacion: string;
}>, {
    passwordActual: string;
    passwordNueva: string;
    passwordNuevaConfirmacion: string;
}, {
    passwordActual: string;
    passwordNueva: string;
    passwordNuevaConfirmacion: string;
}>;
/**
 * ✅ Schema para cambio de contraseña por administrador
 * NO requiere contraseña actual
 */
export declare const CambioPasswordAdminSchema: z.ZodEffects<z.ZodObject<{
    passwordNueva: z.ZodString;
    passwordNuevaConfirmacion: z.ZodString;
}, "strip", z.ZodTypeAny, {
    passwordNueva: string;
    passwordNuevaConfirmacion: string;
}, {
    passwordNueva: string;
    passwordNuevaConfirmacion: string;
}>, {
    passwordNueva: string;
    passwordNuevaConfirmacion: string;
}, {
    passwordNueva: string;
    passwordNuevaConfirmacion: string;
}>;
/**
 * Schema completo de la tabla password
 */
export declare const PasswordHistorySchema: z.ZodObject<{
    password_id: z.ZodNumber;
    password_hash: z.ZodString;
    usuario_persona_id: z.ZodString;
    fecha_creacion: z.ZodDate;
    activa: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    password_hash: string;
    password_id: number;
    usuario_persona_id: string;
    fecha_creacion: Date;
    activa: boolean;
}, {
    password_hash: string;
    password_id: number;
    usuario_persona_id: string;
    fecha_creacion: Date;
    activa: boolean;
}>;
/**
 * Schema para respuestas de historial (sin exponer hashes)
 */
export declare const PasswordHistoryResponseSchema: z.ZodObject<{
    fecha_creacion: z.ZodDate;
    activa: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    fecha_creacion: Date;
    activa: boolean;
}, {
    fecha_creacion: Date;
    activa: boolean;
}>;
/**
 * Schema para crear un registro de contraseña
 */
export declare const PasswordCreateSchema: z.ZodObject<{
    password_hash: z.ZodString;
    usuario_persona_id: z.ZodString;
    fecha_creacion: z.ZodDefault<z.ZodDate>;
    activa: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    password_hash: string;
    usuario_persona_id: string;
    fecha_creacion: Date;
    activa: boolean;
}, {
    password_hash: string;
    usuario_persona_id: string;
    fecha_creacion?: Date | undefined;
    activa?: boolean | undefined;
}>;
export type Usuario = z.infer<typeof UsuarioSchema>;
export type UsuarioSecurity = z.infer<typeof UsuarioSecuritySchema>;
export type UsuarioCreate = z.infer<typeof UsuarioCreateSchema>;
export type UsuarioUpdate = z.infer<typeof UsuarioUpdateSchema>;
export type UsuarioLogin = z.infer<typeof UsuarioLoginSchema>;
export type UsuarioResponse = z.infer<typeof UsuarioResponseSchema>;
export type Role = z.infer<typeof ROLES>;
export type Permiso = z.infer<typeof PERMISOS>;
export type Estado = z.infer<typeof EstadoEnum>;
export type Supervisor = z.infer<typeof SupervisorSchema>;
export type BackOffice = z.infer<typeof BackOfficeSchema>;
export type Vendedor = z.infer<typeof VendedorSchema>;
export type CambioPassword = z.infer<typeof CambioPasswordSchema>;
export type CambioPasswordAdmin = z.infer<typeof CambioPasswordAdminSchema>;
export type PasswordHistory = z.infer<typeof PasswordHistorySchema>;
export type PasswordHistoryResponse = z.infer<typeof PasswordHistoryResponseSchema>;
export type PasswordCreate = z.infer<typeof PasswordCreateSchema>;
/**
 * Valida si una cadena es un email válido
 */
export declare const isValidEmail: (email: string) => boolean;
/**
 * Valida si una contraseña cumple los requisitos
 */
export declare const PasswordNuevaSchema: z.ZodString;
export declare const isValidPassword: (password: string) => boolean;
/**
 * Valida si un rol es válido
 */
export declare const isValidRole: (rol: string) => boolean;
/**
 * Valida si un permiso es válido
 */
export declare const isValidPermiso: (permiso: string) => boolean;
/**
 * Requisitos de contraseña para mostrar al usuario
 */
export declare const PASSWORD_REQUIREMENTS: {
    readonly minLength: 8;
    readonly maxLength: 100;
    readonly requireUppercase: true;
    readonly requireLowercase: true;
    readonly requireNumber: true;
    readonly requireSpecial: true;
    readonly specialChars: "!@#$%^&*()-_=+[]{}|;:,.<>?";
};
/**
 * Mensajes de validación de contraseña
 */
export declare const PASSWORD_VALIDATION_MESSAGES: {
    readonly minLength: "La contraseña debe tener al menos 8 caracteres";
    readonly maxLength: "La contraseña no puede tener más de 100 caracteres";
    readonly requireUppercase: "Debe contener al menos una letra mayúscula (A-Z)";
    readonly requireLowercase: "Debe contener al menos una letra minúscula (a-z)";
    readonly requireNumber: "Debe contener al menos un número (0-9)";
    readonly requireSpecial: "Debe contener al menos un carácter especial (!@#$%^&*()-_=+[]{}|;:,.<>?)";
    readonly noMatch: "Las contraseñas no coinciden";
    readonly sameAsCurrent: "La nueva contraseña debe ser diferente a la actual";
    readonly previouslyUsed: "No puedes reutilizar una contraseña anterior. Elige una diferente.";
};
/**
 * Roles que pueden gestionar usuarios
 */
export declare const MANAGEMENT_ROLES: readonly ["SUPERVISOR", "BACK_OFFICE"];
/**
 * Roles con permisos administrativos completos
 */
export declare const ADMIN_ROLES: readonly ["BACK_OFFICE"];
/**
 * Todos los roles del sistema
 */
export declare const ALL_ROLES: readonly ["ADMIN", "SUPERADMIN", "SUPERVISOR", "BACK_OFFICE", "VENDEDOR"];
//# sourceMappingURL=User.d.ts.map