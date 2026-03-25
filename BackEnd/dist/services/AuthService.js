// ============================================
// BackEnd/src/services/AuthService.ts
// ============================================
import 'dotenv/config';
import { logger } from "../Utils/logger";
import { SignJWT, jwtVerify } from 'jose';
import { CryptoService } from "./CryptoService";
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ALGORITHM = process.env.JWT_ALGORITHM || "HS256";
export class AuthService {
    modeUser;
    constructor(modeUser) {
        this.modeUser = modeUser;
    }
    getAllFailedAttempts() {
        // Not implemented for DB version
        return [];
    }
    async createJWTKey(secret) {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secret);
        return await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
    }
    async login(input) {
        try {
            const email = input.user.email;
            const userOriginal = await this.modeUser.getByEmail({
                email: email.toLowerCase(),
            });
            if (!userOriginal) {
                throw new Error("Correo no encontrado");
            }
            // Verificar si cuenta está bloqueada
            const userId = userOriginal.persona_id;
            const failedAttempts = await this.modeUser.getFailedAttemptsDB({ id: userId });
            const isLocked = failedAttempts >= 15;
            if (isLocked) {
                throw new Error(`Cuenta bloqueada por demasiados intentos fallidos. Contacte al administrador.`);
            }
            const passwordHash = await this.modeUser.getPasswordHash({
                id: userOriginal.persona_id,
            });
            if (!passwordHash) {
                throw new Error("Password incorrecto");
            }
            const isValidPassword = await CryptoService.verifyPassword(input.user.password, passwordHash);
            if (!isValidPassword) {
                // Incrementar intentos fallidos en DB
                await this.modeUser.incrementFailedAttemptsDB({ id: userId });
                const newAttempts = await this.modeUser.getFailedAttemptsDB({ id: userId });
                if (newAttempts >= 15) {
                    throw new Error("Cuenta bloqueada por demasiados intentos fallidos. Contacte al administrador.");
                }
                throw new Error(`Password incorrecto. Intentos restantes: ${15 - newAttempts}`);
            }
            // Resetear intentos en login exitoso
            await this.modeUser.resetFailedAttemptsDB({ id: userId });
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                throw new Error("JWT_SECRET not found");
            }
            const encoder = new TextEncoder();
            const key = await crypto.subtle.importKey("raw", encoder.encode(jwtSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
            const token = await new SignJWT({
                id: userOriginal.persona_id,
                email: userOriginal.email,
                rol: userOriginal.rol,
                permisos: userOriginal.permisos.map((permiso) => permiso.toUpperCase()),
                legajo: userOriginal.legajo,
                exa: userOriginal.exa,
            })
                .setProtectedHeader({ alg: JWT_ALGORITHM, typ: "JWT" })
                .setExpirationTime("6h")
                .setIssuedAt()
                .sign(key);
            return {
                token,
                user: {
                    id: userOriginal.persona_id,
                    email: userOriginal.email,
                    nombre: userOriginal.nombre,
                    apellido: userOriginal.apellido,
                    exa: userOriginal.exa,
                    legajo: userOriginal.legajo,
                    rol: userOriginal.rol,
                    permisos: userOriginal.permisos.map((permiso) => permiso.toUpperCase()),
                    celula: userOriginal.celula,
                    pais_venta: null, // Se填充á después con el valor real
                },
            };
        }
        catch (error) {
            logger.error("Login:", error);
            throw error;
        }
    }
    async register(input) {
        try {
            if (!input || !input.user) {
                throw new Error("Datos de usuario no proporcionados");
            }
            const user = input.user;
            if (!user.password_hash || user.password_hash.length < 6) {
                throw new Error("Password inválido (mínimo 6 caracteres)");
            }
            // Validar unicidad
            const existingUserByLegajo = await this.modeUser.getByLegajo({
                legajo: user.legajo,
            });
            const existingUserByEmail = await this.modeUser.getByEmail({
                email: user.email.toLowerCase(),
            });
            const existingUserByExa = await this.modeUser.getByExa({
                exa: user.exa,
            });
            if (existingUserByLegajo) {
                throw new Error(`El legajo ${user.legajo} ya está registrado`);
            }
            if (existingUserByEmail) {
                throw new Error(`El email ${user.email} ya está registrado`);
            }
            if (existingUserByExa) {
                throw new Error(`El código EXA ${user.exa} ya está registrado`);
            }
            const hashedPassword = await CryptoService.hashPassword(user.password_hash);
            const personaData = {
                nombre: user.nombre,
                apellido: user.apellido,
                fecha_nacimiento: user.fecha_nacimiento,
                documento: user.documento,
                email: user.email.toLowerCase(),
                telefono: user.telefono,
                tipo_documento: user.tipo_documento,
                nacionalidad: user.nacionalidad,
                genero: user.genero,
            };
            const usuarioData = {
                legajo: user.legajo,
                rol: user.rol,
                permisos: user.permisos.map((permiso) => permiso.toUpperCase()),
                exa: user.exa,
                password_hash: hashedPassword,
                celula: user.celula, // ✅ ACTUALIZADO
                estado: user.estado ?? "ACTIVO",
            };
            const createdUser = await this.modeUser.add({
                input: { ...personaData, ...usuarioData },
            });
            if (!createdUser || !createdUser.persona_id) {
                throw new Error("Error al crear el usuario - ID no generado");
            }
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                throw new Error("JWT_SECRET not found");
            }
            const encoder = new TextEncoder();
            const key = await crypto.subtle.importKey("raw", encoder.encode(jwtSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
            const token = await new SignJWT({
                id: createdUser.persona_id,
                email: createdUser.email,
                rol: createdUser.rol,
                permisos: createdUser.permisos.map((permiso) => permiso.toUpperCase()),
                legajo: createdUser.legajo,
                exa: createdUser.exa,
            })
                .setProtectedHeader({ alg: JWT_ALGORITHM, typ: "JWT" })
                .setExpirationTime("6h")
                .setIssuedAt()
                .sign(key);
            return token;
        }
        catch (error) {
            logger.error("Register Service:", error);
            throw error;
        }
    }
    async getPasswordHistory(userId) {
        try {
            const passwordHistory = await this.modeUser.getPasswordHistory({
                id: userId,
            });
            return passwordHistory;
        }
        catch (error) {
            logger.error("Get Password History:", error);
            throw error;
        }
    }
    async verifyToken(token) {
        try {
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                throw new Error("JWT_SECRET not found");
            }
            const encoder = new TextEncoder();
            const key = await crypto.subtle.importKey("raw", encoder.encode(jwtSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
            const { payload } = await jwtVerify(token, key);
            return payload;
        }
        catch (error) {
            logger.error("Token verification:", error);
            throw new Error("Token inválido");
        }
    }
    async refreshToken(oldToken) {
        try {
            const payload = await this.verifyToken(oldToken);
            const user = await this.modeUser.getByEmail({
                email: payload.email.toLowerCase(),
            });
            if (!user) {
                throw new Error("Usuario no encontrado");
            }
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                throw new Error("JWT_SECRET not found");
            }
            const encoder = new TextEncoder();
            const key = await crypto.subtle.importKey("raw", encoder.encode(jwtSecret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
            const newToken = await new SignJWT({
                id: user.persona_id,
                email: user.email,
                rol: user.rol,
                permisos: user.permisos.map((permiso) => permiso.toUpperCase()),
                legajo: user.legajo,
                exa: user.exa,
            })
                .setProtectedHeader({ alg: JWT_ALGORITHM, typ: "JWT" })
                .setExpirationTime("6h")
                .setIssuedAt()
                .sign(key);
            return newToken;
        }
        catch (error) {
            logger.error("Refresh token:", error);
            throw error;
        }
    }
    async changePassword(params) {
        try {
            const { targetUserId, authenticatedUserId, authenticatedUserRole, passwordData, } = params;
            const targetUser = await this.modeUser.getById({ id: targetUserId });
            if (!targetUser) {
                throw new Error(`Usuario con ID ${targetUserId} no encontrado`);
            }
            const isSelfChange = authenticatedUserId === targetUserId;
            // ✅ ACTUALIZADO: Solo BACK_OFFICE tiene permisos de admin
            const isAdmin = authenticatedUserRole === "BACK_OFFICE";
            if (!isSelfChange && !isAdmin) {
                throw new Error("No tienes permisos para cambiar la contraseña de otro usuario");
            }
            if (isSelfChange) {
                if (!("passwordActual" in passwordData)) {
                    throw new Error("Contraseña actual requerida");
                }
                const currentPasswordHash = await this.modeUser.getPasswordHash({
                    id: targetUserId,
                });
                if (!currentPasswordHash) {
                    throw new Error("Error al obtener contraseña actual");
                }
                const isCurrentPasswordValid = await CryptoService.verifyPassword(passwordData.passwordActual, currentPasswordHash);
                if (!isCurrentPasswordValid) {
                    throw new Error("La contraseña actual es incorrecta");
                }
            }
            if (isSelfChange && "passwordActual" in passwordData) {
                if (passwordData.passwordActual === passwordData.passwordNueva) {
                    throw new Error("La nueva contraseña debe ser diferente a la contraseña actual");
                }
            }
            const newPasswordHash = await CryptoService.hashPassword(passwordData.passwordNueva);
            const isUsed = await this.modeUser.isPasswordUsedBefore({
                id: targetUserId,
                passwordHash: newPasswordHash,
            });
            if (isUsed) {
                throw new Error("La nueva contraseña no puede ser igual a una contraseña anterior");
            }
            const updated = await this.modeUser.updatePassword({
                id: targetUserId,
                newPasswordHash,
            });
            if (!updated) {
                throw new Error("Error al actualizar la contraseña");
            }
            logger.info(`Contraseña actualizada exitosamente para usuario: ${targetUser.email}`);
        }
        catch (error) {
            logger.error("AuthService.changePassword:", error);
            throw error;
        }
    }
}
//# sourceMappingURL=AuthService.js.map