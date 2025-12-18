// routes/usuario.ts
import { Router } from "oak";
import { config } from "dotenv";
import { UsuarioController } from "../Controller/UsuarioController.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { UsuarioUpdateSchema } from "../schemas/persona/User.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import { ROLES_ADMIN, ROLES_MANAGEMENT } from "../constants/roles.ts";

config({ export: true });

/**
 * Router de Usuario
 *
 * Define todas las rutas relacionadas con operaciones CRUD de usuarios.
 * Todas las rutas requieren autenticación y la mayoría requieren roles específicos.
 *
 * Rutas disponibles:
 * - GET    /usuarios          - Listar usuarios con paginación
 * - GET    /usuarios/:id      - Obtener usuario por ID
 * - GET    /usuarios/email    - Obtener usuario por email (query param)
 * - GET    /usuarios/legajo   - Obtener usuario por legajo (query param)
 * - GET    /usuarios/exa      - Obtener usuario por EXA (query param)
 * - GET    /usuarios/stats    - Obtener estadísticas de usuarios
 * - PUT    /usuarios/:id      - Actualizar usuario
 * - DELETE /usuarios/:id      - Eliminar usuario
 * - PATCH  /usuarios/:id/status - Cambiar estado de usuario
 *
 * @param {UserModelDB} userModel - Modelo de base de datos para usuarios
 * @returns {Router} Router configurado con todas las rutas
 */
