import { useState, useEffect, useCallback } from 'react';
import { chatAPI, ChatMessage, ChatConversation } from '../../services/chatAPI';

const CHAT_CACHE_KEY = 'aiChat_activeChat';
const MESSAGES_CACHE_PREFIX = 'aiChat_messages_';

export function useAIChatViewModel() {
  const [conversaciones, setConversaciones] = useState<ChatConversation[]>(() => []);
  const [activeChatId, setActiveChatId] = useState<number | null>(() => {
    const saved = localStorage.getItem(CHAT_CACHE_KEY);
    return saved ? Number(saved) : null;
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const savedChatId = localStorage.getItem(CHAT_CACHE_KEY);
    if (savedChatId) {
      const savedMessages = localStorage.getItem(`${MESSAGES_CACHE_PREFIX}${savedChatId}`);
      return savedMessages ? JSON.parse(savedMessages) : [];
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

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
        localStorage.setItem(`${MESSAGES_CACHE_PREFIX}${chatId}`, JSON.stringify(response.data.messages));
      }
    } catch (err) {
      console.error('Error cargando historial:', err);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await loadConversaciones();
      const savedChatId = localStorage.getItem(CHAT_CACHE_KEY);
      if (savedChatId) {
        await loadHistorial(Number(savedChatId));
      }
      setInitialLoadDone(true);
    };
    loadInitialData();
  }, []);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleSelectChat = (chatId: number) => {
    setActiveChatId(chatId);
    localStorage.setItem(CHAT_CACHE_KEY, String(chatId));
    loadHistorial(chatId);
  };

  const handleNewChat = () => {
    const prevChatId = localStorage.getItem(CHAT_CACHE_KEY);
    if (prevChatId) {
      localStorage.removeItem(`${MESSAGES_CACHE_PREFIX}${prevChatId}`);
    }
    localStorage.removeItem(CHAT_CACHE_KEY);
    setActiveChatId(null);
    setMessages([]);
    setError(null);
  };

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    setInput('');
    setIsLoading(true);
    setError(null);

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
        if (response.data.chatId) {
          localStorage.setItem(`${MESSAGES_CACHE_PREFIX}${response.data.chatId}`, JSON.stringify(response.data.history));
          if (!activeChatId || activeChatId !== response.data.chatId) {
            setActiveChatId(response.data.chatId);
            localStorage.setItem(CHAT_CACHE_KEY, String(response.data.chatId));
          }
        }
        loadConversaciones();
      } else {
        throw new Error(response.message || 'Error al enviar mensaje');
      }
    } catch (err: any) {
      setError(err.message || 'Error al comunicarse con la IA');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, activeChatId]);

  const handleDeleteChat = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await chatAPI.deleteConversacion(chatId);
      localStorage.removeItem(`${MESSAGES_CACHE_PREFIX}${chatId}`);
      if (activeChatId === chatId) {
        localStorage.removeItem(CHAT_CACHE_KEY);
        setActiveChatId(null);
        setMessages([]);
        setError(null);
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

  const state = {
    conversaciones, activeChatId, messages, input,
    isLoading, error, copiedId, initialLoadDone,
  };

  const actions = {
    setInput, handleSelectChat, handleNewChat,
    handleSendMessage, handleDeleteChat, copyToClipboard, formatDate,
  };

  return { state, actions };
}
