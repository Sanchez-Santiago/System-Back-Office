// ============================================
// BackEnd/src/router/AIChatRouter.ts
// Router para el chat con IA
// ============================================

import express, { Request, Response } from 'express';
import { authMiddleware } from "../middleware/auth.js";
import { ChatPostgreSQL } from "../model/chatPostgreSQL";
import { EstadisticaPostgreSQL } from "../model/estadisticaPostgreSQL";
import { VentaPostgreSQL } from "../model/ventaPostgreSQL";
import { UserModelDB } from "../interface/Usuario";
import { AIChatService } from "../services/AIChatService";
import { logger } from "../Utils/logger";
import { getPostgresClient } from "../database/PostgreSQL";

export function aiChatRouter(
  chatModel: ChatPostgreSQL,
  estadisticaModel: EstadisticaPostgreSQL,
  ventaModel: VentaPostgreSQL,
  usuarioModel: UserModelDB
) {
  const router = express.Router();

  const aiChatService = new AIChatService(
    chatModel,
    estadisticaModel,
    ventaModel,
    usuarioModel
  );

  /**
   * POST /ai-chat - Enviar mensaje
   */
  router.post(
    "/ai-chat",
    authMiddleware(usuarioModel),
    async (req: Request, res: Response) => {
      try {
        const { message, chatId } = req.body;

        if (!message || typeof message !== 'string') {
          res.status(400).json({
            success: false,
            message: "El mensaje es requerido",
          });
          return;
        }

        const user = (req as any).user;
        
        const result = await aiChatService.sendMessage({
          userId: user.persona_id,
          userRol: user.rol,
          chatId: chatId ? Number(chatId) : undefined,
          message,
        });

        res.status(200).json({
          success: true,
          data: {
            chatId: result.chatId,
            message: result.message,
            history: result.history,
          },
        });
      } catch (error) {
        logger.error("POST /ai-chat:", error);
        res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : "Error al procesar mensaje",
        });
      }
    }
  );

  /**
   * GET /ai-chat/conversaciones - Listar conversaciones
   */
  router.get(
    "/ai-chat/conversaciones",
    authMiddleware(usuarioModel),
    async (req: Request, res: Response) => {
      try {
        const user = (req as any).user;
        
        const conversaciones = await aiChatService.getConversaciones(user.persona_id);

        res.status(200).json({
          success: true,
          data: conversaciones,
        });
      } catch (error) {
        logger.error("GET /ai-chat/conversaciones:", error);
        res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : "Error al obtener conversaciones",
        });
      }
    }
  );

  /**
   * GET /ai-chat/:chatId - Obtener historial de una conversación
   */
  router.get(
    "/ai-chat/:chatId",
    authMiddleware(usuarioModel),
    async (req: Request, res: Response) => {
      try {
        const { chatId } = req.params;
        const user = (req as any).user;
        
        const historial = await aiChatService.getHistorial(Number(chatId), user.persona_id);

        res.status(200).json({
          success: true,
          data: {
            chatId: Number(chatId),
            messages: historial,
          },
        });
      } catch (error) {
        logger.error("GET /ai-chat/:chatId:", error);
        res.status(404).json({
          success: false,
          message: error instanceof Error ? error.message : "Conversación no encontrada",
        });
      }
    }
  );

  /**
   * DELETE /ai-chat/:chatId - Eliminar conversación
   */
  router.delete(
    "/ai-chat/:chatId",
    authMiddleware(usuarioModel),
    async (req: Request, res: Response) => {
      try {
        const { chatId } = req.params;
        const user = (req as any).user;
        
        await aiChatService.deleteConversacion(Number(chatId), user.persona_id);

        res.status(200).json({
          success: true,
          message: "Conversación eliminada",
        });
      } catch (error) {
        logger.error("DELETE /ai-chat/:chatId:", error);
        res.status(404).json({
          success: false,
          message: error instanceof Error ? error.message : "Conversación no encontrada",
        });
      }
    }
  );

  return router;
}
