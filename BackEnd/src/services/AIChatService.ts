// ============================================
// BackEnd/src/services/AIChatService.ts
// Servicio de chat con IA - usa endpoints existentes para contexto
// ============================================

import { ChatPostgreSQL } from "../model/chatPostgreSQL.ts";
import { EstadisticaPostgreSQL } from "../model/EstadisticaPostgreSQL.ts";
import { VentaPostgreSQL } from "../model/ventaPostgreSQL.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { logger } from "../Utils/logger.ts";
import { getPostgresClient } from "../database/PostgreSQL.ts";

const AI_SYSTEM_PROMPT = `Eres un asistente de ventas experto para el sistema FLOR HUB.
Tenés acceso a información en tiempo real sobre ventas, estadísticas, vendedores y más.

CAPACIDADES:
- Responder preguntas sobre ventas y procesos
- Analizar métricas y estadísticas
- Generar informes y resúmenes
- Explicar estados de ventas y logisticay
- Ayudar a entender el flujo de ventas

DIRECTRICES:
- Sé conciso y profesional
- Usá datos para respaldar tus respuestas
- Si no tenés suficiente información, pedile al usuario que sea más específico
- Cuando menciones números, referite a las estadísticas actuales que te proporciono
- Si el usuario pregunta por algo específico que necesitás buscar, decile que no tenés esa capacidad aún pero podés pedirle que lo busque en el sistema

FORMATO DE RESPUESTA:
- Usá markdown para estructurar tus respuestas
- Incluí números y porcentajes cuando corresponda
- Si hay algo que no entendí, pedí clarificación`;

export interface ChatMessage {
  rol: 'user' | 'assistant' | 'system';
  contenido: string;
  createdAt: string;
}

export interface ChatConversationInfo {
  chatId: number;
  titulo: string;
  createdAt: string;
}

export interface SendMessageResponse {
  success: boolean;
  chatId: number;
  message: string;
  history: ChatMessage[];
}

export class AIChatService {
  private chatModel: ChatPostgreSQL;
  private estadisticaModel: EstadisticaPostgreSQL;
  private ventaModel: VentaPostgreSQL;
  private userModel: UserModelDB;

  constructor(
    chatModel: ChatPostgreSQL,
    estadisticaModel: EstadisticaPostgreSQL,
    ventaModel: VentaPostgreSQL,
    userModel: UserModelDB
  ) {
    this.chatModel = chatModel;
    this.estadisticaModel = estadisticaModel;
    this.ventaModel = ventaModel;
    this.userModel = userModel;
  }

