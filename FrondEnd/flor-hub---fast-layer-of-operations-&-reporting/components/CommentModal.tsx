
import React, { useState } from 'react';
import { Sale, Comment } from '../types';

interface CommentModalProps {
  sale: Sale;
  onClose: () => void;
  onAddComment: (comment: { title: string; text: string }) => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({ sale, onClose, onAddComment }) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !text) return;
    onAddComment({ title, text });
    setTitle('');
    setText('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bento-card rounded-[32px] shadow-2xl overflow-hidden flex flex-col h-[70vh] bg-white">
        
        {/* Header del Modal */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30">
          <div>
            <h3 className="text-lg font-black text-indigo-900 leading-none">Bitácora de Seguimiento</h3>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Expediente: {sale.id} • {sale.customerName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-indigo-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Formulario de Nuevo Comentario */}
        <div className="p-6 bg-white border-b border-slate-50">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input 
              type="text" 
              placeholder="Título del Comentario (ej: Cambio de Estado, Cliente ausente...)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea 
              placeholder="Escribe el detalle del comentario..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-100 outline-none h-24 resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>
            <div className="flex justify-end">
              <button 
                type="submit"
                disabled={!title || !text}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
              >
                Registrar Evento
              </button>
            </div>
          </form>
        </div>

        {/* Historial de Comentarios */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historial de Eventos</p>
          {sale.comments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm font-bold text-slate-300">No hay comentarios previos.</p>
            </div>
          ) : (
            sale.comments.map((comment, idx) => (
              <div key={comment.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm relative group animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-black text-indigo-600 uppercase tracking-tight">{comment.title}</span>
                  <span className="text-[9px] font-bold text-slate-400">{comment.date}</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed italic">"{comment.text}"</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-500 uppercase">
                    {comment.author.charAt(0)}
                  </div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{comment.author}</span>
                </div>
              </div>
            )).reverse()
          )}
        </div>
      </div>
    </div>
  );
};
