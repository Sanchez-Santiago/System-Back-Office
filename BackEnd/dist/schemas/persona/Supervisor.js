import { z } from "zod";
import { UsuarioResponseSchema } from "./User";
// Schema de la tabla supervisor (solo 1 campo)
export const SupervisorSchema = z.object({
    usuario: z.string().uuid(), // FK a usuario.persona_id
});
// Para crear un supervisor (asume que el usuario ya existe)
export const SupervisorCreateSchema = z.object({
    usuario: z.string().uuid(),
});
// Para respuestas de API con datos completos del supervisor
export const SupervisorResponseSchema = SupervisorSchema.merge(UsuarioResponseSchema.pick({
    legajo: true,
    nombre: true,
    apellido: true,
    email: true,
    telefono: true,
    rol: true,
    estado: true,
}));
//# sourceMappingURL=Supervisor.js.map