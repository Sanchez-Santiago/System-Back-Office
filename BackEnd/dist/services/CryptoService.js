/**
 * Servicio de Criptografía Nativo con Web Crypto API
 * Reemplaza bcrypt para ser compatible con Deno Deploy
 * Utiliza PBKDF2 con SHA-256 para hashing seguro de contraseñas
 */
export class CryptoService {
    static ALGORITHM = "PBKDF2";
    static HASH = "SHA-256";
    static ITERATIONS = 100000;
    static SALT_LENGTH = 32;
    static KEY_LENGTH = 64;
    /**
     * Genera un hash seguro para la contraseña utilizando PBKDF2
     * @param password Contraseña en texto plano
     * @returns Hash formateado en base64 con salt incluida
     */
    static async hashPassword(password) {
        try {
            // Generar salt aleatorio
            const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
            const encoder = new TextEncoder();
            // Importar la contraseña como clave
            const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
            // Crear ArrayBuffer para el salt
            const saltBuffer = new ArrayBuffer(salt.length);
            const saltView = new Uint8Array(saltBuffer);
            saltView.set(salt);
            // Derivar bits usando PBKDF2
            const derivedBits = await crypto.subtle.deriveBits({
                name: 'PBKDF2',
                salt: saltView,
                iterations: this.ITERATIONS,
                hash: 'SHA-256',
            }, key, this.KEY_LENGTH * 8);
            const hashArray = new Uint8Array(derivedBits);
            return this.formatHash(salt, hashArray);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Error al generar hash de contraseña: ${errorMessage}`);
        }
    }
    /**
     * Verifica si una contraseña coincide con el hash almacenado
     * @param password Contraseña en texto plano a verificar
     * @param storedHash Hash almacenado en la base de datos
     * @returns true si la contraseña es válida, false en caso contrario
     */
    static async verifyPassword(password, storedHash) {
        try {
            if (!storedHash || storedHash.length < 50) {
                throw new Error("Hash almacenado inválido");
            }
            // Extraer salt y hash del formato almacenado
            const { salt, hash: storedHashArray } = this.parseHash(storedHash);
            const encoder = new TextEncoder();
            // Importar contraseña proporcionada
            const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
            // Crear ArrayBuffer para el salt
            const saltBuffer = new ArrayBuffer(salt.length);
            const saltView = new Uint8Array(saltBuffer);
            saltView.set(salt);
            // Deriver hash con el mismo salt
            const computedDerivedBits = await crypto.subtle.deriveBits({
                name: 'PBKDF2',
                salt: saltView,
                iterations: this.ITERATIONS,
                hash: 'SHA-256',
            }, key, this.KEY_LENGTH * 8);
            const computedHash = new Uint8Array(computedDerivedBits);
            // Comparar hashes en tiempo constante para prevenir timing attacks
            return this.constantTimeCompare(computedHash, storedHashArray);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Error verificando contraseña: ${errorMessage}`);
            return false;
        }
    }
    /**
     * Formatea el hash y salt para almacenamiento en base de datos
     * Formato: base64(salt):base64(hash)
     */
    static formatHash(salt, hash) {
        const saltBase64 = btoa(String.fromCharCode(...salt));
        const hashBase64 = btoa(String.fromCharCode(...hash));
        return `${saltBase64}:${hashBase64}`;
    }
    /**
     * Parsea el hash almacenado para extraer salt y hash
     */
    static parseHash(storedHash) {
        const [saltBase64, hashBase64] = storedHash.split(':');
        if (!saltBase64 || !hashBase64) {
            throw new Error("Formato de hash inválido");
        }
        const salt = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));
        const hash = Uint8Array.from(atob(hashBase64), c => c.charCodeAt(0));
        return { salt, hash };
    }
    /**
     * Comparación en tiempo constante para prevenir timing attacks
     */
    static constantTimeCompare(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        let result = 0;
        for (let i = 0; i < a.length; i++) {
            result |= a[i] ^ b[i];
        }
        return result === 0;
    }
    /**
     * Genera un token seguro para recuperación de contraseñas
     */
    static generateSecureToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array));
    }
    /**
     * Verifica la fortaleza de una contraseña
     */
    static validatePasswordStrength(password) {
        const errors = [];
        if (password.length < 8) {
            errors.push("La contraseña debe tener al menos 8 caracteres");
        }
        if (password.length > 100) {
            errors.push("La contraseña no puede tener más de 100 caracteres");
        }
        if (!/[A-Z]/.test(password)) {
            errors.push("La contraseña debe contener al menos una mayúscula");
        }
        if (!/[a-z]/.test(password)) {
            errors.push("La contraseña debe contener al menos una minúscula");
        }
        if (!/\d/.test(password)) {
            errors.push("La contraseña debe contener al menos un número");
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push("La contraseña debe contener al menos un carácter especial");
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
//# sourceMappingURL=CryptoService.js.map