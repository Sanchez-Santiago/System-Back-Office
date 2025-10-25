// routes/auth.ts
import { Router } from "oak";
import { config } from "dotenv";
import { AuthController } from "../Controller/AuthController.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { UsuarioCreateSchema, UsuarioLogin } from "../schemas/persona/User.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import type { AuthenticatedUser, PasswordDataRaw } from "../types/userAuth.ts";

config({ export: true });

/**
 * Router de Autenticación
 *
 * Gestiona todas las operaciones relacionadas con autenticación y autorización:
 * - Login de usuarios
 * - Registro de nuevos usuarios (solo admins)
 * - Verificación de tokens JWT
 * - Refresh de tokens
 * - Cambio de contraseñas
 *
 * @param {UserModelDB} userModel - Modelo de base de datos para usuarios
 * @returns {Router} Router configurado con todas las rutas de autenticación
 *
 * @example
 * const authRouterInstance = authRouter(userModel);
 * app.use(authRouterInstance.routes());
 * app.use(authRouterInstance.allowedMethods());
 */
export function authRouter(userModel: UserModelDB) {
  const router = new Router();
  const authController = new AuthController(userModel);

  // ============================================
  // POST /usuario/login
  // ============================================
  /**
   * Autentica un usuario y genera un token JWT
   *
   * Ruta: POST /usuario/login
   * Acceso: Público (sin autenticación)
   *
   * Body (JSON):
   * {
   *   "user": {
   *     "email": "usuario@example.com",
   *     "password": "contraseña123"
   *   }
   * }
   *
   * Respuestas:
   * - 200: Login exitoso, token en cookie httpOnly
   * - 401: Credenciales inválidas
   *
   * @example
   * POST /usuario/login
   * Body: { "user": { "email": "admin@example.com", "password": "pass123" } }
   * Response: { "success": true, "data": { "token": "...", "user": {...} } }
   */
  router.post("/usuario/login", async (ctx) => {
    try {
      // Parsear y validar body
      const body = ctx.request.body.json();
      const input = await body;

      // Validar estructura básica
      if (!input || !input.user) {
        throw new Error(
          "Estructura de datos inválida. Se espera { user: {...} }",
        );
      }

      // Normalizar y extraer credenciales
      const email = input.user.email?.toLowerCase().trim();
      const password = input.user.password;

      // Validación de campos requeridos
      if (!email || !password) {
        throw new Error("Email y contraseña son campos requeridos");
      }

      // Validación básica de formato de email
      if (!email.includes("@")) {
        throw new Error("Formato de email inválido");
      }

      // Crear objeto de login validado
      const user: UsuarioLogin = {
        email,
        password,
      };

      console.log(`[INFO] POST /usuario/login - Email: ${email}`);

      // Autenticar usuario
      const newToken = await authController.login({ user });

      // Configurar cookie según el entorno
      const isProduction = Deno.env.get("MODO") === "production";
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction, // Solo HTTPS en producción
        sameSite: "strict" as const,
        maxAge: 60 * 60 * 24 * 1000, // 24 horas en milisegundos
      };

      // Establecer cookie con el token
      await ctx.cookies.set("token", newToken.token, cookieOptions);

      // Respuesta diferenciada por entorno
      ctx.response.status = 200;
      ctx.response.body = isProduction
        ? {
          success: true,
          message: "Autenticación exitosa",
        }
        : {
          success: true,
          data: newToken,
          message: "Autenticación exitosa",
        };

      console.log(`[INFO] ✅ Login exitoso para: ${email}`);
    } catch (error) {
      console.error("[ERROR] POST /usuario/login:", error);

      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: error instanceof Error
          ? error.message
          : "Error de autenticación",
      };
    }
  });

  // ============================================
  // POST /usuario/register
  // ============================================
  /**
   * Registra un nuevo usuario en el sistema
   *
   * Ruta: POST /usuario/register
   * Acceso: Solo ADMINISTRADOR y SUPERADMINISTRADOR
   * Requiere: authMiddleware, rolMiddleware
   *
   * Body (JSON):
   * {
   *   "user": {
   *     "nombre": "Juan",
   *     "apellido": "Pérez",
   *     "email": "juan@example.com",
   *     "password": "Password123",
   *     "legajo": "00123",
   *     "rol": "VENDEDOR",
   *     "exa": "EXA00123",
   *     "empresa_id_empresa": 1,
   *     ... (otros campos de persona)
   *   }
   * }
   *
   * Validaciones:
   * - Email único
   * - Legajo único (5 caracteres)
   * - Código EXA único (8 caracteres)
   * - Password mínimo 8 caracteres
   *
   * Respuestas:
   * - 201: Usuario creado exitosamente
   * - 400: Datos inválidos o usuario ya existe
   * - 401: No autenticado
   * - 403: Sin permisos (no es admin)
   *
   * @example
   * POST /usuario/register
   * Headers: Cookie: token=...
   * Body: { "user": { "nombre": "Juan", ... } }
   * Response: { "success": true, "token": "..." }
   */
  router.post(
    "/usuario/register",
    authMiddleware(userModel),
    rolMiddleware("ADMINISTRADOR", "SUPERADMINISTRADOR"),
    async (ctx) => {
      try {
        // Parsear body
        const body = ctx.request.body.json();
        const input = await body;

        // Validar estructura del payload
        if (!input || !input.user) {
          throw new Error(
            "Datos de usuario inválidos. Se espera { user: {...} }",
          );
        }

        const userData = input.user;

        console.log(`[INFO] POST /usuario/register - Email: ${userData.email}`);

        // Validar y normalizar datos con Zod
        const result = UsuarioCreateSchema.safeParse({
          // Datos de persona (normalizados a uppercase)
          nombre: userData.nombre?.toUpperCase().trim(),
          apellido: userData.apellido?.toUpperCase().trim(),
          documento: userData.documento?.toUpperCase().trim(),
          tipo_documento: userData.tipo_documento?.toUpperCase().trim(),
          nacionalidad: userData.nacionalidad?.toUpperCase().trim(),

          // Email en lowercase para consistencia
          email: userData.email?.toLowerCase().trim(),

          // Fecha de nacimiento
          fecha_nacimiento: userData.fecha_nacimiento,

          // Campos opcionales
          telefono: userData.telefono?.trim() ?? null,
          genero: userData.genero?.toUpperCase().trim() ?? "OTRO",

          // Datos de usuario
          legajo: userData.legajo?.trim(),
          rol: userData.rol,
          exa: userData.exa?.toUpperCase().trim(),
          password_hash: userData.password, // Se hasheará en el service
          empresa_id_empresa: Number(userData.empresa_id_empresa),
          estado: userData.estado ?? "ACTIVO",
        });

        // Verificar validación de Zod
        if (!result.success) {
          console.log("[ERROR] Validación fallida:", result.error.errors);

          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Datos de validación inválidos",
            errors: (result.error.errors as Array<
              { path: string[]; message: string }
            >).map(
              (error) => ({
                field: error.path.join("."),
                message: error.message,
              }),
            ),
          };
          return;
        }

        // Registrar usuario
        const newToken = await authController.register({ user: result.data });

        const isProduction = Deno.env.get("MODO") === "production";

        // Nota: No establecemos cookie aquí porque el admin ya está autenticado
        // El token se retorna solo para propósitos de testing/desarrollo

        ctx.response.status = 201;
        ctx.response.body = isProduction
          ? {
            success: true,
            message: "Usuario creado exitosamente",
          }
          : {
            success: true,
            token: newToken,
            message: "Usuario creado exitosamente",
          };

        console.log(`[INFO] ✅ Usuario registrado: ${result.data.email}`);
      } catch (error) {
        console.error("[ERROR] POST /usuario/register:", error);

        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al registrar usuario",
        };
      }
    },
  );

  // ============================================
  // GET /usuario/verify
  // ============================================
  /**
   * Verifica la validez de un token JWT
   *
   * Ruta: GET /usuario/verify
   * Acceso: Público (requiere token en header)
   *
   * Headers:
   * - Authorization: Bearer <token>
   *
   * Respuestas:
   * - 200: Token válido, retorna payload decodificado
   * - 401: Token inválido, expirado o no proporcionado
   *
   * Uso típico:
   * - Verificar token en frontend al cargar la app
   * - Validar permisos antes de operaciones críticas
   *
   * @example
   * GET /usuario/verify
   * Headers: { "Authorization": "Bearer eyJhbGciOi..." }
   * Response: { "success": true, "payload": { "id": "...", "email": "...", ... } }
   */
  router.get("/usuario/verify", async (ctx) => {
    try {
      // Extraer token del header Authorization
      const authHeader = ctx.request.headers.get("Authorization");
      const token = authHeader?.replace("Bearer ", "").trim();

      if (!token) {
        throw new Error(
          "Token no proporcionado. Use: Authorization: Bearer <token>",
        );
      }

      console.log("[INFO] GET /usuario/verify - Verificando token");

      // Verificar y decodificar token
      const payload = await authController.verifyToken(token);

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        payload,
        message: "Token válido",
      };

      console.log(`[INFO] ✅ Token verificado para: ${payload.email}`);
    } catch (error) {
      console.error("[ERROR] GET /usuario/verify:", error);

      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: error instanceof Error ? error.message : "Token inválido",
      };
    }
  });

  // ============================================
  // POST /usuario/refresh
  // ============================================
  /**
   * Refresca un token JWT existente
   *
   * Ruta: POST /usuario/refresh
   * Acceso: Requiere token válido en cookie
   *
   * Función:
   * - Valida el token actual
   * - Genera un nuevo token con tiempo de expiración renovado
   * - Actualiza la cookie httpOnly
   *
   * Uso típico:
   * - Refrescar token antes de que expire
   * - Mantener sesión activa del usuario
   *
   * Respuestas:
   * - 200: Token refrescado exitosamente
   * - 401: Token inválido o no proporcionado
   *
   * @example
   * POST /usuario/refresh
   * Cookie: token=eyJhbGciOi...
   * Response: { "success": true, "token": "..." }
   */
  router.post("/usuario/refresh", async (ctx) => {
    try {
      // Leer token de la cookie
      const token = await ctx.cookies.get("token");

      if (!token) {
        ctx.response.status = 401;
        ctx.response.body = {
          success: false,
          message: "No autorizado: token no presente en cookies",
        };
        return;
      }

      console.log("[INFO] POST /usuario/refresh - Refrescando token");

      // Generar nuevo token
      const newToken = await authController.refreshToken(token);

      // Configurar cookie según el entorno
      const isProduction = Deno.env.get("MODO") === "production";
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict" as const,
        maxAge: 60 * 60 * 24 * 1000, // 24 horas
      };

      // Actualizar cookie con nuevo token
      await ctx.cookies.set("token", newToken, cookieOptions);

      ctx.response.status = 200;
      ctx.response.body = isProduction
        ? {
          success: true,
          message: "Token refrescado exitosamente",
        }
        : {
          success: true,
          token: newToken,
          message: "Token refrescado exitosamente",
        };

      console.log("[INFO] ✅ Token refrescado exitosamente");
    } catch (error) {
      console.error("[ERROR] POST /usuario/refresh:", error);

      ctx.response.status = 401;
      ctx.response.body = {
        success: false,
        message: error instanceof Error
          ? error.message
          : "Error al refrescar token",
      };
    }
  });

  // ============================================
  // PATCH /usuarios/:id/password
  // ============================================
  /**
   * Cambia la contraseña de un usuario
   *
   * Ruta: PATCH /usuarios/:id/password
   * Acceso: Usuarios autenticados
   * Requiere: authMiddleware
   *
   * Permisos:
   * - Cualquier usuario puede cambiar su propia contraseña (requiere contraseña actual)
   * - ADMINISTRADOR/SUPERADMINISTRADOR pueden cambiar la de cualquier usuario (sin contraseña actual)
   *
   * Path params:
   * - id: UUID del usuario cuya contraseña se va a cambiar
   *
   * Body para cambio propio:
   * {
   *   "passwordActual": "contraseña_actual_del_usuario",
   *   "passwordNueva": "Nueva123Password",
   *   "passwordNuevaConfirmacion": "Nueva123Password"
   * }
   *
   * Body para cambio administrativo:
   * {
   *   "passwordNueva": "Nueva123Password",
   *   "passwordNuevaConfirmacion": "Nueva123Password"
   * }
   *
   * Validaciones de contraseña:
   * - Mínimo 8 caracteres
   * - Al menos una mayúscula
   * - Al menos una minúscula
   * - Al menos un número
   * - Las dos contraseñas nuevas deben coincidir
   *
   * Respuestas:
   * - 200: Contraseña actualizada exitosamente
   * - 400: Datos inválidos o contraseña actual incorrecta
   * - 401: No autenticado
   * - 403: Sin permisos para cambiar la contraseña de otro usuario
   *
   * @example
   * // Cambio propio
   * PATCH /usuarios/08bb1cfd-321d-4b28-b9e0-268aa0e662ca/password
   * Cookie: token=...
   * Body: { "passwordActual": "old", "passwordNueva": "New123", "passwordNuevaConfirmacion": "New123" }
   *
   * @example
   * // Cambio administrativo
   * PATCH /usuarios/otro-usuario-uuid/password
   * Cookie: token=... (admin token)
   * Body: { "passwordNueva": "New123", "passwordNuevaConfirmacion": "New123" }
   */
  router.patch(
    "/usuarios/:id/password",
    authMiddleware(userModel),
    async (ctx) => {
      try {
        // Extraer ID del path param
        const { id } = ctx.params;

        if (!id || id.trim() === "") {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "ID de usuario requerido en el path",
          };
          return;
        }

        // Obtener usuario autenticado del middleware
        const authenticatedUser: AuthenticatedUser = ctx.state.user;
        console.log(authenticatedUser);

        if (!authenticatedUser) {
          ctx.response.status = 401;
          ctx.response.body = {
            success: false,
            message: "Usuario no autenticado",
          };
          return;
        }

        // Parsear y validar body
        const body = await ctx.request.body.json();
        const passwordData = await body as PasswordDataRaw;

        if (!passwordData || Object.keys(passwordData).length === 0) {
          ctx.response.status = 400;
          ctx.response.body = {
            success: false,
            message: "Datos de contraseña requeridos en el body",
          };
          return;
        }

        // Determinar si es cambio propio o administrativo
        const isSelfChange = authenticatedUser.id === id;
        const changeType = isSelfChange ? "propio" : "administrativo";

        console.log(
          `[INFO] PATCH /usuarios/${id}/password - Cambio ${changeType}`,
        );
        console.log(
          `[INFO] Solicitado por: ${authenticatedUser.email} (${authenticatedUser.rol})`,
        );

        // Llamar al controller para cambiar contraseña
        await authController.changePassword({
          targetUserId: id,
          authenticatedUser,
          passwordData,
        });

        // Respuesta exitosa
        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: "Contraseña actualizada exitosamente",
        };

        console.log(`[INFO] ✅ Contraseña actualizada para usuario: ${id}`);
      } catch (error) {
        console.error("[ERROR] PATCH /usuarios/:id/password:", error);

        // Determinar código de error apropiado
        let statusCode = 400;
        if (error instanceof Error) {
          if (error.message.includes("no autenticado")) statusCode = 401;
          if (error.message.includes("permisos")) statusCode = 403;
          if (error.message.includes("no encontrado")) statusCode = 404;
        }

        ctx.response.status = statusCode;
        ctx.response.body = {
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al cambiar contraseña",
        };
      }
    },
  );

  // ============================================
  // POST /usuario/logout
  // ============================================
  /**
   * Cierra la sesión del usuario
   *
   * Ruta: POST /usuario/logout
   * Acceso: Usuarios autenticados
   *
   * Función:
   * - Elimina la cookie del token
   * - Invalida la sesión actual
   *
   * Respuestas:
   * - 200: Sesión cerrada exitosamente
   *
   * @example
   * POST /usuario/logout
   * Cookie: token=...
   * Response: { "success": true, "message": "Sesión cerrada" }
   */
  router.post("/usuario/logout", async (ctx) => {
    try {
      console.log("[INFO] POST /usuario/logout");

      // Eliminar cookie del token
      await ctx.cookies.delete("token");

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        message: "Sesión cerrada exitosamente",
      };

      console.log("[INFO] ✅ Logout exitoso");
    } catch (error) {
      console.error("[ERROR] POST /usuario/logout:", error);

      // Incluso si hay error, intentar cerrar sesión
      await ctx.cookies.delete("token");

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        message: "Sesión cerrada",
      };
    }
  });

  return router;
}
