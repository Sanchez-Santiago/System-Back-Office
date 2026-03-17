import { z } from "zod";
export declare const ReclamoCorreoSchema: z.ZodObject<{
    reclamo_correo_id: z.ZodNumber;
    sap_id: z.ZodEffects<z.ZodString, string, string>;
    titulo: z.ZodString;
    comentario: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sap_id: string;
    titulo: string;
    comentario: string;
    reclamo_correo_id: number;
}, {
    sap_id: string;
    titulo: string;
    comentario: string;
    reclamo_correo_id: number;
}>;
export declare const ReclamoCorreoCreateSchema: z.ZodObject<Omit<{
    reclamo_correo_id: z.ZodNumber;
    sap_id: z.ZodEffects<z.ZodString, string, string>;
    titulo: z.ZodString;
    comentario: z.ZodString;
}, "reclamo_correo_id">, "strip", z.ZodTypeAny, {
    sap_id: string;
    titulo: string;
    comentario: string;
}, {
    sap_id: string;
    titulo: string;
    comentario: string;
}>;
export declare const ReclamoCorreoUpdateSchema: z.ZodObject<{
    titulo: z.ZodOptional<z.ZodString>;
    comentario: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    titulo?: string | undefined;
    comentario?: string | undefined;
}, {
    titulo?: string | undefined;
    comentario?: string | undefined;
}>;
export type ReclamoCorreo = z.infer<typeof ReclamoCorreoSchema>;
export type ReclamoCorreoCreate = z.infer<typeof ReclamoCorreoCreateSchema>;
export type ReclamoCorreoUpdate = z.infer<typeof ReclamoCorreoUpdateSchema>;
//# sourceMappingURL=ReclamoCorreo.d.ts.map