import React, { useState, useEffect, useRef } from 'react';
import { chatAPI, ChatMessage, ChatConversation } from '../../services/chatAPI';

interface AIChatModalProps {
  onClose: () => void;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ onClose }) => {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl h-[85vh] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl flex overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Sidebar - Lista de conversaciones */}
        <div className="w-72 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          {/* Header del sidebar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-900 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-slate-800 dark:text-white">AI Assistant</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Chat con inteligencia</p>
              </div>
            </div>
            
            <button
              onClick={handleNewChat}
              className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Chat
            </button>
          </div>

          {/* Lista de conversaciones */}
          <div className="flex-1 overflow-y-auto p-2">
            {conversaciones.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                No hay conversaciones aún
              </div>
            ) : (
              conversaciones.map((chat) => (
                <div
                  key={chat.chatId}
                  onClick={() => handleSelectChat(chat.chatId)}
                  className={`group p-3 rounded-xl cursor-pointer transition-colors mb-1 ${
                    activeChatId === chat.chatId
                      ? 'bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-800 dark:text-white truncate text-sm">
                        {chat.titulo}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {formatDate(chat.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(chat.chatId, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Área de chat */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-900 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  {activeChatId ? 'Conversación' : 'Nueva Conversación'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Asistente de ventas IA
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-2">
                  ¡Hola! Soy tu asistente de ventas
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                  Puedo ayudarte con estadísticas, métricas, análisis de ventas y más. 
                  ¡Escribí tu pregunta!
                </p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.rol === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.rol === 'user'
                      ? 'bg-violet-600 text-white rounded-br-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white rounded-bl-md'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{msg.contenido}</div>
                  <div className={`text-xs mt-1 ${
                    msg.rol === 'user' ? 'text-violet-200' : 'text-slate-400'
                  }`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribí tu pregunta..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 border-0 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-3 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
