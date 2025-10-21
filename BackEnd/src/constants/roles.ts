// constants/roles.ts

/**
 * Constantes de roles del sistema
 * Define todos los roles disponibles y grupos de roles para permisos
 */
export const ROLES = {
  SUPERVISOR: "SUPERVISOR",
  BACK_OFFICE: "BACK_OFFICE",
  VENDEDOR: "VENDEDOR",
  ADMINISTRADOR: "ADMINISTRADOR",
  SUPERADMINISTRADOR: "SUPERADMINISTRADOR",
} as const;

export type RoleName = typeof ROLES[keyof typeof ROLES];

/**
 * Grupo de roles con permisos administrativos
 * ADMINISTRADOR y SUPERADMINISTRADOR
 */
export const ROLES_ADMIN = [
  ROLES.ADMINISTRADOR,
  ROLES.SUPERADMINISTRADOR,
] as const;

/**
 * Grupo de roles con permisos de gestión
 * SUPERVISOR, ADMINISTRADOR y SUPERADMINISTRADOR
 */
export const ROLES_MANAGEMENT = [
  ROLES.SUPERVISOR,
  ROLES.ADMINISTRADOR,
  ROLES.SUPERADMINISTRADOR,
] as const;

/**
 * Todos los roles del sistema
 */
export const ROLES_ALL = Object.values(ROLES);
