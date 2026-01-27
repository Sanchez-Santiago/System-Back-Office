import { z } from 'zod';
import { commonSchemas, chipEnum, saleTypeEnum } from './common';
import { correoSchema } from './correo';
import { portabilidadSchema } from './portabilidad';

export const ventaBaseSchema = z.object({
  sds: z.string().min(3, 'SDS requerido').max(50, 'Máximo 50 caracteres'),
  chip: chipEnum,
  tipo_venta: saleTypeEnum,
  stl: z.string().max(50, 'Máximo 50 caracteres').optional().or(z.literal('')),
  sap: z.string().max(50, 'Máximo 50 caracteres').optional().or(z.literal('')),
  cliente_id: commonSchemas.uuid,
  vendedor_id: commonSchemas.uuid,
  multiple: z.number().min(0, 'La cantidad no puede ser negativa').default(0),
  plan_id: commonSchemas.idNumerico,
  empresa_origen_id: commonSchemas.idNumerico,
  promocion_id: commonSchemas.numeroOpcional,
});

export const ventaCreateSchema = ventaBaseSchema.extend({
  cliente_id: commonSchemas.uuid, // Cliente ID debe ser UUID válido
  vendedor_id: commonSchemas.uuid.optional(), // Vendedor ID opcional para evitar errores en el frontend
});

export const ventaUpdateSchema = ventaBaseSchema.partial();

export const saleFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  tipo_venta: saleTypeEnum.optional(),
  vendedor_id: commonSchemas.uuid.optional(),
  cliente_id: commonSchemas.uuid.optional(),
  plan_id: commonSchemas.idNumerico.optional(),
  fecha_desde: z.string().optional(),
  fecha_hasta: z.string().optional(),
  search: z.string().optional(),
});

export const saleCreateRequestSchema = z.object({
  venta: ventaCreateSchema,
  correo: correoSchema,
  portabilidad: portabilidadSchema.optional(),
}).refine(
  (data) => {
    // Si el tipo de venta es PORTABILIDAD, se requiere portabilidad
    if (data.venta.tipo_venta === 'PORTABILIDAD') {
      return data.portabilidad !== undefined;
    }
    return true;
  },
  {
    message: 'Los datos de portabilidad son requeridos para portabilidades',
    path: ['portabilidad'],
  }
);

export const saleStatsFiltersSchema = z.object({
  fecha_desde: z.string().optional(),
  fecha_hasta: z.string().optional(),
  vendedor_id: commonSchemas.uuid.optional(),
  plan_id: commonSchemas.idNumerico.optional(),
});

// Tipos inferidos
export type VentaBase = z.infer<typeof ventaBaseSchema>;
export type VentaCreate = z.infer<typeof ventaCreateSchema>;
export type VentaUpdate = z.infer<typeof ventaUpdateSchema>;
export type SaleFilters = z.infer<typeof saleFiltersSchema>;
export type SaleCreateRequest = z.infer<typeof saleCreateRequestSchema>;
export type SaleStatsFilters = z.infer<typeof saleStatsFiltersSchema>;