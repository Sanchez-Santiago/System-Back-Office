// ============================================
// BackEnd/src/model/chatPostgreSQL.ts
// Modelo para gestionar conversaciones y mensajes del chat con IA
// ============================================

import { PostgresClient } from "../database/PostgreSQL";
import { logger } from "../Utils/logger";

export interface ChatConversacion {
  chat_id: number;
  usuario_id: string;
  titulo: string;
  creado_en: Date;
}

export interface ChatMensaje {
  mensaje_id: number;
  chat_id: number;
  rol: 'user' | 'assistant' | 'system';
  contenido: string;
  tokens: number | null;
  metadata: Record<string, any> | null;
  creado_en: Date;
}

export class ChatPostgreSQL {
  private connection: PostgresClient;

  constructor(connection: PostgresClient) {
    this.connection = connection;
  }

  /**
   * Crear una nueva conversación
   */
  async createConversacion(usuarioId: string, titulo: string): Promise<number> {
    const client = this.connection.getClient();
    
    const result = await client.queryObject(
      `INSERT INTO chat_conversacion (usuario_id, titulo)
       VALUES ($1, $2)
       RETURNING chat_id`,
      [usuarioId, titulo]
    );

    logger.info(`Conversación creada: ${result.rows[0].chat_id}`);
    return result.rows[0].chat_id;
  }

  /**
   * Obtener todas las conversaciones de un usuario
   */
  async getConversaciones(usuarioId: string): Promise<ChatConversacion[]> {
    const client = this.connection.getClient();
    
    const result = await client.queryObject(
      `SELECT chat_id, usuario_id, titulo, creado_en
       FROM chat_conversacion
       WHERE usuario_id = $1
       ORDER BY creado_en DESC
       LIMIT 50`,
      [usuarioId]
    );

    return result.rows;
  }

  /**
   * Obtener una conversación específica
   */
  async getConversacion(chatId: number): Promise<ChatConversacion | null> {
    const client = this.connection.getClient();
    
    const result = await client.queryObject(
      `SELECT chat_id, usuario_id, titulo, creado_en
       FROM chat_conversacion
       WHERE chat_id = $1`,
      [chatId]
    );

    return result.rows[0] || null;
  }

  /**
   * Obtener mensajes de una conversación
   */
  async getMensajes(chatId: number): Promise<ChatMensaje[]> {
    const client = this.connection.getClient();
    
    const result = await client.queryObject(
      `SELECT mensaje_id, chat_id, rol, contenido, tokens, metadata, creado_en
       FROM chat_mensaje
       WHERE chat_id = $1
       ORDER BY creado_en ASC`,
      [chatId]
    );

    return result.rows;
  }

  /**
   * Agregar un mensaje a una conversación
   */
  async addMensaje(
    chatId: number,
    rol: 'user' | 'assistant' | 'system',
    contenido: string,
    tokens: number | null = null,
    metadata: Record<string, any> | null = null
  ): Promise<number> {
    const client = this.connection.getClient();
    
    const result = await client.queryObject(
      `INSERT INTO chat_mensaje (chat_id, rol, contenido, tokens, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING mensaje_id`,
      [chatId, rol, contenido, tokens, metadata]
    );

    return result.rows[0].mensaje_id;
  }

  /**
   * Actualizar título de una conversación
   */
  async updateTitulo(chatId: number, titulo: string): Promise<boolean> {
    const client = this.connection.getClient();
    
    const result = await client.queryObject(
      `UPDATE chat_conversacion
       SET titulo = $1
       WHERE chat_id = $2`,
      [titulo, chatId]
    );

    return true;
  }

  /**
   * Eliminar una conversación y sus mensajes
   */
  async deleteConversacion(chatId: number): Promise<boolean> {
    const client = this.connection.getClient();
    
    // Primero eliminar los mensajes
    await client.queryObject(
      `DELETE FROM chat_mensaje WHERE chat_id = $1`,
      [chatId]
    );

    // Luego eliminar la conversación
    await client.queryObject(
      `DELETE FROM chat_conversacion WHERE chat_id = $1`,
      [chatId]
    );

    logger.info(`Conversación eliminada: ${chatId}`);
    return true;
  }

  /**
   * Obtener los últimos N mensajes para contexto
   */
  async getMensajesRecientes(chatId: number, limit: number = 20): Promise<ChatMensaje[]> {
    const client = this.connection.getClient();
    
    const result = await client.queryObject(
      `SELECT mensaje_id, chat_id, rol, contenido, tokens, metadata, creado_en
       FROM chat_mensaje
       WHERE chat_id = $1
       ORDER BY creado_en DESC
       LIMIT $2`,
      [chatId, limit]
    );

    // Invertir para tenerlos en orden cronológico
    return (result.rows as ChatMensaje[]).reverse();
  }
}
