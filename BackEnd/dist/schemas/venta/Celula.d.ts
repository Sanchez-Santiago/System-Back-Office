import { z } from "zod";
export declare const CelulaCreateSchema: z.ZodObject<{
    id_celula: z.ZodNumber;
    empresa: z.ZodNumber;
    nombre: z.ZodString;
    tipo_cuenta: z.ZodEnum<["PREPAGO", "POSPAGO", "CORPORATIVO"]>;
}, "strip", z.ZodTypeAny, {
    nombre: string;
    empresa: number;
    id_celula: number;
    tipo_cuenta: "PREPAGO" | "POSPAGO" | "CORPORATIVO";
}, {
    nombre: string;
    empresa: number;
    id_celula: number;
    tipo_cuenta: "PREPAGO" | "POSPAGO" | "CORPORATIVO";
}>;
export declare const CelulaUpdateSchema: z.ZodObject<{
    id_celula: z.ZodOptional<z.ZodNumber>;
    empresa: z.ZodOptional<z.ZodNumber>;
    nombre: z.ZodOptional<z.ZodString>;
    tipo_cuenta: z.ZodOptional<z.ZodEnum<["PREPAGO", "POSPAGO", "CORPORATIVO"]>>;
}, "strip", z.ZodTypeAny, {
    nombre?: string | undefined;
    empresa?: number | undefined;
    id_celula?: number | undefined;
    tipo_cuenta?: "PREPAGO" | "POSPAGO" | "CORPORATIVO" | undefined;
}, {
    nombre?: string | undefined;
    empresa?: number | undefined;
    id_celula?: number | undefined;
    tipo_cuenta?: "PREPAGO" | "POSPAGO" | "CORPORATIVO" | undefined;
}>;
export type CelulaCreate = z.infer<typeof CelulaCreateSchema>;
export type CelulaUpdate = z.infer<typeof CelulaUpdateSchema>;
declare const _default: {
    create: z.ZodObject<{
        id_celula: z.ZodNumber;
        empresa: z.ZodNumber;
        nombre: z.ZodString;
        tipo_cuenta: z.ZodEnum<["PREPAGO", "POSPAGO", "CORPORATIVO"]>;
    }, "strip", z.ZodTypeAny, {
        nombre: string;
        empresa: number;
        id_celula: number;
        tipo_cuenta: "PREPAGO" | "POSPAGO" | "CORPORATIVO";
    }, {
        nombre: string;
        empresa: number;
        id_celula: number;
        tipo_cuenta: "PREPAGO" | "POSPAGO" | "CORPORATIVO";
    }>;
    update: z.ZodObject<{
        id_celula: z.ZodOptional<z.ZodNumber>;
        empresa: z.ZodOptional<z.ZodNumber>;
        nombre: z.ZodOptional<z.ZodString>;
        tipo_cuenta: z.ZodOptional<z.ZodEnum<["PREPAGO", "POSPAGO", "CORPORATIVO"]>>;
    }, "strip", z.ZodTypeAny, {
        nombre?: string | undefined;
        empresa?: number | undefined;
        id_celula?: number | undefined;
        tipo_cuenta?: "PREPAGO" | "POSPAGO" | "CORPORATIVO" | undefined;
    }, {
        nombre?: string | undefined;
        empresa?: number | undefined;
        id_celula?: number | undefined;
        tipo_cuenta?: "PREPAGO" | "POSPAGO" | "CORPORATIVO" | undefined;
    }>;
};
export default _default;
//# sourceMappingURL=Celula.d.ts.map