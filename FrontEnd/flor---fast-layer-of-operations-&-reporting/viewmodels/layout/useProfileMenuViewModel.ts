import { useState } from 'react';
import { useAuthCheck } from '../../hooks/useAuthCheck';
import { api } from '../../services/api';

type MenuState = 'MAIN' | 'UPDATE_SUBMENU' | 'CONFIG_SUBMENU' | 'ABOUT_SUBMENU';
type UploadModalType = 'estado-venta' | 'seguimiento-linea' | 'correo' | 'oferta' | null;

export function useProfileMenuViewModel() {
  const [view, setView] = useState<MenuState>('MAIN');
  const [activeModal, setActiveModal] = useState<UploadModalType>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPermissionsTooltip, setShowPermissionsTooltip] = useState(false);

  const { user } = useAuthCheck();

  const permisosPrioridad = ["SUPERADMIN", "ADMIN", "BACK_OFFICE", "SUPERVISOR", "VENDEDOR"];
  const permisoPrincipal = user?.permisos?.find(p => permisosPrioridad.includes(p));
  const otrosPermisos = user?.permisos?.filter(p => p !== permisoPrincipal);

  const handleUploadEstadoVenta = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post<{ success: boolean; message: string }>('actualizar/estado-venta', formData);
      if (!response.success) {
        throw new Error(response.message || 'Error desconocido');
      }
    } catch (error: any) {
      console.error('Error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadSeguimientoLinea = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post<{ success: boolean; message: string }>('actualizar/seguimiento-linea', formData);
      if (!response.success) {
        throw new Error(response.message || 'Error desconocido');
      }
    } catch (error: any) {
      console.error('Error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadCorreo = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post<{ success: boolean; message: string }>('actualizar/correo', formData);
      if (!response.success) {
        throw new Error(response.message || 'Error desconocido');
      }
    } catch (error: any) {
      console.error('Error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const state = {
    view, activeModal, isUploading, showPasswordModal, showPermissionsTooltip,
    user, permisoPrincipal, otrosPermisos,
  };

  const actions = {
    setView, setActiveModal, setShowPasswordModal, setShowPermissionsTooltip,
    handleUploadEstadoVenta, handleUploadSeguimientoLinea, handleUploadCorreo,
  };

  return { state, actions };
}
