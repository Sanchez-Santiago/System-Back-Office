import { useState } from 'react';
import { useVentaComentarios } from '../../hooks/useVentaComentarios';
import { createComentario, TipoComentario } from '../../services/createComentario';
import { useToast } from '../../contexts/ToastContext';

export function useCommentViewModel(ventaId: number) {
  const { comentarios, isLoading, refetch } = useVentaComentarios(ventaId);
  const { addToast } = useToast();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [tipo, setTipo] = useState<TipoComentario>('GENERAL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateStr: string): string => {
    if (!dateStr || dateStr === '{}' || dateStr === 'Invalid Date') return '-';
    if (/^\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}$/.test(dateStr)) return dateStr;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getTipoIcon = (tipo: string): string => {
    switch (tipo) {
      case 'GENERAL': return '📝';
      case 'IMPORTANTE': return '⚠️';
      case 'SEGUIMIENTO': return '📋';
      case 'SISTEMA': return '🔧';
      default: return '📝';
    }
  };

  const getTipoColor = (tipo: string): string => {
    switch (tipo) {
      case 'GENERAL': return 'border-l-indigo-500';
      case 'IMPORTANTE': return 'border-l-red-500';
      case 'SEGUIMIENTO': return 'border-l-amber-500';
      case 'SISTEMA': return 'border-l-slate-500';
      default: return 'border-l-indigo-500';
    }
  };

  const handleSubmit = async (e: React.FormEvent, onSuccess?: () => void) => {
    e.preventDefault();
    if (!title || !text || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createComentario({
        titulo: title,
        comentario: text,
        venta_id: ventaId,
        tipo_comentario: tipo
      });
      setTitle('');
      setText('');
      setTipo('GENERAL');

      addToast({
        type: 'success',
        title: 'Comentario Agregado',
        message: 'El comentario se ha publicado correctamente.'
      });

      if (onSuccess) onSuccess();
      refetch();
    } catch (error) {
      console.error('Error al añadir comentario:', error);

      addToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo agregar el comentario. Intenta nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    state: {
      comentarios,
      isLoading,
      title,
      text,
      tipo,
      isSubmitting,
      formatDate,
      getTipoIcon,
      getTipoColor,
    },
    actions: {
      setTitle,
      setText,
      setTipo,
      handleSubmit,
      refetch,
    },
  };
}
