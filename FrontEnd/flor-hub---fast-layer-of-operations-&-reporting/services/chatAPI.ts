// services/chatAPI.ts
// API para el chat con IA

import { api, ApiResponse } from './api';

export interface ChatMessage {
  rol: 'user' | 'assistant' | 'system';
  contenido: string;
  createdAt: string;
}

export interface ChatConversation {
  chatId: number;
  titulo: string;
  createdAt: string;
}

export interface SendMessageResponse {
  chatId: number;
  message: string;
  history: ChatMessage[];
}

export interface ChatAPI {
  sendMessage: (message: string, chatId?: number) => Promise<ApiResponse<SendMessageResponse>>;
  getConversaciones: () => Promise<ApiResponse<ChatConversation[]>>;
  getHistorial: (chatId: number) => Promise<ApiResponse<{ chatId: number; messages: ChatMessage[] }>>;
  deleteConversacion: (chatId: number) => Promise<ApiResponse<void>>;
}

export const chatAPI: ChatAPI = {
  sendMessage: async (message: string, chatId?: number) => {
    return await api.post<SendMessageResponse>('/ai-chat', { message, chatId });
  },

  getConversaciones: async () => {
    return await api.get<ChatConversation[]>('/ai-chat/conversaciones');
  },

  getHistorial: async (chatId: number) => {
    return await api.get<{ chatId: number; messages: ChatMessage[] }>(`/ai-chat/${chatId}`);
  },

  deleteConversacion: async (chatId: number) => {
    return await api.delete<void>(`/ai-chat/${chatId}`);
  },
};
