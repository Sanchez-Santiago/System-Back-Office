// ============================================
// BackEnd/src/schemas/persona/User.ts
// ============================================
import { z } from "zod";
import { PersonaSchema } from "./Persona.ts";

// ✅ ACTUALIZADO: Solo 3 roles según nueva BD
export const ROLES = z.enum(["SUPERVISOR", "BACK_OFFICE", "VENDEDOR"]);

export const PERMISOS = z.enum(["ADMIN", "SUPERADMIN", "VENDEDOR", "BACK_OFFICE", "SUPERVISOR"]);

export const EstadoEnum = z.enum(["ACTIVO", "INACTIVO", "SUSPENDIDO"]);

// ✅ ACTUALIZADO: Cambiado empresa_id_empresa por celula
export const UsuarioBaseSchema = z.object({
  persona_id: z.string().uuid(),
  legajo: z.string().length(5),
  rol: ROLES,
  permisos: z.array(PERMISOS),
  exa: z.string().min(4).max(8),
  password_hash: z.string().min(1),
  celula: z.number().int().positive(), // ✅ NUEVO: reemplaza empresa_id_empresa
  estado: EstadoEnum.default("ACTIVO"),
});

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
  celula: true, // ✅ AÑADIDO
});

export const UsuarioCreateSchema = UsuarioSchema.omit({
  persona_id: true,
});

export const UsuarioUpdateSchema = UsuarioSchema.omit({
  persona_id: true,
  password_hash: true,
  legajo: true,
}).partial();

export const UsuarioLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const UsuarioResponseSchema = UsuarioSchema.omit({
  password_hash: true,
});

// ✅ ACTUALIZADO: Schemas de roles según nueva estructura
export const SupervisorSchema = z.object({
  usuario_id: z.string().uuid(),
  supervisor: z.number().int().positive(), // ✅ AUTO_INCREMENT
});

export const BackOfficeSchema = z.object({
  usuario: z.string().uuid(),
  back_office: z.number().int().positive(), // ✅ AUTO_INCREMENT
});

export const VendedorSchema = z.object({
  usuario_id: z.string().uuid(),
  vendedor: z.number().int().positive(), // ✅ AUTO_INCREMENT
});

// Schemas de cambio de contraseña
export const CambioPasswordSchema = z
  .object({
    passwordActual: z.string().min(1, "Contraseña actual requerida"),
    passwordNueva: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(100, "La contraseña no puede tener más de 100 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    passwordNuevaConfirmacion: z
      .string()
      .min(1, "Confirmación de contraseña requerida"),
  })
  .refine((data) => data.passwordNueva === data.passwordNuevaConfirmacion, {
    message: "Las contraseñas nuevas no coinciden",
    path: ["passwordNuevaConfirmacion"],
  });

export const CambioPasswordAdminSchema = z
  .object({
    passwordNueva: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(100, "La contraseña no puede tener más de 100 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/[a-z]/, "Debe contener al menos una minúscula")
      .regex(/[0-9]/, "Debe contener al menos un número"),
    passwordNuevaConfirmacion: z
      .string()
      .min(1, "Confirmación de contraseña requerida"),
  })
  .refine((data) => data.passwordNueva === data.passwordNuevaConfirmacion, {
    message: "Las contraseñas nuevas no coinciden",
    path: ["passwordNuevaConfirmacion"],
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
export type CambioPassword = z.infer<typeof CambioPasswordSchema>;
export type CambioPasswordAdmin = z.infer<typeof CambioPasswordAdminSchema>;
