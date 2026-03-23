import React, { useState, useEffect, useRef } from 'react';
import { chatAPI, ChatMessage, ChatConversation } from '../../services/chatAPI';

interface AIChatModalProps {
  onClose: () => void;
  isOpen: boolean;
}

/**
 * AIChatModal Component
 * Proporciona una interfaz de chat inteligente con Glassmorphism para interactuar con la IA de Flor Hub.
 */
export const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose }) => {
  const [conversaciones, setConversaciones] = useState<ChatConversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar conversaciones al iniciar
  useEffect(() => {
    loadConversaciones();
  }, []);

  // Scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversaciones = async () => {
    try {
      const response = await chatAPI.getConversaciones();
      if (response.success && response.data) {
        setConversaciones(response.data);
      }
    } catch (err) {
      console.error('Error cargando conversaciones:', err);
    }
  };

  const loadHistorial = async (chatId: number) => {
    try {
      const response = await chatAPI.getHistorial(chatId);
      if (response.success && response.data) {
        setMessages(response.data.messages);
      }
    } catch (err) {
      console.error('Error cargando historial:', err);
    }
  };

  const handleSelectChat = (chatId: number) => {
    setActiveChatId(chatId);
    loadHistorial(chatId);
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setError(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    setInput('');
    setIsLoading(true);
    setError(null);

    // Agregar mensaje del usuario inmediatamente (optimistic)
    const userMessage: ChatMessage = {
      rol: 'user',
      contenido: messageText,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await chatAPI.sendMessage(messageText, activeChatId || undefined);
      
      if (response.success && response.data) {
        setMessages(response.data.history);
        setActiveChatId(response.data.chatId);
        
        // Recargar lista de conversaciones
        loadConversaciones();
      } else {
        throw new Error(response.message || 'Error al enviar mensaje');
      }
    } catch (err: any) {
      setError(err.message || 'Error al comunicarse con la IA');
      // Quitar el mensaje del usuario si falla
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatAPI.deleteConversacion(chatId);
      if (activeChatId === chatId) {
        handleNewChat();
      }
      loadConversaciones();
    } catch (err) {
      console.error('Error eliminando conversación:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `${days} días`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-5xl h-[85vh] glass-panel rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Sidebar - Lista de conversaciones */}
        <div className="w-80 bg-slate-50/50 dark:bg-slate-950/40 border-r border-slate-200 dark:border-white/5 flex flex-col">
          {/* Header del sidebar */}
          <div className="p-6 border-b border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-lg">FLOR AI</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Intelligence Engine</p>
              </div>
            </div>
            
            {/* Botón para iniciar nueva conversación */}
            <button
              onClick={handleNewChat}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-600/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Chat
            </button>
          </div>

          {/* Lista de conversaciones */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {conversaciones.length === 0 ? (
              <div className="text-center py-12">
                 <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-600">Sin historial</p>
              </div>
            ) : (
              conversaciones.map((chat) => (
                <div
                  key={chat.chatId}
                  onClick={() => handleSelectChat(chat.chatId)}
                  className={`group relative p-4 rounded-2xl cursor-pointer transition-all border ${
                    activeChatId === chat.chatId
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                      : 'bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-black uppercase tracking-tight truncate text-xs ${activeChatId === chat.chatId ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {chat.titulo}
                      </h3>
                       <p className={`text-[10px] font-bold mt-1 uppercase ${activeChatId === chat.chatId ? 'text-indigo-100' : 'text-slate-600 dark:text-slate-500'}`}>
                        {formatDate(chat.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(chat.chatId, e)}
                      className={`opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all ${activeChatId === chat.chatId ? 'hover:bg-white/20 text-white' : 'hover:bg-rose-500/20 text-rose-500'}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Área de chat */}
        <div className="flex-1 flex flex-col bg-slate-50/30 dark:bg-black/20 backdrop-blur-md">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                  {activeChatId ? 'Consulta Activa' : 'Nueva Consultoría'}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Motor Operacional v3.0</p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-rose-500 hover:text-white text-slate-500 rounded-2xl transition-all active:scale-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.length === 0 && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center mb-6 shadow-inner">
                  <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-black text-2xl text-slate-900 dark:text-white mb-2 uppercase tracking-tighter italic">
                  ¿En qué puedo asistirte hoy?
                </h3>
                 <p className="text-xs font-bold text-slate-600 dark:text-slate-400 max-w-sm uppercase tracking-widest mb-8">
                  Analizo métricas, tendencias y performance en tiempo real
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg w-full">
                  {[
                    "Resumen de ventas de hoy",
                    "Performance por supervisor",
                    "Tendencia de portabilidades",
                    "Planes con mayor conversión"
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all transform hover:-translate-y-1 shadow-sm"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.rol === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[75%] rounded-[2rem] px-6 py-4 shadow-xl ${
                    msg.rol === 'user'
                      ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-br-none'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-100 dark:border-white/5'
                  }`}
                >
                  <div className="text-sm font-bold leading-relaxed whitespace-pre-wrap">{msg.contenido}</div>
                  <div className={`text-[10px] font-black mt-2 uppercase opacity-60 ${
                    msg.rol === 'user' ? 'text-indigo-100' : 'text-slate-400'
                  }`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white dark:bg-slate-800 rounded-[2rem] rounded-bl-none px-6 py-4 border border-slate-100 dark:border-white/5 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    <span className="text-[10px] items-center ml-2 font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 italic">Procesando...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center">
                <div className="bg-rose-50 dark:bg-rose-900/40 border-2 border-rose-200 dark:border-rose-800/50 rounded-2xl px-6 py-3 flex items-center gap-3 text-rose-600 dark:text-rose-400 shadow-lg">
                  <svg className="w-5 h-5 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-8">
            <form 
              onSubmit={handleSendMessage} 
              className="relative max-w-4xl mx-auto"
            >
              <div className="relative flex items-center bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border-2 border-slate-200 dark:border-white/5 focus-within:border-indigo-500/50 rounded-3xl px-2 py-2 overflow-hidden shadow-2xl transition-all">

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                   placeholder="Escriba aquí..."
                  disabled={isLoading}
                  autoComplete="off"
                   className="flex-1 px-6 py-4 bg-transparent border-0 ring-0 focus:ring-0 outline-none text-slate-900 dark:text-white font-bold placeholder-slate-500 dark:placeholder-slate-400 text-sm disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-2xl transition-all active:scale-95 shadow-lg shadow-indigo-600/30"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
            <p className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] mt-4">Motor de Inteligencia Operativa • Florianópolis 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};
