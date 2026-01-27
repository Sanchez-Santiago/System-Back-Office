import { useFormValidation } from './useFormValidation';
import { saleCreateRequestSchema, type SaleCreateRequest } from '../schemas';

export function useSaleForm() {
  const defaultValues: Partial<SaleCreateRequest> = {
    venta: {
      tipo_venta: 'LINEA_NUEVA',
      chip: 'SIM',
      multiple: 0,
      vendedor_id: '00000000-0000-0000-0000-000000000000', // UUID por defecto para evitar error de validación
    },
    correo: {
      direccion: '',
      numero_casa: 0,
      localidad: '',
      departamento: '',
      codigo_postal: 0,
      telefono_contacto: '',
      destinatario: '',
    },
  };

  return useFormValidation(saleCreateRequestSchema, defaultValues);
}