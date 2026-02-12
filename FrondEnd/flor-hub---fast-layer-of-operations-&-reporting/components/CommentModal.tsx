import React, { useState } from 'react';
import { Sale } from '../types';

interface CommentModalProps {
  sale: Sale;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({ sale, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !text || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Aquí iría la llamada al servicio real
      console.log('Añadiendo comentario:', { title, text });
      
      // Simular éxito
      setTimeout(() => {
        setTitle('');
        setText('');
        setIsSubmitting(false);
        if (onSuccess) onSuccess();
      }, 500);
    } catch (error) {
      console.error('Error al añadir comentario:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500 p-[2vw]">
      <div 
        className="w-full max-w-5xl max-h-[92vh] bg-white dark:bg-slate-900 shadow-[0_30px_100px_rgba(0,0,0,0.3)] flex flex-col animate-in zoom-in-95 duration-500 rounded-[4vh] overflow-hidden border border-white/50 dark:border-white/5"
      >
        {/* Header con gradiente premium horizontal */}
        <div className="relative p-[4vh] bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:via-slate-900 dark:to-black text-white shrink-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-[3vh]">
              <div className="w-[8vh] h-[8vh] bg-white/10 rounded-[2.5vh] flex items-center justify-center text-[4vh] shadow-inner border border-white/10">
                💬
              </div>
              <div>
                <h3 className="text-[clamp(1.2rem,3vh,3.5rem)] font-black italic tracking-tighter uppercase leading-tight">Bitácora de Eventos Operacionales</h3>
                <div className="flex items-center gap-[1.5vh] mt-[0.5vh]">
                  <span className="w-[1.2vh] h-[1.2vh] rounded-full bg-emerald-400 animate-pulse"></span>
                  <p className="text-[clamp(0.6rem,1.1vh,1.3rem)] font-black uppercase tracking-[0.2em] text-indigo-200 dark:text-indigo-300">Expediente {sale.id} • {sale.customerName}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-[2vh] hover:bg-white/10 rounded-[2.5vh] transition-all group bg-white/5 border border-white/10"
            >
              <svg className="w-[3vh] h-[3vh] group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Feed de Comentarios (Izquierda) */}
          <div className="flex-1 overflow-y-auto px-[4vh] py-[4vh] space-y-[4vh] bg-slate-50/50 dark:bg-slate-950/20 no-scrollbar">
            <div className="flex items-center gap-[2vh] mb-[2vh]">
              <span className="text-[clamp(0.6rem,1.1vh,1.3rem)] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Línea de Tiempo Operativa</span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
            </div>

            {!sale.comments || sale.comments.length === 0 ? (
              <div className="text-center py-[15vh] bg-white/50 dark:bg-slate-900/40 rounded-[4vh] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-[clamp(0.8rem,1.6vh,2.2rem)] font-bold text-slate-400 dark:text-slate-600 italic">No hay movimientos registrados para esta venta.</p>
              </div>
            ) : (
              <div className="space-y-[4vh]">
                {sale.comments.map((comment, idx) => (
                  <div key={idx} className="group relative animate-in slide-in-from-top-4 duration-500">
                    <div className="flex gap-[3vh]">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-[6vh] h-[6vh] rounded-[2.2vh] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-[clamp(1rem,2vh,2.5rem)] shadow-sm group-hover:border-indigo-300 dark:group-hover:border-indigo-500 transition-colors">
                          {comment.author.charAt(0)}
                        </div>
                        {idx < sale.comments.length - 1 && <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-800 my-[1vh]"></div>}
                      </div>
                      <div className="flex-1 space-y-[1.5vh] pb-[1vh]">
                        <div className="flex justify-between items-center">
                          <span className="text-[clamp(0.8rem,1.3vh,1.6rem)] font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{comment.author}</span>
                          <span className="text-[clamp(0.6rem,1vh,1.2rem)] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-[1.5vh] py-[0.5vh] rounded-full border border-indigo-100 dark:border-indigo-800/20">{comment.date}</span>
                        </div>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-[3vh] rounded-[3.5vh] rounded-tl-none shadow-sm group-hover:shadow-xl group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 transition-all duration-500 border-l-[0.6vh] border-l-indigo-500">
                          <h4 className="text-[clamp(0.7rem,1.2vh,1.4rem)] font-black text-indigo-600 dark:text-indigo-400 uppercase mb-[1vh] tracking-widest leading-none">{comment.title}</h4>
                          <p className="text-[clamp(0.85rem,1.6vh,2.2rem)] font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                            "{comment.text}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )).reverse()}
              </div>
            )}
          </div>

          {/* Nueva Entrada (Derecha o Abajo) */}
          <div className="w-full lg:w-[420px] p-[4vh] bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 shrink-0 flex flex-col justify-start gap-[3vh]">
            <div className="space-y-[3vh]">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-[3vh] rounded-[3vh] border border-indigo-100 dark:border-indigo-800/40">
                <p className="text-[clamp(0.7rem,1.2vh,1.4rem)] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.15em] leading-relaxed">
                  Registra nuevas novedades sobre este expediente para el equipo técnico.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-[3vh]">
                <div className="space-y-[1.5vh]">
                  <label className="text-[clamp(0.6rem,1.1vh,1.3rem)] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-[1.5vh]">Título del Evento</label>
                  <input 
                    type="text"
                    placeholder="Ej: Cliente ausente"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[2.5vh] px-[2.5vh] py-[2vh] text-[clamp(0.9rem,1.6vh,1.9rem)] font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-50/50 dark:focus:ring-indigo-900/30 focus:border-indigo-400 transition-all outline-none"
                  />
                </div>
                
                <div className="space-y-[1.5vh]">
                  <label className="text-[clamp(0.6rem,1.1vh,1.3rem)] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-[1.5vh]">Detalle Informativo</label>
                  <textarea 
                    placeholder="Escribe aquí..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[2.5vh] px-[3vh] py-[3vh] text-[clamp(0.9rem,1.6vh,1.9rem)] font-medium text-slate-700 dark:text-slate-300 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-50/50 dark:focus:ring-indigo-900/30 focus:border-indigo-400 outline-none h-[25vh] resize-none transition-all"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={!title || !text || isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-black py-[2.5vh] rounded-[2.5vh] shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)] dark:shadow-none disabled:shadow-none transition-all flex items-center justify-center gap-[2vh] uppercase tracking-[0.2em] text-[clamp(0.7rem,1.2vh,1.4rem)] hover:scale-105 active:scale-95"
                >
                  {isSubmitting ? (
                    <div className="w-[3vh] h-[3vh] border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Registrar Nodo</span>
                      <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