  /**
   * Enviar mensaje al chat
   */
  async sendMessage(params: {
    userId: string;
    userRol: string;
    chatId?: number;
    message: string;
  }): Promise<SendMessageResponse> {
    const { userId, userRol, chatId, message } = params;

    try {
      // 1. Obtener o crear conversación
      let currentChatId = chatId;
      
      if (!currentChatId) {
        // Crear nueva conversación con título basado en el primer mensaje
        const titulo = this.generateTitle(message);
        currentChatId = await this.chatModel.createConversacion(userId, titulo);
        logger.info(`Nueva conversación creada: ${currentChatId}`);
      }

      // 2. Guardar mensaje del usuario
      await this.chatModel.addMensaje(currentChatId, 'user', message);

      // 3. Obtener contexto (estadísticas actuales)
      const context = await this.getContext(userId, userRol);

      // 4. Obtener historial de mensajes
      const mensajesPrevios = await this.chatModel.getMensajesRecientes(currentChatId, 15);
      
      // 5. Construir prompt para la IA
      const prompt = this.buildPrompt(message, context, mensajesPrevios);

      // 6. Llamar a la IA
      const aiResponse = await this.callAI(prompt, mensajesPrevios);

      // 7. Guardar respuesta de la IA
      await this.chatModel.addMensaje(currentChatId, 'assistant', aiResponse);

      // 8. Obtener historial actualizado
      const historial = await this.chatModel.getMensajes(currentChatId);
      const history: ChatMessage[] = historial.map(m => ({
        rol: m.rol,
        contenido: m.contenido,
        createdAt: m.creado_en.toISOString(),
      }));

      return {
        success: true,
        chatId: currentChatId,
        message: aiResponse,
        history,
      };
    } catch (error) {
      logger.error("Error en AIChatService.sendMessage:", error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("Error al comunicarse con la IA. Por favor, intentá de nuevo.");
    }
  }

  /**
   * Obtener conversaciones del usuario
   */
  async getConversaciones(userId: string): Promise<ChatConversationInfo[]> {
    const conversaciones = await this.chatModel.getConversaciones(userId);
    
    return conversaciones.map(c => ({
      chatId: c.chat_id,
      titulo: c.titulo || 'Nueva conversación',
      createdAt: c.creado_en.toISOString(),
    }));
  }

  /**
   * Obtener historial de una conversación
   */
  async getHistorial(chatId: number, userId: string): Promise<ChatMessage[]> {
    // Verificar que la conversación pertenece al usuario
    const conversacion = await this.chatModel.getConversacion(chatId);
    
    if (!conversacion || conversacion.usuario_id !== userId) {
      throw new Error("Conversación no encontrada");
    }

    const mensajes = await this.chatModel.getMensajes(chatId);
    
    return mensajes.map(m => ({
      rol: m.rol,
      contenido: m.contenido,
      createdAt: m.creado_en.toISOString(),
    }));
  }

  /**
   * Eliminar conversación
   */
  async deleteConversacion(chatId: number, userId: string): Promise<boolean> {
    const conversacion = await this.chatModel.getConversacion(chatId);
    
    if (!conversacion || conversacion.usuario_id !== userId) {
      throw new Error("Conversación no encontrada");
    }

    return await this.chatModel.deleteConversacion(chatId);
  }

  /**
   * Generar título para nueva conversación
   */
  private generateTitle(firstMessage: string): string {
    // Tomar las primeras palabras del mensaje como título
    const words = firstMessage.trim().split(/\s+/);
    const title = words.slice(0, 5).join(' ');
    return title + (words.length > 5 ? '...' : '');
  }

  /**
   * Obtener contexto de estadísticas
   */
  private async getContext(userId: string, userRol: string): Promise<string> {
    try {
      const pgClient = getPostgresClient();
      const estadisticaModel = new EstadisticaPostgreSQL(pgClient);
      
      // Obtener estadísticas del último mes
      const filters = {
        periodo: 'MES' as const,
        userId,
        userRol,
      };

      const stats = await estadisticaModel.getEstadisticas(filters);

      return `
ESTADÍSTICAS DEL PERIODO (MES ACTUAL):
- Total de ventas: ${stats.resumen.totalVentas}
- Agendados: ${stats.resumen.agendados} (${stats.resumen.percAgendados.toFixed(1)}%)
- Aprobados ABD: ${stats.resumen.aprobadoAbd} (${stats.resumen.percAprobadoAbd.toFixed(1)}%)
- Rechazados: ${stats.resumen.rechazados} (${stats.resumen.percRechazados.toFixed(1)}%)
- Entregados: ${stats.resumen.entregados} (${stats.resumen.percEntregados.toFixed(1)}%)
- Activados (portado): ${stats.resumen.activadoPortado}
- Activados (Claro): ${stats.resumen.activadoClaro}
- Cancelados: ${stats.resumen.cancelados}
- Pendientes de PIN: ${stats.resumen.pendientePin}

TOTALES:
- Total ventas: ${stats.totales.totalVentas}
- Total activados: ${stats.totales.totalActivados}
- Tasa de conversión: ${stats.totales.tasaConversion.toFixed(1)}%

TOP VENDEDORES:
${stats.ventasPorVendedor.slice(0, 5).map((v, i) => `${i + 1}. ${v.vendedorNombre} - ${v.totalVentas} ventas (${v.percActivados.toFixed(1)}% activación)`).join('\n')}

TOP CÉLULAS:
${stats.ventasPorCell.slice(0, 5).map((c, i) => `${i + 1}. Célula ${c.cellaId} - ${c.totalVentas} ventas`).join('\n')}
      `.trim();
    } catch (error) {
      logger.error("Error obteniendo contexto de estadísticas:", error);
      return "No se pudieron obtener las estadísticas en este momento.";
    }
  }

  /**
   * Construir prompt para la IA
   */
  private buildPrompt(
    userMessage: string,
    context: string,
    historial: Array<{ rol: string; contenido: string }>
  ): string {
    const historialStr = historial
      .map(m => `${m.rol === 'user' ? 'Usuario' : 'Asistente'}: ${m.contenido}`)
      .join('\n\n');

    return `
${AI_SYSTEM_PROMPT}

=== DATOS ACTUALES DEL SISTEMA ===
${context}

=== HISTORIAL DE LA CONVERSACIÓN ===
${historialStr}

=== NUEVA CONSULTA ===
Usuario: ${userMessage}

Respuesta:`;
  }

  /**
   * Llamar a la API de IA
   */
  private async callAI(prompt: string, historial: Array<{ rol: string; contenido: string }>): Promise<string> {
    const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';
    const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

    try {
      if (AI_PROVIDER === 'openai') {
        return await this.callOpenAI(prompt, AI_MODEL);
      } else if (AI_PROVIDER === 'claude') {
        return await this.callClaude(prompt);
      } else if (AI_PROVIDER === 'gemini') {
        return await this.callGemini(prompt);
      } else {
        throw new Error(`Proveedor de IA no soportado: ${AI_PROVIDER}`);
      }
    } catch (error) {
      logger.error("Error llamando a la IA:", error);
      if (error instanceof Error) {
        if (error.message.includes('no configurada')) {
          throw new Error('El servicio de IA no está configurado. Por favor, contactá al administrador.');
        }
        throw new Error(error.message || 'Error al comunicarse con la IA. Por favor, intentá de nuevo.');
      }
      throw new Error('Error al comunicarse con la IA. Por favor, intentá de nuevo.');
    }
  }

  /**
   * Llamar a OpenAI
   */
  private async callOpenAI(prompt: string, model: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY no configurada");
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error de OpenAI: ${error}`);
    }

    const data = await response.json() as any;
    return data.choices[0].message.content;
  }

  /**
   * Llamar a Claude (Anthropic)
   */
  private async callClaude(prompt: string): Promise<string> {
    const apiKey = process.env.CLAUDE_API_KEY;
    
    if (!apiKey) {
      throw new Error("CLAUDE_API_KEY no configurada");
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error de Claude: ${error}`);
    }

    const data = await response.json() as any;
    return data.content[0].text;
  }

  /**
   * Llamar a Gemini (Google)
   */
  private async callGemini(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY no configurada");
    }

    const model = process.env.AI_MODEL || 'gemini-2.0-flash';
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: prompt }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error de Gemini: ${error}`);
    }

    const data = await response.json() as any;
    return data.candidates[0].content.parts[0].text;
  }
}
