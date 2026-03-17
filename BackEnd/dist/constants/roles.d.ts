/**
 * ✅ ACTUALIZADO: Constantes de roles del sistema
 * Ahora solo incluye los 3 roles de la nueva BD
 */
export declare const ROLES: {
    readonly SUPERVISOR: "SUPERVISOR";
    readonly BACK_OFFICE: "BACK_OFFICE";
    readonly VENDEDOR: "VENDEDOR";
    readonly SUPERADMIN: "SUPERADMIN";
    readonly ADMIN: "ADMIN";
};
export type RoleName = (typeof ROLES)[keyof typeof ROLES];
/**
 * ✅ ACTUALIZADO: Grupo de roles con permisos de gestión
 * SUPERVISOR y BACK_OFFICE tienen permisos administrativos
 */
export declare const ROLES_MANAGEMENT: readonly ["SUPERVISOR", "BACK_OFFICE", "SUPERADMIN", "ADMIN"];
/**
 * ✅ ACTUALIZADO: Roles con permisos de administrador completo
 * BACK_OFFICE, SUPERADMIN y ADMIN pueden gestionar recursos
 */
export declare const ROLES_ADMIN: readonly ["BACK_OFFICE", "SUPERADMIN", "ADMIN"];
/**
 * Roles que pueden CREAR clientes (todos los usuarios autenticados)
 */
export declare const ROLES_CAN_CREATE_CLIENTE: readonly ["SUPERVISOR", "BACK_OFFICE", "VENDEDOR", "SUPERADMIN", "ADMIN"];
/**
 * Todos los roles del sistema
 */
export declare const ROLES_ALL: ("ADMIN" | "SUPERADMIN" | "SUPERVISOR" | "BACK_OFFICE" | "VENDEDOR")[];
//# sourceMappingURL=roles.d.ts.map