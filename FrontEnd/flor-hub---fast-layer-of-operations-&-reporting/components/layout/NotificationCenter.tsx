import React, { useEffect, useState, useCallback } from 'react';
import { mensajesService, Mensaje } from '../../services/mensajes';
import { NotificationDetailModal } from '../modals/NotificationDetailModal';
import { useToast } from '../../contexts/ToastContext';

interface NotificationCenterProps {
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString();
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose, onUnreadCountChange }) => {
  const [alertas, setAlertas] = useState<Mensaje[]>([]);
  const [notificaciones, setNotificaciones] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Mensaje | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const { addToast } = useToast();

  const sortByFecha = useCallback((items: Mensaje[]) => {
    return [...items].sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [alertasResponse, inboxResponse] = await Promise.all([
        mensajesService.getAlertasPendientes(1, 10),
        mensajesService.getInbox(1, 20),
      ]);

      if (alertasResponse.success && alertasResponse.data) {
        setAlertas(sortByFecha(alertasResponse.data));
      } else if (!alertasResponse.success) {
        setError(alertasResponse.message || 'Error al obtener alertas');
      }

      if (inboxResponse.success && inboxResponse.data) {
        const notifs = inboxResponse.data.filter(m => m.tipo === 'NOTIFICACION');
        setNotificaciones(sortByFecha(notifs));
      } else if (!inboxResponse.success) {
        setError(inboxResponse.message || 'Error al obtener notificaciones');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, [sortByFecha]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateUnreadCount = useCallback((items: Mensaje[]) => {
    const unread = items.filter(m => !m.leida).length;
    onUnreadCountChange?.(unread);
  }, [onUnreadCountChange]);

  const handleDelete = async (mensajeId: number) => {
    if (confirmDeleteId !== mensajeId) {
      setConfirmDeleteId(mensajeId);
      setTimeout(() => setConfirmDeleteId(null), 3000);
      return;
    }
    try {
      setDeletingId(mensajeId);
      const response = await mensajesService.eliminar(mensajeId);
      if (response.success) {
        setNotificaciones(prev => prev.filter(m => m.mensaje_id !== mensajeId));
        setAlertas(prev => prev.filter(m => m.mensaje_id !== mensajeId));
        addToast({ type: 'success', title: 'Eliminado', message: 'Notificación eliminada.' });
      }
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'No se pudo eliminar.' });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleMarcarLeido = async (mensajeId: number) => {
    try {
      const response = await mensajesService.marcarComoLeido(mensajeId);
      if (!response.success) {
        throw new Error(response.message || 'No se pudo marcar como leído');
      }
      setNotificaciones(prev => prev.map(m => m.mensaje_id === mensajeId ? { ...m, leida: true } : m));
      setAlertas(prev => prev.map(m => m.mensaje_id === mensajeId ? { ...m, leida: true } : m));
    } catch (err) {
      console.error('Error marking as read:', err);
      setError('No se pudo marcar como leído');
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      const response = await mensajesService.marcarTodasLeidas();
      if (!response.success) {
        throw new Error(response.message || 'No se pudieron marcar como leídas');
      }
      setNotificaciones(prev => prev.map(m => ({ ...m, leida: true })));
      setAlertas(prev => prev.map(a => ({ ...a, leida: true })));
      addToast({ type: 'success', title: 'Completado', message: 'Todas las notificaciones marcadas como leídas.' });
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError('No se pudieron marcar todas como leídas');
    }
  };

  const handleOpenDetail = (mensaje: Mensaje) => {
    setSelectedNotification(mensaje);
  };

  const handleDeletedFromModal = (mensajeId: number) => {
    setNotificaciones(prev => prev.filter(m => m.mensaje_id !== mensajeId));
    setAlertas(prev => prev.filter(m => m.mensaje_id !== mensajeId));
  };

  const unreadCount = [...alertas, ...notificaciones].filter(m => !m.leida).length;

  return (
    <>
      <div 
        className="absolute top-[8.5vh] right-0 w-[92vw] md:w-[45vw] lg:w-[32vw] xl:w-[28vw] 2xl:w-[25vw] glass-panel rounded-[4vh] shadow-[0_5vh_10vh_-2vh_rgba(0,0,0,0.4)] z-[100] overflow-hidden border-2 border-white/80 dark:border-white/10 animate-in fade-in slide-in-from-top-6 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Premium */}
        <div className="p-[3vh] bg-gradient-to-br from-indigo-600 via-indigo-950 to-indigo-900 dark:from-slate-900 dark:via-indigo-950 dark:to-indigo-900 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
          <div className="relative z-10">
            <h3 className="font-black tracking-[0.3em] text-indigo-300 uppercase leading-none mb-[0.8vh] text-[clamp(0.65rem,1.2vh,1.5rem)]">Centro de Mando</h3>
            <p className="font-black tracking-tighter uppercase italic text-[clamp(1.2rem,2.5vh,3rem)]">Alertas & Eventos</p>
          </div>
          <div className="relative z-10 flex items-center gap-[1.5vh]">
            {unreadCount > 0 && (
              <span className="font-black bg-white/20 text-white px-[1.5vh] py-[0.4vh] rounded-full text-[clamp(0.6rem,1vh,1.4rem)]">{unreadCount} no leídas</span>
            )}
            <button 
              onClick={onClose} 
              className="w-[4.5vh] h-[4.5vh] flex items-center justify-center rounded-[1.5vh] bg-white/10 hover:bg-rose-500 hover:rotate-90 transition-all duration-300 group"
            >
              <svg className="w-[2.5vh] h-[2.5vh] group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="max-h-[70vh] overflow-y-auto no-scrollbar bg-slate-50/90 dark:bg-slate-900/95 backdrop-blur-xl">
          {loading && (
            <div className="p-[3vh] space-y-[2vh] skeleton">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-full h-[10vh] bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          )}

          {error && (
            <div className="p-[3vh] text-center text-rose-500">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Sección Crítica - Alertas */}
              <div className="p-[2.5vh]">
                <div className="flex items-center justify-between mb-[2vh]">
                  <div className="flex items-center gap-[1.5vh]">
                    <span className="w-[1.5vh] h-[1.5vh] bg-rose-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]"></span>
                    <p className="font-black text-rose-600 dark:text-rose-400 uppercase tracking-[0.25em] text-[clamp(0.7rem,1.2vh,1.8rem)]">Prioridad Crítica</p>
                  </div>
                  <span className="font-black bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-[1.5vh] py-[0.4vh] rounded-full uppercase text-[clamp(0.6rem,1vh,1.4rem)]">{alertas.length} Alertas</span>
                </div>

                <div className="space-y-[1.5vh]">
                  {alertas.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No hay alertas pendientes</p>
                  ) : (
                    alertas.map(n => (
                      <div key={n.mensaje_id} className="group relative p-[2vh] bg-white dark:bg-slate-800 border border-rose-100 dark:border-rose-900/30 shadow-sm hover:shadow-md hover:border-rose-300 dark:hover:border-rose-500 transition-all duration-300 overflow-hidden active:scale-[0.98]">
                        <div className="absolute top-0 left-0 w-[0.6vh] h-full bg-rose-500 opacity-80"></div>
                        <div className="flex justify-between items-start mb-[1vh] pl-[1.5vh]">
                          <h4 className="font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tighter group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors text-[clamp(0.85rem,1.6vh,2.5rem)]">{n.titulo}</h4>
                          <div className="flex items-center gap-[0.8vh]">
                            {!n.leida && <span className="w-[1.2vh] h-[1.2vh] rounded-full bg-rose-500 shadow-lg"></span>}
                            <span className="font-black text-slate-400 dark:text-slate-500 whitespace-nowrap opacity-60 uppercase text-[clamp(0.6rem,1vh,1.5rem)]">{formatTimeAgo(n.fecha_creacion)}</span>
                          </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed pl-[1.5vh] mb-[2vh] text-[clamp(0.75rem,1.3vh,2rem)] line-clamp-2">{n.comentario}</p>
                        <div className="flex justify-end gap-[1.5vh] pl-[1.5vh]">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(n.mensaje_id); }}
                            disabled={deletingId === n.mensaje_id}
                            className={`font-black uppercase tracking-widest px-[2vh] py-[1vh] rounded-[1.2vh] transition-all text-[clamp(0.6rem,1vh,1.4rem)] ${
                              confirmDeleteId === n.mensaje_id
                                ? 'bg-rose-600 text-white'
                                : 'text-rose-400 hover:text-rose-600 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40'
                            }`}
                          >
                            {deletingId === n.mensaje_id ? '...' : confirmDeleteId === n.mensaje_id ? 'Confirmar' : 'Eliminar'}
                          </button>
                          <button
                            onClick={() => handleOpenDetail(n)}
                            className="font-black uppercase tracking-widest bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-[2vh] py-[1vh] rounded-[1.2vh] hover:bg-rose-600 dark:hover:bg-rose-600 hover:text-white transition-all text-[clamp(0.6rem,1vh,1.4rem)]"
                          >
                            Ver Detalle
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Divisor Bento */}
              <div className="px-[2.5vh] py-[1vh] flex items-center gap-[1.5vh] opacity-30">
                <div className="h-px bg-indigo-900/20 dark:bg-indigo-400/20 flex-1"></div>
                <div className="w-[0.6vh] h-[0.6vh] bg-indigo-900 dark:bg-indigo-400 rounded-full"></div>
                <div className="h-px bg-indigo-900/20 dark:bg-indigo-400/20 flex-1"></div>
              </div>

              {/* Sección Reciente - Notificaciones */}
              <div className="p-[2.5vh]">
                <div className="flex items-center justify-between mb-[2vh]">
                  <div className="flex items-center gap-[1.5vh]">
                    <span className="w-[1.5vh] h-[1.5vh] bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)]"></span>
                    <p className="font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.25em] text-[clamp(0.7rem,1.2vh,1.8rem)]">Notificaciones Hub</p>
                  </div>
                  {notificaciones.length > 0 && (
                    <button
                      onClick={handleMarcarTodasLeidas}
                      className="font-bold text-indigo-400 hover:text-indigo-600 dark:text-indigo-500 dark:hover:text-indigo-300 transition-colors text-[clamp(0.6rem,1vh,1.4rem)] flex items-center gap-[0.5vh]"
                    >
                      <svg className="w-[1.5vh] h-[1.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Marcar todas leídas
                    </button>
                  )}
                </div>

                <div className="space-y-[1.5vh]">
                  {notificaciones.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No hay notificaciones</p>
                  ) : (
                    notificaciones.map(n => (
                      <div
                        key={n.mensaje_id}
                        className="group p-[2vh] bg-white/60 dark:bg-slate-800/60 border border-white dark:border-white/5 rounded-[2.5vh] hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-100 dark:hover:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98]"
                      >
                        <div className="flex items-start gap-[1.5vh]">
                          <div
                            onClick={() => handleOpenDetail(n)}
                            className="w-[4.5vh] h-[4.5vh] rounded-[1.5vh] bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-all cursor-pointer shrink-0"
                          >
                            <svg className="w-[2.2vh] h-[2.2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </div>
                          <div
                            onClick={() => handleOpenDetail(n)}
                            className="flex-1 cursor-pointer min-w-0"
                          >
                            <div className="flex justify-between items-center mb-[0.8vh]">
                              <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none text-[clamp(0.85rem,1.5vh,2.2rem)] truncate">{n.titulo}</h4>
                              <div className="flex items-center gap-[0.6vh] shrink-0 ml-[1vh]">
                                {!n.leida && <span className="w-[1vh] h-[1vh] rounded-full bg-indigo-500 shadow"></span>}
                                <span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[clamp(0.6rem,0.9vh,1.5rem)] whitespace-nowrap">{formatTimeAgo(n.fecha_creacion)}</span>
                              </div>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-[clamp(0.75rem,1.3vh,2rem)] line-clamp-2">{n.comentario}</p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(n.mensaje_id); }}
                            disabled={deletingId === n.mensaje_id}
                            className={`shrink-0 w-[3.5vh] h-[3.5vh] flex items-center justify-center rounded-[1vh] transition-all ${
                              confirmDeleteId === n.mensaje_id
                                ? 'bg-rose-600 text-white'
                                : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 opacity-0 group-hover:opacity-100'
                            }`}
                            title="Eliminar"
                          >
                            {deletingId === n.mensaje_id ? (
                              <svg className="animate-spin w-[1.8vh] h-[1.8vh]" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                              </svg>
                            ) : (
                              <svg className="w-[1.8vh] h-[1.8vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Acciones */}
        <div className="p-[2.5vh] bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5 flex items-center justify-center gap-[2vh] shrink-0">
          <button
            onClick={handleMarcarTodasLeidas}
            className="font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 uppercase tracking-[0.25em] transition-all flex items-center gap-[1.2vh] group text-[clamp(0.7rem,1.2vh,1.8rem)]"
          >
            Marcar Todo Leído
            <svg className="w-[2.2vh] h-[2.2vh] group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </button>
        </div>
      </div>

      {selectedNotification && (
        <NotificationDetailModal
          mensaje={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onDeleted={handleDeletedFromModal}
          onMarkRead={(id) => {
            setNotificaciones(prev => prev.map(m => m.mensaje_id === id ? { ...m, leida: true } : m));
            setAlertas(prev => prev.map(m => m.mensaje_id === id ? { ...m, leida: true } : m));
          }}
        />
      )}
    </>
  );
};
