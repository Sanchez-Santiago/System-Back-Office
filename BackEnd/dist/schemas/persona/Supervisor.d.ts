import { z } from "zod";
export declare const SupervisorSchema: z.ZodObject<{
    usuario: z.ZodString;
}, "strip", z.ZodTypeAny, {
    usuario: string;
}, {
    usuario: string;
}>;
export declare const SupervisorCreateSchema: z.ZodObject<{
    usuario: z.ZodString;
}, "strip", z.ZodTypeAny, {
    usuario: string;
}, {
    usuario: string;
}>;
export declare const SupervisorResponseSchema: z.ZodObject<{
    usuario: z.ZodString;
} & Pick<{
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
}, "nombre" | "apellido" | "fecha_nacimiento" | "documento" | "email" | "telefono" | "telefono_alternativo" | "tipo_documento" | "nacionalidad" | "genero">, "nombre" | "apellido" | "email" | "telefono" | "legajo" | "rol" | "estado">, "strip", z.ZodTypeAny, {
    nombre: string;
    apellido: string;
    email: string;
    legajo: string;
    rol: "ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR";
    estado: "ACTIVO" | "INACTIVO" | "SUSPENDIDO";
    usuario: string;
    telefono?: string | null | undefined;
}, {
    nombre: string;
    apellido: string;
    email: string;
    legajo: string;
    rol: "ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR";
    usuario: string;
    telefono?: string | null | undefined;
    estado?: "ACTIVO" | "INACTIVO" | "SUSPENDIDO" | undefined;
}>;
export type Supervisor = z.infer<typeof SupervisorSchema>;
export type SupervisorCreate = z.infer<typeof SupervisorCreateSchema>;
export type SupervisorResponse = z.infer<typeof SupervisorResponseSchema>;
//# sourceMappingURL=Supervisor.d.ts.map