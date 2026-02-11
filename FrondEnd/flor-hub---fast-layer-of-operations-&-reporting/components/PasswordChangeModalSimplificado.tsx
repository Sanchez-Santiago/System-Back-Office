import React, { useState, useCallback } from 'react';
import { api } from '../services/api';
import { getCurrentUserId, buildPasswordChangeUrl } from '../utils/userHelpers';

interface PasswordChangeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

  const getPasswordStrength = (password: string): { score: number, feedback: string } => {
    let score = 0;
    let feedback = '';

    // Evaluación de longitud
    if (password.length < 8) {
      score = 1;
      feedback = 'Muy corta (mínimo 8 caracteres)';
    } else if (password.length < 12) {
      score = 2;
      feedback = 'Corta (considera usar más caracteres)';
    } else if (password.length >= 12 && password.length < 16) {
      score = 3;
      feedback = 'Buena';
    } else if (password.length >= 16) {
      score = 4;
      feedback = 'Muy fuerte';
    }

    // Evaluación de complejidad
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*()\-_=+[\]{}|;:,.<>?]/.test(password);

    if (!hasLowercase) score--;
    if (!hasUppercase) score--;
    if (!hasNumbers) score--;
    if (!hasSpecialChars) score--;

    return { score, feedback };
  };

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    passwordActual: '',
    passwordNueva: '',
    passwordNuevaConfirmacion: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Obtener el ID del usuario actual usando el helper
  const userId = getCurrentUserId();
  
  if (!userId) {
    console.error('No se pudo obtener el ID del usuario para actualizar contraseña');
    setError('No se pudo identificar al usuario. Por favor, reinicia sesión.');
    return null;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!userId) {
      setError('No se pudo identificar al usuario. Por favor, reinicia sesión.');
      setIsLoading(false);
      return;
    }

    try {
      // Construir la URL correcta con el ID del usuario usando el helper
      const passwordUrl = buildPasswordChangeUrl(userId);
      console.log('🔍 [PASSWORD] URL construida:', passwordUrl);
      console.log('🔍 [PASSWORD] ID del usuario:', userId);
      const response = await api.patch(passwordUrl, {
        passwordActual: formData.passwordActual,
        passwordNueva: formData.passwordNueva,
        passwordNuevaConfirmacion: formData.passwordNuevaConfirmacion
      });

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Error al actualizar contraseña');
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, formData, isLoading, error, onClose, onSuccess]);
    } catch (err: any) {
      if (err.message && err.message.includes('401')) {
        setError('La contraseña actual es incorrecta');
      } else if (err.message && err.message.includes('403')) {
        setError('No tienes permisos para realizar esta acción');
      } else if (err.message && err.message.includes('404')) {
        setError('Usuario no encontrado');
      } else {
        setError('Error de conexión. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, formData, isLoading, error, onClose, onSuccess]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] shadow-2xl max-w-md w-full mx-auto">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Actualizar Contraseña</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <p className="text-sm text-rose-600 font-medium">{error}</p>
            </div>
          )}

          {/* Contraseña Actual */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contraseña Actual
            </label>
            <input
                type="password"
                value={formData.passwordActual}
                onChange={(e) => handleInputChange('passwordActual', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Ingresa tu contraseña actual"
                required
              />
          </div>

          {/* Nueva Contraseña */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nueva Contraseña
            </label>
            <input
                type="password"
                value={formData.passwordNueva}
                onChange={(e) => handleInputChange('passwordNueva', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Crea una nueva contraseña"
                required
              />
          </div>

          {/* Confirmar Nueva Contraseña */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Confirmar Nueva Contraseña
            </label>
            <input
                type="password"
                value={formData.passwordNuevaConfirmacion}
                onChange={(e) => handleInputChange('passwordNuevaConfirmacion', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Confirma tu nueva contraseña"
                required
              />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};