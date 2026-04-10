import { z } from "zod";
import { UsuarioSchema } from "./User";
// Esquema BackOffice según BD: solo tiene back_office_id y usuario
export const BackOfficeSchema = z.object({
    back_office_id: z.number().int().positive(),
    usuario: z.string().uuid(), // FK a usuario.persona_id
});
// Si necesitas el usuario completo con datos de back office:
export const BackOfficeConUsuarioSchema = UsuarioSchema.merge(z.object({
    back_office_id: z.number().int().positive(),
}));
// Para crear un back office (necesitas el usuario ya creado)
export const BackOfficeCreateSchema = z.object({
    usuario: z.string().uuid(),
});
//# sourceMappingURL=BackOffice.js.map