export interface AuthenticatedUser {
  id: string;
  email: string;
  rol: string;
  legajo: string;
  exa: string;
}

/**
 * Datos de contraseña sin validar (payload crudo del cliente)
 */
export type PasswordDataRaw = {
  passwordActual?: string;
  passwordNueva?: string;
  passwordNuevaConfirmacion?: string;
  [key: string]: unknown;
};
