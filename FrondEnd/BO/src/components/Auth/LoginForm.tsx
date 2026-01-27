// src/components/Auth/LoginForm.tsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { handleSubmitWithErrorHandling } from '../../hooks/useFormValidation';
import { useAuthForm } from '../../hooks/useAuthForm';
import { authService } from '../../services/auth';
import { Loader2 } from 'lucide-react';
import type { LoginCredentials } from '../../schemas';

export const LoginForm: React.FC = () => {
  const { login: contextLogin, isLoading } = useAuth();
  const form = useAuthForm();

  const handleLogin = async (data: LoginCredentials) => {
    console.log('🔑 LoginForm: Iniciando login');
    
    // Primero, usar el contexto de autenticación existente
    const contextResult = await contextLogin(data.user.email, data.user.password);
    console.log('🔑 LoginForm: Resultado del contexto:', contextResult);
    
    if (!contextResult.success) {
      throw new Error(contextResult.message || 'Error de autenticación');
    }

    // Después del login exitoso, redirigir
    console.log('✅ LoginForm: Login exitoso, redirigiendo...');
    
    // Pequeña demora para asegurar que el estado se actualice
    setTimeout(() => {
      console.log('🔑 LoginForm: Ejecutando redirección');
      // Intentar diferentes métodos de redirección
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      } else {
        // Recargar la página si ya estamos en la raíz
        window.location.reload();
      }
    }, 100);

    return contextResult;
  };

  const onSubmit = handleSubmitWithErrorHandling(form, handleLogin);

return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="w-full max-w-md p-8 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-slate-200/50">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            System Back Office
          </h1>
          <p className="text-gray-600 mt-2">Inicia sesión para continuar</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="user.email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      disabled={isLoading}
                      className="mt-1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="user.password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••"
                      disabled={isLoading}
                      className="mt-1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Sistema de gestión de ventas de telecomunicaciones
        </div>
      </div>
    </div>
  );
};