import React, { useEffect, useState } from 'react';
import { mensajesService, Mensaje } from '../../services/mensajes';

interface NotificationCenterProps {
  onClose: () => void;
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

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const [alertas, setAlertas] = useState<Mensaje[]>([]);
  const [notificaciones, setNotificaciones] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch alertas pendientes (solo las que requieren acción)
        const alertasResponse = await mensajesService.getAlertasPendientes(1, 10);
        if (alertasResponse.success && alertasResponse.data) {
          setAlertas(alertasResponse.data);
        }

        // Fetch notificaciones del inbox
        const inboxResponse = await mensajesService.getInbox(1, 20);
        if (inboxResponse.success && inboxResponse.data) {
          // Filtrar solo notificaciones (no alertas)
          const notifs = inboxResponse.data.filter(m => m.tipo === 'NOTIFICACION');
          setNotificaciones(notifs);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Error al cargar notificaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMarcarLeido = async (mensajeId: number) => {
    try {
      await mensajesService.marcarComoLeido(mensajeId);
      // Actualizar el estado local
      setNotificaciones(prev => 
        prev.map(m => m.mensaje_id === mensajeId ? { ...m, resuelto: true } : m)
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  return (
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
        <button 
          onClick={onClose} 
          className="relative z-10 w-[4.5vh] h-[4.5vh] flex items-center justify-center rounded-[1.5vh] bg-white/10 hover:bg-rose-500 hover:rotate-90 transition-all duration-300 group"
        >
          <svg className="w-[2.5vh] h-[2.5vh] group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div className="max-h-[70vh] overflow-y-auto no-scrollbar bg-slate-50/90 dark:bg-slate-900/95 backdrop-blur-xl">
        {loading && (
          <div className="p-[3vh] flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
                    <div key={n.mensaje_id} className="group relative p-[2vh] bg-white dark:bg-slate-800 border border-rose-100 dark:border-rose-900/30 shadow-sm hover:shadow-md hover:border-rose-300 dark:hover:border-rose-500 transition-all duration-300 overflow-hidden cursor-pointer active:scale-[0.98]">
                      <div className="absolute top-0 left-0 w-[0.6vh] h-full bg-rose-500 opacity-80"></div>
                      <div className="flex justify-between items-start mb-[1vh] pl-[1.5vh]">
                        <h4 className="font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tighter group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors text-[clamp(0.85rem,1.6vh,2.5rem)]">{n.titulo}</h4>
                        <span className="font-black text-slate-400 dark:text-slate-500 whitespace-nowrap opacity-60 uppercase text-[clamp(0.6rem,1vh,1.5rem)]">{formatTimeAgo(n.fecha_creacion)}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed pl-[1.5vh] mb-[2vh] text-[clamp(0.75rem,1.3vh,2rem)]">{n.comentario}</p>
                      <div className="flex justify-end gap-[1.5vh] pl-[1.5vh]">
                        {!n.resuelto && (
                          <button 
                            onClick={() => handleMarcarLeido(n.mensaje_id)}
                            className="font-black uppercase tracking-widest bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-[2vh] py-[1vh] rounded-[1.2vh] hover:bg-rose-600 dark:hover:bg-rose-600 hover:text-white transition-all text-[clamp(0.6rem,1vh,1.4rem)]"
                          >
                            Gestionar Ahora
                          </button>
                        )}
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
              </div>

              <div className="space-y-[1.5vh]">
                {notificaciones.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No hay notificaciones</p>
                ) : (
                  notificaciones.map(n => (
                    <div 
                      key={n.mensaje_id} 
                      onClick={() => handleMarcarLeido(n.mensaje_id)}
                      className="group p-[2vh] bg-white/60 dark:bg-slate-800/60 border border-white dark:border-white/5 rounded-[2.5vh] hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-100 dark:hover:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98]"
                    >
                      <div className="flex items-start gap-[1.5vh]">
                        <div className="w-[4.5vh] h-[4.5vh] rounded-[1.5vh] bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-all">
                          <svg className="w-[2.2vh] h-[2.2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-[0.8vh]">
                            <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none text-[clamp(0.85rem,1.5vh,2.2rem)]">{n.titulo}</h4>
                            <span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[clamp(0.6rem,0.9vh,1.5rem)]">{formatTimeAgo(n.fecha_creacion)}</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-[clamp(0.75rem,1.3vh,2rem)]">{n.comentario}</p>
                        </div>
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
        <button className="font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 uppercase tracking-[0.25em] transition-all flex items-center gap-[1.2vh] group text-[clamp(0.7rem,1.2vh,1.8rem)]">
          Limpiar Todo
          <svg className="w-[2.2vh] h-[2.2vh] group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    </div>
  );
};
