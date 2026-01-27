import { z } from 'zod';
import { toast } from 'sonner';
import { salesApi } from './salesApi';
import { plansApi } from './plansApi';
import { saleCreateRequestSchema } from '../schemas';
import { loginSchema, registerSchema, changePasswordSchema } from '../schemas/auth';
import { authService } from './auth';

export class ValidatedSalesApi {
  async createSale(data: unknown): Promise<void> {
    try {
      // Validar datos con Zod antes de enviar
      const validatedData = saleCreateRequestSchema.parse(data);
      
      const result = await salesApi.createCompleteSale(validatedData);
      
      if (result.success) {
        toast.success('Venta creada exitosamente');
      } else {
        throw new Error(result.message || 'Error al crear la venta');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        formattedErrors.forEach(err => toast.error(err));
        throw error;
      }
      
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error al crear la venta');
      }
      throw error;
    }
  }

  async updateSale(id: number, data: unknown): Promise<void> {
    try {
      // Para actualizaciones, usamos una validación parcial
      const partialSchema = saleCreateRequestSchema.partial();
      const validatedData = partialSchema.parse(data);
      
      const result = await salesApi.updateSale(id, validatedData.venta || {});
      
      if (result.success) {
        toast.success('Venta actualizada exitosamente');
      } else {
        throw new Error(result.message || 'Error al actualizar la venta');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        formattedErrors.forEach(err => toast.error(err));
        throw error;
      }
      
      toast.error('Error al actualizar la venta');
      throw error;
    }
  }
}

export class ValidatedAuthService {
  async login(data: unknown): Promise<void> {
    try {
      const validatedData = loginSchema.parse(data);
      const result = await authService.login(validatedData.user);
      
      if (result.success) {
        toast.success('Inicio de sesión exitoso');
      } else {
        throw new Error(result.message || 'Error de autenticación');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        formattedErrors.forEach(err => toast.error(err));
        throw error;
      }
      
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error de autenticación');
      }
      throw error;
    }
  }

  async register(data: unknown): Promise<void> {
    try {
      const validatedData = registerSchema.parse(data);
      const result = await authService.register(validatedData.user);
      
      if (result.success) {
        toast.success('Registro exitoso');
      } else {
        throw new Error(result.message || 'Error al registrarse');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        formattedErrors.forEach(err => toast.error(err));
        throw error;
      }
      
      toast.error('Error al registrarse');
      throw error;
    }
  }

  async changePassword(data: unknown): Promise<void> {
    try {
      const validatedData = changePasswordSchema.parse(data);
      const result = await authService.changePassword(validatedData);
      
      if (result.success) {
        toast.success('Contraseña cambiada exitosamente');
      } else {
        throw new Error(result.message || 'Error al cambiar contraseña');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        formattedErrors.forEach(err => toast.error(err));
        throw error;
      }
      
      toast.error('Error al cambiar contraseña');
      throw error;
    }
  }
}

export class ValidatedPlansApi {
  async createPlan(data: unknown): Promise<void> {
    try {
      // Para planes, creamos un esquema simple de validación
      const planSchema = z.object({
        nombre: z.string().min(2, 'Nombre requerido'),
        precio: z.number().min(0, 'El precio no puede ser negativo'),
        descripcion: z.string().optional(),
        tipo: z.enum(['PREPAGO', 'POSTPAGO']),
      });
      
      const validatedData = planSchema.parse(data);
      const result = await plansApi.createPlan(validatedData);
      
      if (result.success) {
        toast.success('Plan creado exitosamente');
      } else {
        throw new Error(result.message || 'Error al crear el plan');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => err.message);
        formattedErrors.forEach(err => toast.error(err));
        throw error;
      }
      
      toast.error('Error al crear el plan');
      throw error;
    }
  }
}

// Exportaciones de instancias únicas
export const validatedSalesApi = new ValidatedSalesApi();
export const validatedAuthService = new ValidatedAuthService();
export const validatedPlansApi = new ValidatedPlansApi();