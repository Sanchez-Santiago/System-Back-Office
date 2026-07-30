import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Mensaje, mensajesService } from '../../services/mensajes';
import { useToast } from '../../contexts/ToastContext';

interface NotificationDetailModalProps {
  mensaje: Mensaje;
  onClose: () => void;
  onDeleted: (mensajeId: number) => void;
  onMarkRead: (mensajeId: number) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  mensaje,
  onClose,
  onDeleted,
  onMarkRead,
}) => {
  const { addToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isAlerta = mensaje.tipo === 'ALERTA';

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      setIsDeleting(true);
      const response = await mensajesService.eliminar(mensaje.mensaje_id);
      if (response.success) {
        addToast({ type: 'success', title: 'Eliminado', message: 'Notificación eliminada.' });
        onDeleted(mensaje.mensaje_id);
        onClose();
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar la notificación.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkRead = async () => {
    try {
      await mensajesService.marcarComoLeido(mensaje.mensaje_id);
      onMarkRead(mensaje.mensaje_id);
      addToast({ type: 'info', title: 'Leído', message: 'Marcado como leído.' });
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'No se pudo marcar como leído.' });
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-[2vw]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-[90vw] md:w-[50vw] lg:w-[40vw] xl:w-[35vw] bg-white dark:bg-slate-900 rounded-[clamp(1rem,3vh,2rem)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border dark:border-white/5">
        <div className={`h-[10vh] ${isAlerta ? 'bg-gradient-to-br from-rose-600 to-red-700' : 'bg-gradient-to-br from-indigo-600 to-purple-700'} transition-all relative`}>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <button
            onClick={onClose}
            className="absolute top-[2vh] right-[2vh] p-[1vh] bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
          >
            <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <div className="absolute bottom-[1.5vh] left-[2.5vw]">
            <span className={`inline-block font-black uppercase tracking-[0.25em] text-[clamp(0.6rem,1vh,1.4rem)] px-[1.5vh] py-[0.4vh] rounded-full ${isAlerta ? 'bg-rose-500/30 text-rose-100' : 'bg-indigo-500/30 text-indigo-100'}`}>
              {isAlerta ? 'Alerta Crítica' : 'Notificación'}
            </span>
          </div>
        </div>

        <div className="px-[2.5vw] py-[2.5vh] space-y-[2vh]">
          <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-[clamp(1.2rem,2.5vh,2rem)]">
            {mensaje.titulo}
          </h2>

          <div className="flex items-center gap-[1.5vh] text-slate-400 dark:text-slate-500 text-[clamp(0.7rem,1.2vh,1.5rem)]">
            <svg className="w-[1.8vh] h-[1.8vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="font-semibold">{formatDate(mensaje.fecha_creacion)}</span>
            {!mensaje.leida && (
              <span className="w-[1vh] h-[1vh] rounded-full bg-indigo-500 shadow"></span>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[1.5vh] p-[2vh] border border-slate-100 dark:border-slate-700/50">
            <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed text-[clamp(0.85rem,1.6vh,1.2rem)] whitespace-pre-wrap">
              {mensaje.comentario}
            </p>
          </div>

          {mensaje.referencia_id && (
            <div className="text-slate-400 dark:text-slate-500 text-[clamp(0.7rem,1.2vh,1.4rem)]">
              <span className="font-semibold">Referencia:</span> #{mensaje.referencia_id}
            </div>
          )}
        </div>

        <div className="px-[2.5vw] py-[2vh] border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-[1.5vh]">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`font-black uppercase tracking-wider px-[2vh] py-[1.2vh] rounded-[1.5vh] transition-all text-[clamp(0.65rem,1.1vh,1.4rem)] ${
              confirmDelete
                ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-500/30'
                : 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40'
            }`}
          >
            {isDeleting ? 'Eliminando...' : confirmDelete ? 'Confirmar Eliminar' : 'Eliminar'}
          </button>

          <div className="flex items-center gap-[1.5vh]">
            {!mensaje.leida && (
              <button
                onClick={handleMarkRead}
                className="font-black uppercase tracking-wider bg-indigo-600 text-white px-[2vh] py-[1.2vh] rounded-[1.5vh] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 text-[clamp(0.65rem,1.1vh,1.4rem)]"
              >
                Marcar Leído
              </button>
            )}
            <button
              onClick={onClose}
              className="font-bold text-slate-500 dark:text-slate-400 px-[2vh] py-[1.2vh] rounded-[1.5vh] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-[clamp(0.65rem,1.1vh,1.4rem)]"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
