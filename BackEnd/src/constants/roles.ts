// ============================================
// BackEnd/src/constants/roles.ts
// ============================================
/**
 * ✅ ACTUALIZADO: Constantes de roles del sistema
 * Ahora solo incluye los 3 roles de la nueva BD
 */
export const ROLES = {
  SUPERVISOR: "SUPERVISOR",
  BACK_OFFICE: "BACK_OFFICE",
  VENDEDOR: "VENDEDOR",
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN"
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

/**
 * ✅ ACTUALIZADO: Grupo de roles con permisos de gestión
 * SUPERVISOR y BACK_OFFICE tienen permisos administrativos
 */
export const ROLES_MANAGEMENT = [ROLES.SUPERVISOR, ROLES.BACK_OFFICE, ROLES.SUPERADMIN, ROLES.ADMIN] as const;

/**
 * Solo BACK_OFFICE tiene permisos de administrador completo
 */
export const ROLES_ADMIN = [ROLES.BACK_OFFICE] as const;

/**
 * Todos los roles del sistema
 */
export const ROLES_ALL = Object.values(ROLES);
