// ============================================
// BackEnd/src/services/AIChatService.ts
// Servicio de chat con IA - acceso completo a datos del sistema
// ============================================

import { ChatPostgreSQL } from "../model/chatPostgreSQL";
import { EstadisticaPostgreSQL } from "../model/EstadisticaPostgreSQL";
import { VentaPostgreSQL } from "../model/ventaPostgreSQL";
import { ClientePostgreSQL } from "../model/clientePostgreSQL";
import { PortabilidadPostgreSQL } from "../model/portabilidadPostgreSQL";
import { LineaNuevaPostgreSQL } from "../model/lineaNuevaPostgreSQL";
import { UserModelDB } from "../interface/Usuario";
import { logger } from "../Utils/logger";

const AI_SYSTEM_PROMPT = `Eres Flor, el asistente de inteligencia artificial del sistema FLOR HUB.
Tenés acceso a información HISTÓRICA sobre ventas, estadísticas, vendedores, clientes, empresas, planes y promociones del sistema completo.

CAPACIDADES:
- Responder preguntas sobre ventas y procesos
- Analizar métricas y estadísticas históricas
- Generar informes y resúmenes
- Explicar estados de ventas y logística
- Proporcionar información de clientes y sus compras
- Mostrar empresas más vendidas y planes populares
- Buscar ventas por cliente, vendedor, documento, fecha
- Mostrar detalles de portabilidades y líneas nuevas
- IDENTIFICAR al cliente con más compras/ventas

NOTA IMPORTANTE: Los datos incluyen TODAS las ventas del sistema, no solo del mes actual.

DIRECTRICES:
- Sé conciso y profesional
- Usá datos para respaldar tus respuestas
- Si no tenés suficiente información, pedile al usuario que sea más específico
- Cuando menciones números, referite a los datos actuales del sistema
- No inventés información - solo usá datos verificados del sistema
- Usá markdown para estructurar tus respuestas
- Para consultas específicas (cliente X, venta Y), buscá en los datos detallados

ANÁLISIS DE CLIENTES:
- Para consultas como "cliente con más compras" o "quién compró más", USÁ la sección "TOP 20 CLIENTES POR CANTIDAD DE COMPRAS"
- Los datos de clientes están en "ÚLTIMAS 1000 VENTAS CON DETALLE"
- Podés agregar/contar cuántas ventas tiene cada cliente por nombre o documento
- El ranking de clientes muestra quién tiene más compras en el período

FORMATO DE RESPUESTA:
- Usá markdown para estructurar tus respuestas
- Incluí números y porcentajes cuando corresponda
- Usá tablas para listar múltiples elementos
- Si hay algo que no entendí, pedí clarificación
- Indica cuántos resultados estás mostrando (ej: "Mostrando 10 de 50 resultados")`;

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

export interface UserContext {
  userId: string;
  userRol: string;
  permisos: string[];
  celula?: number;
  pais?: string;
}

export class AIChatService {
  private chatModel: ChatPostgreSQL;
  private estadisticaModel: EstadisticaPostgreSQL;
  private ventaModel: VentaPostgreSQL;
  private clienteModel: ClientePostgreSQL;
  private portabilidadModel: PortabilidadPostgreSQL;
  private lineaNuevaModel: LineaNuevaPostgreSQL;
  private userModel: UserModelDB;

  constructor(
    chatModel: ChatPostgreSQL,
    estadisticaModel: EstadisticaPostgreSQL,
    ventaModel: VentaPostgreSQL,
    clienteModel: ClientePostgreSQL,
    portabilidadModel: PortabilidadPostgreSQL,
    lineaNuevaModel: LineaNuevaPostgreSQL,
    userModel: UserModelDB
  ) {
    this.chatModel = chatModel;
    this.estadisticaModel = estadisticaModel;
    this.ventaModel = ventaModel;
    this.clienteModel = clienteModel;
    this.portabilidadModel = portabilidadModel;
    this.lineaNuevaModel = lineaNuevaModel;
    this.userModel = userModel;
  }

