// ============================================
// Frontend - Mensajes Centralizados de Notificaciones
// ============================================

export const NotificationMessages = {
  // ============================================
  // MENSAJES DE ÉXITO
  // ============================================
  SUCCESS: {
    // Ventas
    VENTA_CREADA: "Venta creada exitosamente",
    VENTA_ACTUALIZADA: "Venta actualizada correctamente",
    ESTADO_CAMBIADO: "Estado actualizado",
    
    // Planes
    PLAN_CREADO: "Plan creado exitosamente",
    PLAN_ACTUALIZADO: "Plan actualizado correctamente",
    PLAN_ACTIVADO: "Plan activado exitosamente",
    PLAN_DESACTIVADO: "Plan desactivado exitosamente",
    
    // Promociones
    PROMOCION_CREADA: "Promoción creada exitosamente",
    PROMOCION_ACTUALIZADA: "Promoción actualizada correctamente",
    PROMOCION_ACTIVADA: "Promoción activada exitosamente",
    PROMOCION_DESACTIVADA: "Promoción desactivada exitosamente",
    
    // Empresas
    EMPRESA_CREADA: "Empresa creada exitosamente",
    EMPRESA_ACTUALIZADA: "Empresa actualizada correctamente",
    
    // Clientes
    CLIENTE_CREADO: "Cliente creado exitosamente",
    CLIENTE_ACTUALIZADO: "Cliente actualizado correctamente",
    
    // Notificaciones
    NOTIFICACION_MARCADA_LEIDA: "Notificación marcada como leída",
    NOTIFICACIONES_MARCADAS_LEIDAS: "Todas las notificaciones marcadas como leídas",
    
    // Generales
    COPIADO_PORTAPAPELES: "Copiado al portapapeles",
    EXPORTACION_EXITOSA: "Exportación completada exitosamente",
  },

  // ============================================
  // MENSAJES DE ERROR
  // ============================================
  ERROR: {
    GENERICO: "Ha ocurrido un error. Por favor, intentá de nuevo.",
    NO_AUTORIZADO: "No tenés permisos para realizar esta acción.",
    DATOS_INVALIDOS: "Los datos proporcionados son inválidos.",
    CONEXION_FALLIDA: "Error de conexión. Verificá tu red.",
    SERVIDOR_ERROR: "Error en el servidor. Intentá más tarde.",
    
    // Específicos
    VENTA_NO_ENCONTRADA: "Venta no encontrada",
    PLAN_NO_ENCONTRADO: "Plan no encontrado",
    PROMOCION_NO_ENCONTRADA: "Promoción no encontrada",
    EMPRESA_NO_ENCONTRADA: "Empresa no encontrada",
    CLIENTE_NO_ENCONTRADO: "Cliente no encontrado",
  },

  // ============================================
  // MENSAJES DE INFORMACIÓN
  // ============================================
  INFO: {
    CARGANDO: "Cargando...",
    SIN_RESULTADOS: "No hay resultados para mostrar",
    SESION_EXPIRADA: "Tu sesión ha expirado. Por favor, iniciá sesión nuevamente.",
    DATOS_GUARDADOS: "Datos guardados correctamente",
  },

  // ============================================
  // MENSAJES DE ADVERTENCIA
  // ============================================
  WARNING: {
    CAMBIOS_SIN_GUARDAR: "Tenés cambios sin guardar. ¿Querés continuar?",
    ACCION_IRREVERSIBLE: "Esta acción no se puede deshacer. ¿Estás seguro?",
    LIMITE_ALCANZADO: "Has alcanzado el límite permitido",
    DATOS_INCOMPLETOS: "Alguns datos están incompletos",
  },

  // ============================================
  // MENSAJES DE CONFIRMACIÓN
  // ============================================
  CONFIRM: {
    ELIMINAR: "¿Estás seguro de que querés eliminar?",
    CANCELAR: "¿Estás seguro de que querés cancelar?",
    CERRAR: "¿Estás seguro de que querés cerrar?",
  },
} as const;

export type NotificationSuccessKey = keyof typeof NotificationMessages.SUCCESS;
export type NotificationErrorKey = keyof typeof NotificationMessages.ERROR;
export type NotificationInfoKey = keyof typeof NotificationMessages.INFO;
export type NotificationWarningKey = keyof typeof NotificationMessages.WARNING;
export type NotificationConfirmKey = keyof typeof NotificationMessages.CONFIRM;
export type NotificationMessageKey = NotificationSuccessKey | NotificationErrorKey | NotificationInfoKey | NotificationWarningKey | NotificationConfirmKey;

export function getNotificationMessage(
  type: 'success' | 'error' | 'info' | 'warning',
  key: string
): string {
  const messages = NotificationMessages[type.toUpperCase() as keyof typeof NotificationMessages];
  return (messages as Record<string, string>)[key] || key;
}
