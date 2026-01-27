import { useFormValidation } from './useFormValidation';
import { loginSchema, registerSchema, changePasswordSchema } from '../schemas';
import type { LoginCredentials, RegisterData, ChangePasswordData } from '../schemas';

export function useAuthForm() {
  const defaultValues: Partial<LoginCredentials> = {
    user: {
      email: '',
      password: '',
    },
  };

  return useFormValidation(loginSchema, defaultValues);
}

export function useRegisterForm() {
  const defaultValues: Partial<RegisterData> = {
    user: {
      email: '',
      password: '',
      nombre: '',
      apellido: '',
    },
  };

  return useFormValidation(registerSchema, defaultValues);
}

export function useChangePasswordForm() {
  const defaultValues: Partial<ChangePasswordData> = {
    current_password: '',
    new_password: '',
  };

  return useFormValidation(changePasswordSchema, defaultValues);
}