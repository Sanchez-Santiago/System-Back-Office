/**
 * Servicio de Criptografía Nativo con Web Crypto API
 * Reemplaza bcrypt para ser compatible con Deno Deploy
 * Utiliza PBKDF2 con SHA-256 para hashing seguro de contraseñas
 */
export declare class CryptoService {
    private static readonly ALGORITHM;
    private static readonly HASH;
    private static readonly ITERATIONS;
    private static readonly SALT_LENGTH;
    private static readonly KEY_LENGTH;
    /**
     * Genera un hash seguro para la contraseña utilizando PBKDF2
     * @param password Contraseña en texto plano
     * @returns Hash formateado en base64 con salt incluida
     */
    static hashPassword(password: string): Promise<string>;
    /**
     * Verifica si una contraseña coincide con el hash almacenado
     * @param password Contraseña en texto plano a verificar
     * @param storedHash Hash almacenado en la base de datos
     * @returns true si la contraseña es válida, false en caso contrario
     */
    static verifyPassword(password: string, storedHash: string): Promise<boolean>;
    /**
     * Formatea el hash y salt para almacenamiento en base de datos
     * Formato: base64(salt):base64(hash)
     */
    private static formatHash;
    /**
     * Parsea el hash almacenado para extraer salt y hash
     */
    private static parseHash;
    /**
     * Comparación en tiempo constante para prevenir timing attacks
     */
    private static constantTimeCompare;
    /**
     * Genera un token seguro para recuperación de contraseñas
     */
    static generateSecureToken(): string;
    /**
     * Verifica la fortaleza de una contraseña
     */
    static validatePasswordStrength(password: string): {
        isValid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=CryptoService.d.ts.map