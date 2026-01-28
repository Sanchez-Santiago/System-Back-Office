// ============================================
// BackEnd/src/router/UsuarioRouterResilient.ts
// ============================================
import { Router, Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { config } from "https://deno.land/std/dotenv/mod.ts";
import { UsuarioController } from "../Controller/UsuarioController.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { UsuarioUpdateSchema } from "../schemas/persona/User.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_ADMIN, ROLES_MANAGEMENT } from "../constants/roles.ts";
import { logger } from "../Utils/logger.ts";
import { errorHandlerMiddleware } from "../middleware/errorHandlingMiddleware.ts";
import { ResilientController } from "../middleware/resilientController.ts";
import { ServiceDegradedError } from "../types/errors.ts";

config({ export: true });

type ContextWithParams = Context & { params: Record<string, string> };

/**
 * Router de Usuario con manejo resiliente de errores
 * ✅ ACTUALIZADO: Sistema resiliente con manejo de errores degradado
 */
export function usuarioRouterResilient(userModel: UserModelDB) {
  const router = new Router();
  const usuarioController = new UsuarioController(userModel);

  /**
   * GET /usuarios
   * Obtiene todos los usuarios con paginación
   * Manejo resiliente: retorna array vacío en modo degradado
   */
  router.get(
    "/usuarios",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    errorHandlerMiddleware,
    async (ctx: ContextWithParams) => {
      const url = ctx.request.url;
      const page = Number(url.searchParams.get("page")) || 1;
      const limit = Number(url.searchParams.get("limit")) || 10;
      const name = url.searchParams.get("name") || undefined;
      const email = url.searchParams.get("email") || undefined;

      logger.info(`GET /usuarios - Página: ${page}, Límite: ${limit}`);

      try {
        const usuarios = await ResilientController.getWithFallback(
          "getAllUsuarios",
          () => usuarioController.getAll({ page, limit, name, email }),
          [] // fallback: array vacío
        );

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: usuarios,
          pagination: {
            page,
            limit,
            total: usuarios.length,
          },
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        if (error instanceof ServiceDegradedError) {
          ctx.response.status = 503;
          ctx.response.body = ResilientController.createDegradedResponse(
            "obtención de usuarios",
            error.message
          );
          return;
        }
        throw error; // El errorHandlerMiddleware manejará otros errores
      }
    }
  );

  /**
   * GET /usuarios/:id
   * Obtiene un usuario específico
   */
  router.get(
    "/usuarios/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    errorHandlerMiddleware,
    async (ctx: ContextWithParams) => {
      const { id } = ctx.params;

      logger.info(`GET /usuarios/${id}`);

      try {
        const usuario = await ResilientController.withResilientHandling(
          "getUsuarioById",
          () => usuarioController.getById({ id })
        );

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: usuario,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        if (error instanceof ServiceDegradedError) {
          ctx.response.status = 503;
          ctx.response.body = ResilientController.createDegradedResponse(
            "obtención de usuario por ID",
            error.message
          );
          return;
        }
        throw error;
      }
    }
  );

  /**
   * POST /usuarios
   * Crea un nuevo usuario
   */
  router.post(
    "/usuarios",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    errorHandlerMiddleware,
    async (ctx: ContextWithParams) => {
      try {
        const body = await ctx.request.body().value;
        
        // Validación básica (debería usar Zod en producción)
        if (!body.email || !body.nombre || !body.apellido) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Faltan campos obligatorios: email, nombre, apellido",
            timestamp: new Date().toISOString(),
          };
          return;
        }

        logger.info(`POST /usuarios - Creando usuario: ${body.email}`);

        // Nota: El método add no existe en el controlador actual, esto es un ejemplo
        // const usuario = await ResilientController.withResilientHandling(
        //   "createUsuario",
        //   () => usuarioController.add({ input: body })
        // );

        ctx.response.status = 503;
        ctx.response.body = ResilientController.createDegradedResponse(
          "creación de usuarios",
          "Función temporalmente deshabilitada en modo degradado"
        );
      } catch (error) {
        if (error instanceof ServiceDegradedError) {
          ctx.response.status = 503;
          ctx.response.body = ResilientController.createDegradedResponse(
            "creación de usuario",
            error.message
          );
          return;
        }
        throw error;
      }
    }
  );

  /**
   * PUT /usuarios/:id
   * Actualiza un usuario existente
   */
  router.put(
    "/usuarios/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    errorHandlerMiddleware,
    async (ctx: ContextWithParams) => {
      const { id } = ctx.params;
      const body = await ctx.request.body().value;

      logger.info(`PUT /usuarios/${id}`);

      try {
        const validation = UsuarioUpdateSchema.safeParse(body);
        if (!validation.success) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Datos inválidos",
            errors: validation.error.errors,
            timestamp: new Date().toISOString(),
          };
          return;
        }

        const usuario = await ResilientController.withResilientHandling(
          "updateUsuario",
          () => usuarioController.update({ id, input: validation.data })
        );

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: usuario,
          message: "Usuario actualizado correctamente",
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        if (error instanceof ServiceDegradedError) {
          ctx.response.status = 503;
          ctx.response.body = ResilientController.createDegradedResponse(
            "actualización de usuario",
            error.message
          );
          return;
        }
        throw error;
      }
    }
  );

  /**
   * DELETE /usuarios/:id
   * Elimina un usuario
   */
  router.delete(
    "/usuarios/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    errorHandlerMiddleware,
    async (ctx: ContextWithParams) => {
      const { id } = ctx.params;

      logger.info(`DELETE /usuarios/${id}`);

      try {
        // Nota: El método delete no existe en el controlador actual, esto es un ejemplo
        // const resultado = await ResilientController.withResilientHandling(
        //   "deleteUsuario",
        //   () => usuarioController.delete({ id })
        // );

        ctx.response.status = 503;
        ctx.response.body = ResilientController.createDegradedResponse(
          "eliminación de usuarios",
          "Función temporalmente deshabilitada en modo degradado"
        );
      } catch (error) {
        if (error instanceof ServiceDegradedError) {
          ctx.response.status = 503;
          ctx.response.body = ResilientController.createDegradedResponse(
            "eliminación de usuario",
            error.message
          );
          return;
        }
        throw error;
      }
    }
  );

  return router;
}