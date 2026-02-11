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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500 p-4">
      <div 
        className="w-full max-w-2xl max-h-[90vh] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.3)] flex flex-col animate-in zoom-in-95 duration-500 rounded-[3.5vh] overflow-hidden border border-white/50"
      >
        {/* Header con gradiente premium horizontal */}
        <div className="relative p-7 bg-gradient-to-r from-indigo-800 via-indigo-900 to-slate-900 text-white shrink-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/10">
                💬
              </div>
              <div>
                <h3 className="text-xl font-black italic tracking-tighter uppercase leading-tight">Bitácora de Eventos</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Expediente {sale.id} • {sale.customerName}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-2xl transition-all group bg-white/5 border border-white/10"
            >
              <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Feed de Comentarios (Izquierda) */}
          <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6 bg-slate-50/50">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Línea de Tiempo</span>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            {!sale.comments || sale.comments.length === 0 ? (
              <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-sm font-bold text-slate-400 italic">No hay movimientos registrados para esta venta.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sale.comments.map((comment, idx) => (
                  <div key={idx} className="group relative animate-in slide-in-from-top-2 duration-300">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 font-black text-sm shadow-sm group-hover:border-indigo-300 transition-colors">
                          {comment.author.charAt(0)}
                        </div>
                        {idx < sale.comments.length - 1 && <div className="w-0.5 h-full bg-slate-200 my-2"></div>}
                      </div>
                      <div className="flex-1 space-y-2 pb-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-black text-slate-900 uppercase">{comment.author}</span>
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{comment.date}</span>
                        </div>
                        <div className="bg-white border border-slate-200 p-4 rounded-3xl rounded-tl-none shadow-sm group-hover:shadow-md transition-all">
                          <h4 className="text-[10px] font-black text-indigo-600 uppercase mb-1 tracking-widest">{comment.title}</h4>
                          <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
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
          <div className="w-full lg:w-[320px] p-7 bg-white border-l border-slate-100 shrink-0 flex flex-col justify-start gap-4">
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-relaxed">
                  Registra nuevas novedades sobre este expediente para el equipo.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título del Evento</label>
                  <input 
                    type="text"
                    placeholder="Ej: Cliente ausente"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-400 outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detalle Informativo</label>
                  <textarea 
                    placeholder="Escribe aquí..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-medium text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-400 outline-none h-32 resize-none transition-all"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={!title || !text || isSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-200 disabled:shadow-none transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Registrar Nodo</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
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