  /**
   * Enviar mensaje al chat
   */
  async sendMessage(params: {
    userId: string;
    userRol: string;
    permisos: string[];
    celula?: number;
    pais?: string;
    chatId?: number;
    message: string;
  }): Promise<SendMessageResponse> {
    const { userId, userRol, permisos, celula, pais, chatId, message } = params;

    try {
      // 1. Obtener o crear conversación
      let currentChatId = chatId;
      
      if (!currentChatId) {
        const titulo = this.generateTitle(message);
        logger.info(`[AIChat] Creando nueva conversación para userId=${userId}, titulo="${titulo}"`);
        
        try {
          currentChatId = await this.chatModel.createConversacion(userId, titulo);
          logger.info(`[AIChat] Conversación creada exitosamente: chatId=${currentChatId}`);
        } catch (error) {
          logger.error("[AIChat] Error al crear conversación:", error);
          throw new Error(`No se pudo crear la conversación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      // Verificar que currentChatId es válido
      if (currentChatId === null || currentChatId === undefined || currentChatId === 0) {
        logger.error(`[AIChat] chatId inválido: ${currentChatId} (tipo: ${typeof currentChatId})`);
        throw new Error("ID de conversación inválido - no se pudo crear la conversación");
      }
      
      logger.info(`[AIChat] chatId validado: ${currentChatId} (tipo: ${typeof currentChatId})`);

      // 2. Guardar mensaje del usuario
      try {
        await this.chatModel.addMensaje(currentChatId, 'user', message);
        logger.info(`[AIChat] Mensaje de usuario agregado: chatId=${currentChatId}`);
      } catch (error) {
        logger.error("[AIChat] Error al guardar mensaje del usuario:", error);
        throw new Error(`No se pudo guardar el mensaje: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }

      // 3. Obtener contexto completo (estadísticas + datos detallados)
      const context = await this.getFullContext({
        userId,
        userRol,
        permisos,
        celula,
        pais
      });

      // 4. Obtener historial de mensajes
      const mensajesPrevios = await this.chatModel.getMensajesRecientes(currentChatId, 15);
      
      // 5. Construir prompt para la IA
      const prompt = this.buildPrompt(message, context, mensajesPrevios);

      // 6. Llamar a la IA
      const aiResponse = await this.callAI(prompt, mensajesPrevios);

      // 7. Guardar respuesta de la IA
      try {
        await this.chatModel.addMensaje(currentChatId, 'assistant', aiResponse);
        logger.info(`[AIChat] Respuesta de IA guardada: chatId=${currentChatId}`);
      } catch (error) {
        logger.error("[AIChat] Error al guardar respuesta de IA:", error);
        throw new Error(`No se pudo guardar la respuesta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }

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
    const words = firstMessage.trim().split(/\s+/);
    const title = words.slice(0, 5).join(' ');
    return title + (words.length > 5 ? '...' : '');
  }

  /**
   * Verificar si el usuario es admin
   */
  private isAdmin(rol: string, permisos: string[]): boolean {
    return rol === 'ADMIN' || rol === 'SUPERADMIN' || 
           permisos.includes('ADMIN') || permisos.includes('SUPERADMIN');
  }

  /**
   * Obtener contexto completo con todos los datos del sistema
   */
  private async getFullContext(userCtx: UserContext): Promise<string> {
    try {
      logger.info(`[AIChat] Obteniendo contexto completo para userId=${userCtx.userId}, rol=${userCtx.userRol}`);
      
      const filters = {
        periodo: 'TODO' as const,
        userId: userCtx.userId,
        userRol: userCtx.userRol,
        cellaId: userCtx.celula?.toString(),
        pais: userCtx.pais,
      };

      // Ejecutar consultas en paralelo para mejor rendimiento
      const [stats, empresasStats, portabilidades] = await Promise.all([
        this.estadisticaModel.getEstadisticas(filters),
        this.getTopEmpresas(filters),
        this.getPortabilidadesActivas(filters),
      ]);

      logger.info(`[AIChat] Datos obtenidos: ventas=${stats.resumen.totalVentas}, detalle=${stats.detalle.length}, empresas=${empresasStats.length}`);

      // Construir contexto con todos los datos
      const contextParts: string[] = [];

      // 1. Resumen Estadístico
      contextParts.push(this.buildResumenSection(stats));

      // 2. Top 20 Vendedores
      contextParts.push(this.buildTopVendedoresSection(stats));

      // 3. Top 20 Células
      contextParts.push(this.buildTopCellsSection(stats));

      // 4. Top 20 Clientes (ranking por cantidad de compras)
      contextParts.push(this.buildClientesRankingSection(stats));

      // 5. Top 10 Empresas
      contextParts.push(this.buildTopEmpresasSection(empresasStats));

      // 6. Últimas 1000 ventas con detalle
      contextParts.push(this.buildVentasDetalleSection(stats));

      // 7. Portabilidades Activas
      contextParts.push(this.buildPortabilidadesSection(portabilidades));

      return contextParts.join('\n\n');
    } catch (error) {
      logger.error("[AIChat] Error obteniendo contexto completo:", error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return `Error al obtener datos del sistema: ${errorMessage}`;
    }
  }

  /**
   * Construir sección de resumen estadístico
   */
  private buildResumenSection(stats: any): string {
    return `=== RESUMEN ESTADÍSTICO (TOTAL HISTÓRICO) ===
- Total de ventas: ${stats.resumen.totalVentas.toLocaleString()}
- Agendados: ${stats.resumen.agendados} (${stats.resumen.percAgendados.toFixed(1)}%)
- Aprobados ABD: ${stats.resumen.aprobadoAbd} (${stats.resumen.percAprobadoAbd.toFixed(1)}%)
- Rechazados: ${stats.resumen.rechazados} (${stats.resumen.percRechazados.toFixed(1)}%)
- Entregados: ${stats.resumen.entregados} (${stats.resumen.percEntregados.toFixed(1)}%)
- Activados (portado): ${stats.resumen.activadoPortado}
- Activados (Claro): ${stats.resumen.activadoClaro}
- Cancelados: ${stats.resumen.cancelados}
- SP Cancelados: ${stats.resumen.spCancelados}
- Pendientes de PIN: ${stats.resumen.pendientePin}

TASA DE CONVERSIÓN: ${stats.totales.tasaConversion.toFixed(1)}%
Total activados: ${stats.totales.totalActivados} de ${stats.totales.totalVentas}`;
  }

  /**
   * Construir sección de top vendedores
   */
  private buildTopVendedoresSection(stats: any): string {
    const topVendedores = stats.ventasPorVendedor.slice(0, 20);
    
    if (topVendedores.length === 0) {
      return '=== TOP VENDEDORES ===\n(No hay datos de vendedores)';
    }

    const lines = topVendedores.map((v: any, i: number) => 
      `${i + 1}. ${v.vendedorNombre} | ${v.totalVentas} ventas | ${v.percActivados.toFixed(1)}% activación | Célula: ${v.cellaNombre}`
    );

    return `=== TOP 20 VENDEDORES ===
${lines.join('\n')}`;
  }

  /**
   * Construir sección de top células
   */
  private buildTopCellsSection(stats: any): string {
    const topCells = stats.ventasPorCell.slice(0, 20);
    
    if (topCells.length === 0) {
      return '=== TOP CÉLULAS ===\n(No hay datos de células)';
    }

    const lines = topCells.map((c: any, i: number) => 
      `${i + 1}. ${c.cellaNombre} | ${c.totalVentas} ventas | ${c.percActivados.toFixed(1)}% activación`
    );

    return `=== TOP 20 CÉLULAS ===
${lines.join('\n')}`;
  }

  /**
   * Construir sección de ranking de clientes
   */
  private buildClientesRankingSection(stats: any): string {
    const clienteCounts = new Map<string, { count: number; data: any }>();
    
    for (const venta of stats.detalle) {
      const key = venta.clienteDocumento || venta.clienteNombre;
      if (clienteCounts.has(key)) {
        clienteCounts.get(key)!.count++;
      } else {
        clienteCounts.set(key, { count: 1, data: venta });
      }
    }
    
    const ranking = Array.from(clienteCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20);
    
    if (ranking.length === 0) {
      return '=== TOP 20 CLIENTES POR CANTIDAD DE COMPRAS ===\n(No hay datos de clientes)';
    }
    
    const lines = ranking.map(([key, { count, data }], i) => {
      return `${i + 1}. ${data.clienteNombre} (DOC: ${data.clienteDocumento || 'N/A'}) - ${count} venta(s)`;
    });
    
    return `=== TOP 20 CLIENTES POR CANTIDAD DE COMPRAS ===
${lines.join('\n')}`;
  }

  /**
   * Obtener top empresas desde la base de datos
   */
  private async getTopEmpresas(filters: any): Promise<any[]> {
    try {
      const client = this.estadisticaModel['connection'].getClient();
      
      let whereClause = "WHERE v.fecha_creacion >= $1";
      const values: any[] = [this.getFechaInicio(filters.periodo)];
      let paramIndex = 2;

      if (filters.userRol === "VENDEDOR") {
        whereClause += ` AND v.vendedor_id = $${paramIndex++}`;
        values.push(filters.userId);
      }

      if (filters.pais) {
        whereClause += ` AND eo.pais ILIKE $${paramIndex++}`;
        values.push(filters.pais);
      }

      const query = `
        SELECT 
          eo.nombre_empresa,
          eo.pais,
          COUNT(*) as total_ventas
        FROM venta v
        INNER JOIN empresa_origen eo ON v.empresa_origen_id = eo.empresa_origen_id
        ${whereClause}
        GROUP BY eo.nombre_empresa, eo.pais
        ORDER BY total_ventas DESC
        LIMIT 10
      `;

      const result = await client.queryObject(query, values);
      return result.rows || [];
    } catch (error) {
      logger.error("[AIChat] Error obteniendo top empresas:", error);
      return [];
    }
  }

  /**
   * Construir sección de top empresas
   */
  private buildTopEmpresasSection(empresas: any[]): string {
    if (empresas.length === 0) {
      return '=== TOP 10 EMPRESAS ===\n(No hay datos de empresas)';
    }

    const totalVentas = empresas.reduce((sum: number, e: any) => sum + Number(e.total_ventas), 0);
    
    const lines = empresas.map((e: any, i: number) => {
      const cantidad = Number(e.total_ventas);
      const porcentaje = totalVentas > 0 ? ((cantidad / totalVentas) * 100).toFixed(1) : '0';
      return `${i + 1}. ${e.nombre_empresa} (${e.pais}) | ${cantidad} ventas (${porcentaje}%)`;
    });

    return `=== TOP 10 EMPRESAS ===
${lines.join('\n')}`;
  }

  /**
   * Construir sección de ventas detalladas
   */
  private buildVentasDetalleSection(stats: any): string {
    const detalle = stats.detalle;
    
    if (detalle.length === 0) {
      return '=== ÚLTIMAS VENTAS CON DETALLE ===\n(No hay ventas registradas)';
    }

    const lines = detalle.map((v: any, i: number) => {
      const fecha = new Date(v.fechaCreacion).toLocaleDateString('es-AR');
      const cliente = v.clienteNombre || 'Sin nombre';
      const documento = v.clienteDocumento || 'Sin documento';
      const telefono = 'N/A';
      const plan = v.sap || v.sds || 'N/A';
      const estado = v.estado || 'Desconocido';
      const vendedor = v.vendedorNombre || 'Sin vendedor';
      const tipoVenta = v.tipoVenta || 'N/A';
      
      return `${i + 1}. [${fecha}] ${cliente} | DOC: ${documento} | ${tipoVenta} | Estado: ${estado} | Vendedor: ${vendedor}`;
    });

    return `=== ÚLTIMAS ${detalle.length} VENTAS CON DETALLE ===
${lines.join('\n')}`;
  }

  /**
   * Obtener portabilidades activas
   */
  private async getPortabilidadesActivas(filters: any): Promise<any[]> {
    try {
      const client = this.portabilidadModel['connection'].getClient();
      
      const query = `
        SELECT 
          p.numero_portar,
          p.empresa_origen,
          p.fecha_portacion,
          p.fecha_vencimiento_pin,
          p.venta_id,
          v.fecha_creacion
        FROM portabilidad p
        INNER JOIN venta v ON p.venta_id = v.venta_id
        INNER JOIN usuario u ON v.vendedor_id = u.persona_id
        LEFT JOIN celula c ON u.celula = c.id_celula
        WHERE v.fecha_creacion >= $1
        ${filters.pais ? "AND c.pais_venta ILIKE $2" : ""}
        ORDER BY p.fecha_portacion DESC NULLS LAST
        LIMIT 100
      `;

      const values = filters.pais ? [this.getFechaInicio(filters.periodo), filters.pais] : [this.getFechaInicio(filters.periodo)];
      const result = await client.queryObject(query, values);
      return result.rows || [];
    } catch (error) {
      logger.error("[AIChat] Error obteniendo portabilidades:", error);
      return [];
    }
  }

  /**
   * Construir sección de portabilidades
   */
  private buildPortabilidadesSection(portabilidades: any[]): string {
    if (portabilidades.length === 0) {
      return '=== PORTABILIDADES ACTIVAS ===\n(No hay portabilidades en el período)';
    }

    const lines = portabilidades.slice(0, 50).map((p: any, i: number) => {
      const numero = p.numero_portar || 'N/A';
      const empresa = p.empresa_origen || 'N/A';
      const fechaPort = p.fecha_portacion ? new Date(p.fecha_portacion).toLocaleDateString('es-AR') : 'Pendiente';
      const fechaVence = p.fecha_vencimiento_pin ? new Date(p.fecha_vencimiento_pin).toLocaleDateString('es-AR') : 'N/A';
      
      return `${i + 1}. ${numero} | Desde: ${empresa} | Portación: ${fechaPort} | PIN vence: ${fechaVence}`;
    });

    const masMsg = portabilidades.length > 50 ? `\n(Mostrando 50 de ${portabilidades.length} portabilidades)` : '';
    
    return `=== PORTABILIDADES ACTIVAS ===${masMsg}
${lines.join('\n')}`;
  }

  /**
   * Obtener fecha de inicio según período
   */
  private getFechaInicio(periodo: string): Date {
    const now = new Date();
    switch (periodo) {
      case "HOY":
        return new Date(now.setHours(0, 0, 0, 0));
      case "SEMANA":
        return new Date(now.setDate(now.getDate() - 7));
      case "MES":
        return new Date(now.setMonth(now.getMonth() - 1));
      case "SEMESTRE":
        return new Date(new Date().setDate(new Date().getDate() - 180));
      case "AÑO":
        return new Date(now.setFullYear(now.getFullYear() - 1));
      case "TODO":
      default:
        return new Date(0);
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
    const AI_PROVIDER = process.env.AI_PROVIDER || 'openrouter';
    const AI_MODEL = process.env.AI_MODEL || 'openrouter/free';

    try {
      if (AI_PROVIDER === 'openrouter') {
        return await this.callOpenRouter(prompt, AI_MODEL);
      } else if (AI_PROVIDER === 'openai') {
        return await this.callOpenAI(prompt, AI_MODEL);
      } else if (AI_PROVIDER === 'claude') {
        return await this.callClaude(prompt);
      } else if (AI_PROVIDER === 'gemini') {
        return await this.callGemini(prompt);
      } else if (AI_PROVIDER === 'grok') {
        return await this.callGrok(prompt, AI_MODEL);
      } else if (AI_PROVIDER === 'minimax') {
        return await this.callMiniMax(prompt, AI_MODEL);
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
        max_tokens: 2000,
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
        max_tokens: 2000,
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
          maxOutputTokens: 2000,
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

  /**
   * Llamar a OpenRouter (modelos gratuitos)
   */
  private async callOpenRouter(prompt: string, model: string = 'openrouter/free'): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY no configurada");
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://flor-hub.com',
        'X-Title': 'Flor Hub'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error de OpenRouter: ${error.error?.message || 'Error desconocido'}`);
    }

    const data = await response.json() as any;
    return data.choices[0].message.content;
  }

  /**
   * Llamar a Grok (xAI)
   */
  private async callGrok(prompt: string, model: string = 'grok-4'): Promise<string> {
    const apiKey = process.env.XAI_API_KEY;
    
    if (!apiKey) {
      throw new Error("XAI_API_KEY no configurada");
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
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
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error de Grok: ${error.error?.message || 'Error desconocido'}`);
    }

    const data = await response.json() as any;
    return data.choices[0].message.content;
  }

  /**
   * Llamar a MiniMax
   */
  private async callMiniMax(prompt: string, model: string = 'MiniMax-M2.5'): Promise<string> {
    const apiKey = process.env.MINIMAX_API_KEY;
    
    if (!apiKey) {
      throw new Error("MINIMAX_API_KEY no configurada");
    }

    const response = await fetch('https://api.minimax.io/v1/chat/completions', {
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
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error de MiniMax: ${error.error?.message || 'Error desconocido'}`);
    }

    const data = await response.json() as any;
    return data.choices[0].message.content;
  }
}
