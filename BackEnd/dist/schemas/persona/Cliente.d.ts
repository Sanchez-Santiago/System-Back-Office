import { z } from "zod";
export declare const ClienteSchema: z.ZodObject<{
    persona_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    persona_id: string;
}, {
    persona_id: string;
}>;
export declare const ClienteCreateSchema: z.ZodObject<{
    nombre: z.ZodEffects<z.ZodString, string, string>;
    apellido: z.ZodEffects<z.ZodString, string, string>;
    fecha_nacimiento: z.ZodDate;
    documento: z.ZodString;
    email: z.ZodEffects<z.ZodString, string, string>;
    telefono: z.ZodOptional<z.ZodString>;
    telefono_alternativo: z.ZodOptional<z.ZodString>;
    tipo_documento: z.ZodEffects<z.ZodString, string, string>;
    nacionalidad: z.ZodEffects<z.ZodString, string, string>;
    genero: z.ZodEnum<["MASCULINO", "FEMENINO", "OTRO", "PREFIERO NO DECIR"]>;
}, "strip", z.ZodTypeAny, {
    nombre: string;
    apellido: string;
    fecha_nacimiento: Date;
    documento: string;
    email: string;
    tipo_documento: string;
    nacionalidad: string;
    genero: "MASCULINO" | "FEMENINO" | "OTRO" | "PREFIERO NO DECIR";
    telefono?: string | undefined;
    telefono_alternativo?: string | undefined;
}, {
    nombre: string;
    apellido: string;
    fecha_nacimiento: Date;
    documento: string;
    email: string;
    tipo_documento: string;
    nacionalidad: string;
    genero: "MASCULINO" | "FEMENINO" | "OTRO" | "PREFIERO NO DECIR";
    telefono?: string | undefined;
    telefono_alternativo?: string | undefined;
}>;
export declare const ClienteUpdateSchema: z.ZodObject<{
    nombre: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    apellido: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    fecha_nacimiento: z.ZodOptional<z.ZodDate>;
    documento: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    telefono: z.ZodOptional<z.ZodString>;
    telefono_alternativo: z.ZodOptional<z.ZodString>;
    tipo_documento: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    nacionalidad: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    genero: z.ZodOptional<z.ZodEnum<["MASCULINO", "FEMENINO", "OTRO", "PREFIERO NO DECIR"]>>;
}, "strict", z.ZodTypeAny, {
    nombre?: string | undefined;
    apellido?: string | undefined;
    fecha_nacimiento?: Date | undefined;
    documento?: string | undefined;
    email?: string | undefined;
    telefono?: string | undefined;
    telefono_alternativo?: string | undefined;
    tipo_documento?: string | undefined;
    nacionalidad?: string | undefined;
    genero?: "MASCULINO" | "FEMENINO" | "OTRO" | "PREFIERO NO DECIR" | undefined;
}, {
    nombre?: string | undefined;
    apellido?: string | undefined;
    fecha_nacimiento?: Date | undefined;
    documento?: string | undefined;
    email?: string | undefined;
    telefono?: string | undefined;
    telefono_alternativo?: string | undefined;
    tipo_documento?: string | undefined;
    nacionalidad?: string | undefined;
    genero?: "MASCULINO" | "FEMENINO" | "OTRO" | "PREFIERO NO DECIR" | undefined;
}>;
export declare const ClienteResponseSchema: z.ZodObject<{
    persona_id: z.ZodString;
} & {
    nombre: z.ZodString;
    apellido: z.ZodString;
    email: z.ZodString;
    documento: z.ZodString;
    telefono: z.ZodOptional<z.ZodString>;
    telefono_alternativo: z.ZodOptional<z.ZodString>;
    fecha_nacimiento: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    nombre: string;
    apellido: string;
    fecha_nacimiento: Date;
    documento: string;
    email: string;
    persona_id: string;
    telefono?: string | undefined;
    telefono_alternativo?: string | undefined;
}, {
    nombre: string;
    apellido: string;
    fecha_nacimiento: Date;
    documento: string;
    email: string;
    persona_id: string;
    telefono?: string | undefined;
    telefono_alternativo?: string | undefined;
}>;
export type Cliente = z.infer<typeof ClienteSchema>;
export type ClienteCreate = z.infer<typeof ClienteCreateSchema>;
export type ClienteUpdate = z.infer<typeof ClienteUpdateSchema>;
export type ClienteResponse = z.infer<typeof ClienteResponseSchema>;
//# sourceMappingURL=Cliente.d.ts.map