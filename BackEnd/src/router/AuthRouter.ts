import express, { Request, Response, NextFunction } from 'express';
import { ZodIssue } from 'zod';

import { AuthController } from "../Controller/AuthController.ts";
import { logger } from "../Utils/logger.ts";
import { authMiddleware } from "../middleware/authMiddlewares.ts";
import { rolMiddleware } from "../middleware/rolMiddlewares.ts";
import {
  CambioPassword,
  CambioPasswordAdmin,
  CambioPasswordSchema,
  UsuarioCreate,
  UsuarioCreateSchema,
  UsuarioLogin,
  UsuarioLoginSchema,
} from "../schemas/persona/User.ts";
import type { AuthenticatedUser, PasswordDataRaw } from "../types/userAuth.ts";
import { UserModelDB } from "../interface/Usuario.ts";
import { manejoDeError } from "../Utils/errores.ts";

export function authRouter(userModel: UserModelDB) {
  const router = express.Router();
  const authController = new AuthController(userModel);

  router.post(
    "/usuario/login",
    async (req: Request, res: Response) => {
      try {
        const input = req.body;

        if (!input || !input.user) {
          throw new Error(
            "Estructura de datos inválida. Se espera { user: {...} }",
          );
        }

        const email = input.user.email?.toLowerCase().trim();
        const password = input.user.password;

        if (!email || !password) {
          throw new Error("Email y contraseña son campos requeridos");
        }

        if (!email.includes("@")) {
          throw new Error("Formato de email inválido");
        }

        const user: UsuarioLogin = { email, password };

        const newToken = await authController.login({ user });

        const isProduction = process.env.MODO === "production";
        const cookieOptions = {
          httpOnly: true,
          secure: isProduction,
          sameSite: "strict" as const,
          maxAge: 60 * 60 * 24,
        };

        res.cookie("token", newToken.token, cookieOptions);

        res.status(200).json({
          success: true,
          data: newToken,
          message: "Autenticación exitosa"
        });
      } catch (error) {
        logger.error("POST /usuario/login:", error);
        res.status(401).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error de autenticación",
        });
      }
    },
  );

  router.post(
    "/usuario/register",
    authMiddleware(userModel),
    rolMiddleware("SUPERADMIN"),
    async (req: Request, res: Response) => {
      try {
        const input = req.body;

        if (!input || !input.user) {
          throw new Error(
            "Datos de usuario inválidos. Se espera { user: {...} }",
          );
        }

        const userData = input.user;

        const result = UsuarioCreateSchema.safeParse({
          nombre: userData.nombre?.toUpperCase().trim(),
          apellido: userData.apellido?.toUpperCase().trim(),
          documento: userData.documento?.toUpperCase().trim(),
          tipo_documento: userData.tipo_documento?.toUpperCase().trim(),
          nacionalidad: userData.nacionalidad?.toUpperCase().trim(),
          email: userData.email?.toLowerCase().trim(),
          fecha_nacimiento: userData.fecha_nacimiento,
          telefono: userData.telefono?.trim() ?? null,
          genero: userData.genero?.toUpperCase().trim() ?? "OTRO",
          legajo: userData.legajo?.trim(),
          rol: userData.rol.toUpperCase(),
          permisos: userData.permisos?.map((permiso: string) =>
            permiso.toUpperCase()
          ) || [],
          exa: userData.exa?.toUpperCase().trim(),
          password_hash: userData.password,
          celula: Number(userData.celula),
          estado: userData.estado ?? "ACTIVO",
        });

        if (!result.success) {
          res.status(400).json({
            success: false,
            message: "Datos de validación inválidos",
            errors: result.error.errors.map((error: ZodIssue) => ({
              field: error.path.join("."),
              message: error.message,
            })),
          });
          return;
        }

        const newToken = await authController.register({ user: result.data });

        const isProduction = process.env.MODO === "production";

        res.status(201).json(isProduction
          ? { success: true, message: "Usuario creado exitosamente" }
          : {
            success: true,
            token: newToken,
            message: "Usuario creado exitosamente",
          });
      } catch (error) {
        logger.error("POST /usuario/register:", error);
        res.status(400).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al registrar usuario",
        });
      }
    },
  );

  router.get(
    "/usuario/verify",
    async (req: Request, res: Response) => {
      try {
        let token = req.cookies?.token;
        
        if (!token) {
          const authHeader = req.headers.authorization;
          token = authHeader?.replace("Bearer ", "").trim();
        }

        if (!token) {
          res.status(401).json({
            success: false,
            message: "Token no proporcionado",
          });
          return;
        }

        const payload = await authController.verifyToken(token);

        const user = await userModel.getById({ id: payload.id as string });

        if (!user) {
          res.status(401).json({
            success: false,
            message: "Usuario no encontrado",
          });
          return;
        }

        res.status(200).json({
          success: true,
          payload: {
            id: user.persona_id,
            email: user.email,
            nombre: user.nombre,
            apellido: user.apellido,
            rol: user.rol,
            permisos: user.permisos,
            legajo: user.legajo,
            exa: user.exa,
            celula: user.celula,
            estado: user.estado,
            pais_venta: user.pais_venta,
          },
          message: "Token válido",
        });
      } catch (error) {
        logger.error("GET /usuario/verify:", error);
        res.status(401).json({
          success: false,
          message: error instanceof Error ? error.message : "Token inválido",
        });
      }
    },
  );

  router.post("/usuario/refresh", async (req: Request, res: Response) => {
    try {
      let token = req.cookies?.token;

      if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        res.status(401).json({
          success: false,
          message: "No autorizado: token no presente",
        });
        return;
      }

      const newToken = await authController.refreshToken(token);

      const isProduction = process.env.MODO === "production";
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict" as const,
        maxAge: 60 * 60 * 24 * 1000,
      };

      res.cookie("token", newToken, cookieOptions);

      res.status(200).json({
        success: true,
        token: newToken,
        message: "Token refrescado exitosamente",
      });
    } catch (error) {
      logger.error("POST /usuario/refresh:", error);
      res.status(401).json({
        success: false,
        message: error instanceof Error
          ? error.message
          : "Error al refrescar token",
      });
    }
  });

  router.patch(
    "/usuarios/:id/password",
    authMiddleware(userModel),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        if (!id || id.trim() === "") {
          res.status(400).json({
            success: false,
            message: "ID de usuario requerido en el path",
          });
          return;
        }

        const authenticatedUser: AuthenticatedUser = (req as any).user;

        if (!authenticatedUser) {
          res.status(401).json({
            success: false,
            message: "Usuario no autenticado",
          });
          return;
        }

        const passwordData = req.body as PasswordDataRaw;

        if (!passwordData || Object.keys(passwordData).length === 0) {
          res.status(400).json({
            success: false,
            message: "Datos de contraseña requeridos en el body",
          });
          return;
        }

        await authController.changePassword({
          targetUserId: id,
          authenticatedUser,
          passwordData,
        });

        res.status(200).json({
          success: true,
          message: "Contraseña actualizada exitosamente",
        });
      } catch (error) {
        logger.error("PATCH /usuarios/:id/password:", error);

        let statusCode = 400;
        if (error instanceof Error) {
          if (error.message.includes("no autenticado")) statusCode = 401;
          if (error.message.includes("permisos")) statusCode = 403;
          if (error.message.includes("no encontrado")) statusCode = 404;
        }

        res.status(statusCode).json({
          success: false,
          message: error instanceof Error
            ? error.message
            : "Error al cambiar contraseña",
        });
      }
    },
  );

  router.post("/usuario/logout", async (req: Request, res: Response) => {
    try {
      res.clearCookie("token");

      res.status(200).json({
        success: true,
        message: "Sesión cerrada exitosamente",
      });
    } catch (error) {
      logger.error("POST /usuario/logout:", error);
      res.clearCookie("token");

      res.status(200).json({
        success: true,
        message: "Sesión cerrada",
      });
    }
  });
  return router;
}
