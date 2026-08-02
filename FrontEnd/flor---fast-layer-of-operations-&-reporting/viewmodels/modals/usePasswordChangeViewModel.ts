import { useState, useCallback } from 'react';
import { api } from '../../services/api';
import { buildPasswordChangeUrl } from '../../utils/userHelpers';
import useAuthCheck from '../../hooks/useAuthCheck';
import { useToast } from '../../contexts/ToastContext';

export const checkPasswordRequirements = (password: string, currentPassword: string) => {
  return {
    minLength: password.length >= 8,
    maxLength: password.length <= 100,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    isDifferent: password !== currentPassword && password.length > 0,
  };
};

interface PasswordChangeViewModelProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function usePasswordChangeViewModel({ onClose, onSuccess }: PasswordChangeViewModelProps) {
  const [formData, setFormData] = useState({
    passwordActual: '',
    passwordNueva: '',
    passwordNuevaConfirmacion: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthCheck();
  const { addToast } = useToast();
  const userId = user?.id || localStorage.getItem('userId');

  const requirements = checkPasswordRequirements(formData.passwordNueva, formData.passwordActual);
  const allRequirementsMet = Object.values(requirements).every(req => req);
  const passwordsMatch = formData.passwordNueva === formData.passwordNuevaConfirmacion && formData.passwordNueva.length > 0;

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

    if (formData.passwordNueva !== formData.passwordNuevaConfirmacion) {
      setError('Las contraseñas nuevas no coinciden.');
      setIsLoading(false);
      return;
    }

    if (!allRequirementsMet) {
      setError('La contraseña no cumple con todos los requisitos.');
      setIsLoading(false);
      return;
    }

    if (import.meta.env.VITE_APP_ENV === 'inspection') {
      setTimeout(() => {
        console.log('🕵️ [INSPECTION MODE] Contraseña actualizada simulada');
        onSuccess();
        onClose();
        setIsLoading(false);
      }, 1000);
      return;
    }

    try {
      const passwordUrl = buildPasswordChangeUrl(userId);
      const response = await api.patch(passwordUrl, {
        passwordActual: formData.passwordActual,
        passwordNueva: formData.passwordNueva,
        passwordNuevaConfirmacion: formData.passwordNuevaConfirmacion,
      });

      if (response.success) {
        addToast({
          type: 'success',
          title: 'Contraseña Actualizada',
          message: 'Tu contraseña se ha cambiado exitosamente.',
        });
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Error al actualizar contraseña');
        addToast({
          type: 'error',
          title: 'Error',
          message: response.message || 'No se pudo cambiar la contraseña.',
        });
      }
    } catch (err: any) {
      console.error('Error changing password:', err);
      let errorMessage = 'Error de conexión. Intenta nuevamente.';
      if (err.message?.includes('401')) {
        errorMessage = 'La contraseña actual es incorrecta';
      } else if (err.message?.includes('403')) {
        errorMessage = 'No tienes permisos para realizar esta acción';
      } else if (err.message?.includes('404')) {
        errorMessage = 'Usuario no encontrado';
      } else if (err.message?.includes('diferente')) {
        errorMessage = 'La nueva contraseña debe ser diferente a la actual';
      }
      setError(errorMessage);
      addToast({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, formData, allRequirementsMet, onClose, onSuccess]);

  const state = {
    formData, isLoading, error, requirements, allRequirementsMet, passwordsMatch,
  };

  const actions = {
    handleInputChange, handleSubmit,
  };

  return { state, actions };
}
