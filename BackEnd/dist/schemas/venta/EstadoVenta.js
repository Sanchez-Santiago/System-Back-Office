// ============================================
// BackEnd/src/schemas/venta/EstadoVenta.ts
// ============================================
import { z } from "zod";
export const EstadoVentaEnum = z.enum([
    "INICIAL",
    "REPACTAR",
    "AGENDADO",
    "APROBADO ABD",
    "CREADO SIN DOCU",
    "CREADO DOCU OK",
    "CREADO",
    "PENDIENTE DOCU/PIN",
    "PIN INGRESADO",
    "PENDIENTE CARGA PIN",
    "EVALUANDO DONANTE",
    "APROBADO",
    "ACTIVADO NRO PORTADO",
    "ACTIVADO NRO CLARO",
    "ACTIVADO",
    "EXITOSO",
    "RECHAZADO DONANTE",
    "RECHAZADO ABD",
    "CANCELADO",
    "SPN CANCELADA",
    "CLIENTE DESISTE",
]);
export const EstadoVentaSchema = z.object({
    estado_id: z.number().int().positive(),
    venta_id: z.number().int().positive(),
    estado: EstadoVentaEnum,
    descripcion: z.string().max(255),
    fecha_creacion: z.coerce.date(),
    usuario_id: z.string().uuid(),
});
export const EstadoVentaCreateSchema = EstadoVentaSchema.omit({
    estado_id: true,
    fecha_creacion: true,
});
export const EstadoVentaUpdateSchema = EstadoVentaSchema.omit({
    estado_id: true,
}).partial();
//# sourceMappingURL=EstadoVenta.js.map