export function usuarioRouter(userModel: UserModelDB) {
  const router = new Router();
  const usuarioController = new UsuarioController(userModel);

  /**
   * GET /usuarios
   * Obtiene todos los usuarios con paginación y filtros opcionales
   *
   * Query params:
   * - page: número de página (default: 1)
   * - limit: resultados por página (default: 10, max: 100)
   * - name: filtro por nombre/apellido (búsqueda parcial)
   * - email: filtro por email (búsqueda parcial)
   *
   * Roles permitidos: ADMINISTRADOR, SUPERADMINISTRADOR, SUPERVISOR
   *
   * @example
   * GET /usuarios?page=1&limit=20&name=Juan
   */
  router.get(
    "/usuarios",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx) => {
      try {
        // Extraer query params
        const url = ctx.request.url;
        const page = Number(url.searchParams.get("page")) || 1;
        const limit = Number(url.searchParams.get("limit")) || 10;
        const name = url.searchParams.get("name") || undefined;
        const email = url.searchParams.get("email") || undefined;

        console.log(`[INFO] GET /usuarios - Página: ${page}, Límite: ${limit}`);

        // Obtener usuarios del controlador
        const usuarios = await usuarioController.getAll({
          page,
          limit,
          name,
          email,
        });

        // Respuesta exitosa
        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: usuarios,
          pagination: {
            page,
            limit,
            total: usuarios.length,
          },
        };
      } catch (error) {
        console.error("[ERROR] GET /usuarios:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener usuarios",
        };
      }
    },
  );

  /**
   * GET /usuarios/stats
   * Obtiene estadísticas de usuarios (total, por rol, por estado)
   *
   * Roles permitidos: ADMINISTRADOR, SUPERADMINISTRADOR
   *
   * @example
   * GET /usuarios/stats
   * Response: { total: 150, porRol: {...}, porEstado: {...} }
   */
  router.get(
    "/usuarios/stats",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx) => {
      try {
        console.log("[INFO] GET /usuarios/stats");

        // Obtener estadísticas del controlador
        const stats = await usuarioController.getStats();

        // Respuesta exitosa
        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: stats,
        };
      } catch (error) {
        console.error("[ERROR] GET /usuarios/stats:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al obtener estadísticas",
        };
      }
    },
  );

  /**
   * GET /usuarios/search/email
   * Busca un usuario por su email
   *
   * Query params:
   * - email: email del usuario (requerido)
   *
   * Roles permitidos: ADMINISTRADOR, SUPERADMINISTRADOR, SUPERVISOR
   *
   * @example
   * GET /usuarios/search/email?email=user@example.com
   */
  router.get(
    "/usuarios/search/email",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx) => {
      try {
        const url = ctx.request.url;
        const email = url.searchParams.get("email");

        if (!email) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Email requerido en query params",
          };
          return;
        }

        console.log(`[INFO] GET /usuarios/search/email - Email: ${email}`);

        // Buscar usuario por email
        const usuario = await usuarioController.getByEmail({ email });

        // Respuesta exitosa
        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: usuario,
        };
      } catch (error) {
        console.error("[ERROR] GET /usuarios/search/email:", error);
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Usuario no encontrado",
        };
      }
    },
  );

  /**
   * GET /usuarios/search/legajo
   * Busca un usuario por su legajo
   *
   * Query params:
   * - legajo: legajo del usuario (requerido, 5 caracteres)
   *
   * Roles permitidos: ADMINISTRADOR, SUPERADMINISTRADOR, SUPERVISOR
   *
   * @example
   * GET /usuarios/search/legajo?legajo=00001
   */
  router.get(
    "/usuarios/search/legajo",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx) => {
      try {
        const url = ctx.request.url;
        const legajo = url.searchParams.get("legajo");

        if (!legajo) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Legajo requerido en query params",
          };
          return;
        }

        console.log(`[INFO] GET /usuarios/search/legajo - Legajo: ${legajo}`);

        // Buscar usuario por legajo
        const usuario = await usuarioController.getByLegajo({ legajo });

        // Respuesta exitosa
        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: usuario,
        };
      } catch (error) {
        console.error("[ERROR] GET /usuarios/search/legajo:", error);
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Usuario no encontrado",
        };
      }
    },
  );

  /**
   * GET /usuarios/search/exa
   * Busca un usuario por su código EXA
   *
   * Query params:
   * - exa: código EXA del usuario (requerido, 8 caracteres)
   *
   * Roles permitidos: ADMINISTRADOR, SUPERADMINISTRADOR, SUPERVISOR
   *
   * @example
   * GET /usuarios/search/exa?exa=AB123456
   */
  router.get(
    "/usuarios/search/exa",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx) => {
      try {
        const url = ctx.request.url;
        const exa = url.searchParams.get("exa");

        if (!exa) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Código EXA requerido en query params",
          };
          return;
        }

        console.log(`[INFO] GET /usuarios/search/exa - EXA: ${exa}`);

        // Buscar usuario por EXA
        const usuario = await usuarioController.getByExa({ exa });

        // Respuesta exitosa
        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: usuario,
        };
      } catch (error) {
        console.error("[ERROR] GET /usuarios/search/exa:", error);
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Usuario no encontrado",
        };
      }
    },
  );

  /**
   * GET /usuarios/:id
   * Obtiene un usuario específico por su ID
   *
   * Path params:
   * - id: UUID del usuario
   *
   * Roles permitidos: ADMINISTRADOR, SUPERADMINISTRADOR, SUPERVISOR
   *
   * @example
   * GET /usuarios/550e8400-e29b-41d4-a716-446655440000
   */
  router.get(
    "/usuarios/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_MANAGEMENT),
    async (ctx) => {
      try {
        const { id } = ctx.params;

        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de usuario requerido",
          };
          return;
        }

        console.log(`[INFO] GET /usuarios/${id}`);

        // Obtener usuario por ID
        const usuario = await usuarioController.getById({ id });

        // Respuesta exitosa
        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: usuario,
        };
      } catch (error) {
        console.error("[ERROR] GET /usuarios/:id:", error);
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Usuario no encontrado",
        };
      }
    },
  );

  /**
   * PUT /usuarios/:id
   * Actualiza los datos de un usuario existente
   *
   * Path params:
   * - id: UUID del usuario
   *
   * Body (JSON):
   * - Cualquier campo de UsuarioUpdate (actualización parcial)
   *
   * Roles permitidos: ADMINISTRADOR, SUPERADMINISTRADOR
   *
   * @example
   * PUT /usuarios/550e8400-e29b-41d4-a716-446655440000
   * Body: { "telefono": "1234567890", "estado": "INACTIVO" }
   */
  router.put(
    "/usuarios/:id",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx) => {
      try {
        const { id } = ctx.params;

        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de usuario requerido",
          };
          return;
        }

        // Parsear body
        const body = await ctx.request.body.json();
        const updateData = await body;

        if (!updateData || Object.keys(updateData).length === 0) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "No hay datos para actualizar",
          };
          return;
        }

        console.log(`[INFO] PUT /usuarios/${id}`);

        // Validar con Zod (parcial)
        const result = UsuarioUpdateSchema.partial().safeParse(updateData);

        if (!result.success) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Datos de validación inválidos",
            errors: result.error.errors,
          };
          return;
        }

        // Actualizar usuario
        const usuarioActualizado = await usuarioController.update({
          id,
          input: result.data,
        });

        // Respuesta exitosa
        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: "Usuario actualizado exitosamente",
          data: usuarioActualizado,
        };
      } catch (error) {
        console.error("[ERROR] PUT /usuarios/:id:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al actualizar usuario",
        };
      }
    },
  );

  /**
   * PATCH /usuarios/:id/status
   * Cambia el estado de un usuario (ACTIVO, INACTIVO, SUSPENDIDO)
   *
   * Path params:
   * - id: UUID del usuario
   *
   * Body (JSON):
   * - estado: "ACTIVO" | "INACTIVO" | "SUSPENDIDO"
   *
   * Roles permitidos: ADMINISTRADOR, SUPERADMINISTRADOR
   *
   * @example
   * PATCH /usuarios/550e8400-e29b-41d4-a716-446655440000/status
   * Body: { "estado": "SUSPENDIDO" }
   */
  router.patch(
    "/usuarios/:id/status",
    authMiddleware(userModel),
    rolMiddleware(...ROLES_ADMIN),
    async (ctx) => {
      try {
        const { id } = ctx.params;

        if (!id) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de usuario requerido",
          };
          return;
        }

        // Parsear body
        const body = await ctx.request.body.json();
        const { estado } = await body;

        if (!estado) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Estado requerido en el body",
          };
          return;
        }

        console.log(`[INFO] PATCH /usuarios/${id}/status - Estado: ${estado}`);

        // Cambiar estado
        const usuarioActualizado = await usuarioController.changeStatus({
          id,
          estado,
        });

        // Respuesta exitosa
        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: `Estado cambiado a ${estado} exitosamente`,
          data: usuarioActualizado,
        };
      } catch (error) {
        console.error("[ERROR] PATCH /usuarios/:id/status:", error);
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al cambiar estado",
        };
      }
    },
  );

  /**
   * DELETE /usuarios/:id
   * Elimina un usuario de forma permanente
   *
   * ⚠️ ADVERTENCIA: Esta operación es irreversible
   *
   * Path params:
   * - id: UUID del usuario
   *
   * Roles permitidos: SUPERADMINISTRADOR únicamente
   *
   * @example
   * DELETE /usuarios/550e8400-e29b-41d4-a716-446655440000
   */
   // DELETE /usuarios/:id
   router.delete(
     "/usuarios/:id",
     authMiddleware(userModel),
     rolMiddleware("SUPERADMINISTRADOR"),
     async (ctx) => {
       try {
         const { id } = ctx.params;

         if (!id) {
           ctx.response.status = 400;
           ctx.response.body = {
             success: false,
             message: "ID de usuario requerido",
           };
           return;
         }

         await usuarioController.delete({ id });

         ctx.response.status = 200;
         ctx.response.body = {
           success: true,
           message: "Usuario eliminado exitosamente",
         };
       } catch (error) {
         console.error("[ERROR] DELETE /usuarios/:id:", error);
         ctx.response.status = 400;
         ctx.response.body = {
           success: false,
           message: error instanceof Error ? error.message : "Error al eliminar usuario",
         };
       }
     },
   );

  return router;
}
