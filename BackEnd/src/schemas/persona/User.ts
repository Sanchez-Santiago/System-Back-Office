import { z } from "zod";
import { PersonaSchema } from "./Persona.ts";

export const ROLES = z.enum([
  "SUPERVISOR",
  "BACK_OFFICE",
  "VENDEDOR",
  "ADMINISTRADOR",
  "SUPERADMINISTRADOR",
]);

// Enum de estados
export const EstadoEnum = z.enum(["ACTIVO", "INACTIVO", "SUSPENDIDO"]);

// Schema base de Usuario (basado en tu tabla)
export const UsuarioBaseSchema = z.object({
  persona_id: z.string().uuid(),
  legajo: z.string().length(5), // Tu DB usa VARCHAR(5)
  rol: ROLES,
  exa: z.string().min(4).max(8),
  password_hash: z.string().min(1),
  empresa_id_empresa: z.number().int().positive(),
  estado: EstadoEnum.default("ACTIVO"),
});

// Schema completo combinando con Persona
export const UsuarioSchema = UsuarioBaseSchema.merge(
  PersonaSchema.pick({
    nombre: true,
    apellido: true,
    email: true,
    documento: true,
    tipo_documento: true,
    telefono: true,
    fecha_nacimiento: true,
    nacionalidad: true,
    genero: true,
  }),
);

export const UsuarioSecuritySchema = UsuarioSchema.pick({
  persona_id: true,
  nombre: true,
  apellido: true,
  email: true,
  telefono: true,
  legajo: true,
  rol: true,
  exa: true,
  fecha_nacimiento: true,
  nacionalidad: true,
  estado: true,
});

// Schemas para operaciones específicas
export const UsuarioCreateSchema = UsuarioSchema.omit({
  persona_id: true,
});

export const UsuarioUpdateSchema = UsuarioSchema.omit({
  persona_id: true,
  password_hash: true,
  legajo: true, // El legajo no debería cambiar
}).partial();

export const UsuarioLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const UsuarioResponseSchema = UsuarioSchema.omit({
  password_hash: true,
});

// Schema para Supervisor
export const SupervisorSchema = z.object({
  usuario: z.string().uuid(), // FK a usuario.persona_id
});

// Schema para BackOffice
export const BackOfficeSchema = z.object({
  usuario_id: z.string().uuid(),
  supervisor: z.string().uuid(), // FK a supervisor.usuario
});

// Schema para Vendedor
export const VendedorSchema = z.object({
  usuario: z.string().uuid(),
  supervisor: z.string().uuid(),
});

// Tipos TypeScript
export type Usuario = z.infer<typeof UsuarioSchema>;
export type UsuarioSecurity = z.infer<typeof UsuarioSecuritySchema>;
export type UsuarioCreate = z.infer<typeof UsuarioCreateSchema>;
export type UsuarioUpdate = z.infer<typeof UsuarioUpdateSchema>;
export type UsuarioLogin = z.infer<typeof UsuarioLoginSchema>;
export type UsuarioResponse = z.infer<typeof UsuarioResponseSchema>;
export type Role = z.infer<typeof ROLES>;
export type Estado = z.infer<typeof EstadoEnum>;
export type Supervisor = z.infer<typeof SupervisorSchema>;
export type BackOffice = z.infer<typeof BackOfficeSchema>;
export type Vendedor = z.infer<typeof VendedorSchema>;
