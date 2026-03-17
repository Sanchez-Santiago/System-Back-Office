/**
 * Utilidades genéricas para pruebas de conexión
 * Proporciona funciones reutilizables para testear conectividad
 * con diferentes tipos de servicios y bases de datos
 */
export var ConnectionErrorType;
(function (ConnectionErrorType) {
    ConnectionErrorType["NETWORK"] = "NETWORK";
    ConnectionErrorType["AUTHENTICATION"] = "AUTHENTICATION";
    ConnectionErrorType["DATABASE_NOT_FOUND"] = "DATABASE_NOT_FOUND";
    ConnectionErrorType["TIMEOUT"] = "TIMEOUT";
    ConnectionErrorType["UNKNOWN"] = "UNKNOWN";
})(ConnectionErrorType || (ConnectionErrorType = {}));
/**
 * Realiza una prueba de conexión TCP a un host y puerto específicos
 */
export async function testTcpConnection(host, port, options = {}) {
    const startTime = Date.now();
    const { timeout = 5000, verbose = false } = options;
    try {
        if (verbose) {
            console.log(`🔍 Probando conexión TCP a ${host}:${port}`);
        }
        // Usar Deno.connect para prueba TCP
        const conn = await Deno.connect({
            hostname: host,
            port: port,
            transport: "tcp",
        });
        conn.close();
        const duration = Date.now() - startTime;
        return {
            success: true,
            message: `Conexión TCP exitosa a ${host}:${port}`,
            duration,
            timestamp: new Date().toISOString(),
            details: {
                host,
                port,
                protocol: "TCP"
            }
        };
    }
    catch (error) {
        const duration = Date.now() - startTime;
        const errorType = identifyErrorType(error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            success: false,
            message: `Error en conexión TCP a ${host}:${port}: ${errorMessage}`,
            error: error,
            duration,
            timestamp: new Date().toISOString(),
            details: {
                host,
                port,
                protocol: "TCP",
                errorType
            }
        };
    }
}
/**
 * Identifica el tipo de error basado en el mensaje de error
 */
export function identifyErrorType(error) {
    if (!(error instanceof Error)) {
        return ConnectionErrorType.UNKNOWN;
    }
    const message = error.message.toLowerCase();
    if (message.includes("connection refused") || message.includes("econnrefused")) {
        return ConnectionErrorType.NETWORK;
    }
    if (message.includes("timeout") || message.includes("etimedout")) {
        return ConnectionErrorType.TIMEOUT;
    }
    if (message.includes("access denied") || message.includes("authentication")) {
        return ConnectionErrorType.AUTHENTICATION;
    }
    if (message.includes("database") && message.includes("not found")) {
        return ConnectionErrorType.DATABASE_NOT_FOUND;
    }
    return ConnectionErrorType.UNKNOWN;
}
/**
 * Implementa retry con delay exponencial
 */
export async function retryWithBackoff(operation, options = {}) {
    const { retries = 3, retryDelay = 1000 } = options;
    let lastError;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (attempt === retries) {
                break;
            }
            const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
            console.log(`⚠️  Intento ${attempt} falló, reintentando en ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw lastError;
}
/**
 * Genera un mensaje de sugerencia basado en el tipo de error
 */
export function getSuggestionMessage(errorType) {
    switch (errorType) {
        case ConnectionErrorType.NETWORK:
            return "💡 Sugerencia: Verifica que el servidor esté corriendo y no haya firewall bloqueando el puerto";
        case ConnectionErrorType.TIMEOUT:
            return "💡 Sugerencia: La conexión es muy lenta, intenta aumentar el timeout o verifica la red";
        case ConnectionErrorType.AUTHENTICATION:
            return "💡 Sugerencia: Revisa las credenciales (usuario y contraseña) en las variables de entorno";
        case ConnectionErrorType.DATABASE_NOT_FOUND:
            return "💡 Sugerencia: Verifica que el nombre de la base de datos sea correcto y tengas acceso";
        default:
            return "💡 Sugerencia: Revisa la configuración de conexión y el estado del servidor";
    }
}
/**
 * Formatea el resultado de una prueba de conexión para logging
 */
export function formatConnectionTestResult(result) {
    const status = result.success ? "✅" : "❌";
    const duration = `${result.duration}ms`;
    let message = `${status} ${result.message} (${duration})`;
    if (!result.success && result.details?.errorType) {
        const suggestion = getSuggestionMessage(result.details.errorType);
        message += `\n${suggestion}`;
    }
    return message;
}
//# sourceMappingURL=connectionTester.js.map