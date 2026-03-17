import { z } from "zod";
export declare const PasswordSchema: z.ZodObject<{
    password_id: z.ZodNumber;
    password_hash: z.ZodString;
    usuario_persona_id: z.ZodString;
    fecha_creacion: z.ZodDate;
    activa: z.ZodDefault<z.ZodBoolean>;
    intentos_fallidos: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    password_hash: string;
    password_id: number;
    usuario_persona_id: string;
    fecha_creacion: Date;
    activa: boolean;
    intentos_fallidos: number;
}, {
    password_hash: string;
    password_id: number;
    usuario_persona_id: string;
    fecha_creacion: Date;
    activa?: boolean | undefined;
    intentos_fallidos?: number | undefined;
}>;
export declare const PasswordCreateSchema: z.ZodObject<Omit<{
    password_id: z.ZodNumber;
    password_hash: z.ZodString;
    usuario_persona_id: z.ZodString;
    fecha_creacion: z.ZodDate;
    activa: z.ZodDefault<z.ZodBoolean>;
    intentos_fallidos: z.ZodDefault<z.ZodNumber>;
}, "password_id" | "fecha_creacion"> & {
    fecha_creacion: z.ZodDefault<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    password_hash: string;
    usuario_persona_id: string;
    fecha_creacion: Date;
    activa: boolean;
    intentos_fallidos: number;
}, {
    password_hash: string;
    usuario_persona_id: string;
    fecha_creacion?: Date | undefined;
    activa?: boolean | undefined;
    intentos_fallidos?: number | undefined;
}>;
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
export type Password = z.infer<typeof PasswordSchema>;
export type PasswordCreate = z.infer<typeof PasswordCreateSchema>;
export type PasswordHistoryResponse = z.infer<typeof PasswordHistoryResponseSchema>;
//# sourceMappingURL=Password.d.ts.map