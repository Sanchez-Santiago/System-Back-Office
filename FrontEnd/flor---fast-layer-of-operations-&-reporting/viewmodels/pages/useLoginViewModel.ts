import { useState, useEffect, useRef } from 'react';
import { MOCK_USERS } from '../../services/mockUsers';

export function useLoginViewModel(onLogin: (email: string, password: string) => Promise<boolean>, error?: string | null) {
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [keepSession, setKeepSession] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{email?: string; password?: string}>({});
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalError(error ?? null);
  }, [error]);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const validateEmail = (email: string): string | null => {
    if (!email) return 'Email requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email inválido';
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return 'Contraseña requerida';
    if (password.length < 4) return 'Contraseña demasiado corta';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setFieldErrors({
      ...(emailError ? { email: emailError } : {}),
      ...(passwordError ? { password: passwordError } : {}),
    });

    if (emailError || passwordError) return;

    localStorage.setItem('keepSession', keepSession ? 'true' : 'false');
    setLoading(true);

    try {
      await onLogin(email, password);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    const vError = field === 'email' ? validateEmail(value) : validatePassword(value);
    setFieldErrors(prev => ({ ...prev, [field]: vError || undefined }));
    if (localError) setLocalError(null);
  };

  const fillInspectionUser = (email: string) => {
    const emailInput = document.querySelector<HTMLInputElement>('input[name="email"]');
    const passwordInput = document.querySelector<HTMLInputElement>('input[name="password"]');
    if (emailInput) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeInputValueSetter?.call(emailInput, email);
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      handleInputChange('email', email);
    }
    if (passwordInput) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeInputValueSetter?.call(passwordInput, 'demo123');
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      handleInputChange('password', 'demo123');
    }
  };

  const dismissError = () => {
    setLocalError(null);
  };

  const getInputBorder = (field: 'email' | 'password') =>
    fieldErrors[field] ? 'border-red-400' : 'border-slate-200 dark:border-white/10';

  return {
    state: {
      loading,
      localError,
      showPassword,
      keepSession,
      fieldErrors,
      emailRef,
      inspectionUsers: MOCK_USERS,
      getInputBorder,
    },
    actions: {
      setShowPassword,
      setKeepSession,
      handleSubmit,
      handleInputChange,
      fillInspectionUser,
      dismissError,
    },
  };
}
