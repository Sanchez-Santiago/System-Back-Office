import { z } from 'zod';
import { commonSchemas } from './common';

export const loginSchema = z.object({
  user: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
  }),
});

export const registerSchema = z.object({
  user: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    nombre: commonSchemas.nombre,
    apellido: commonSchemas.nombre,
  }),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Contraseña actual requerida'),
  new_password: commonSchemas.password,
});

export const resetPasswordSchema = z.object({
  email: commonSchemas.email,
});

// Tipos inferidos
export type LoginCredentials = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;