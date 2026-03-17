import { z } from "zod";
export declare const BackOfficeSchema: z.ZodObject<{
    back_office_id: z.ZodNumber;
    usuario: z.ZodString;
}, "strip", z.ZodTypeAny, {
    usuario: string;
    back_office_id: number;
}, {
    usuario: string;
    back_office_id: number;
}>;
export declare const BackOfficeConUsuarioSchema: z.ZodObject<{
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
}, "nombre" | "apellido" | "fecha_nacimiento" | "documento" | "email" | "telefono" | "telefono_alternativo" | "tipo_documento" | "nacionalidad" | "genero"> & {
    back_office_id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
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
    back_office_id: number;
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
    back_office_id: number;
    telefono?: string | null | undefined;
    telefono_alternativo?: string | null | undefined;
    estado?: "ACTIVO" | "INACTIVO" | "SUSPENDIDO" | undefined;
}>;
export declare const BackOfficeCreateSchema: z.ZodObject<{
    usuario: z.ZodString;
}, "strip", z.ZodTypeAny, {
    usuario: string;
}, {
    usuario: string;
}>;
export type BackOffice = z.infer<typeof BackOfficeSchema>;
export type BackOfficeConUsuario = z.infer<typeof BackOfficeConUsuarioSchema>;
export type BackOfficeCreate = z.infer<typeof BackOfficeCreateSchema>;
//# sourceMappingURL=BackOffice.d.ts.map