// Exportaciones principales de esquemas
export * from './common';
export * from './auth';
export * from './correo';
export * from './portabilidad';
export * from './sales';

// Exportaciones específicas más comunes
export {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  type LoginCredentials,
  type RegisterData,
  type ChangePasswordData,
} from './auth';

export {
  correoSchema,
  correoUpdateSchema,
  correoFiltersSchema,
  type CorreoCreate,
  type CorreoUpdate,
  type CorreoFilters,
} from './correo';

export {
  portabilidadSchema,
  portabilidadUpdateSchema,
  type PortabilidadCreate,
  type PortabilidadUpdate,
} from './portabilidad';

export {
  ventaBaseSchema,
  ventaCreateSchema,
  ventaUpdateSchema,
  saleFiltersSchema,
  saleCreateRequestSchema,
  saleStatsFiltersSchema,
  type VentaBase,
  type VentaCreate,
  type VentaUpdate,
  type SaleFilters,
  type SaleCreateRequest,
  type SaleStatsFilters,
} from './sales';