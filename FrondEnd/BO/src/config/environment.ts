interface EnvironmentConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  app: {
    name: string;
    version: string;
    isDevelopment: boolean;
    debugMode: boolean;
  };
  auth: {
    tokenKey: string;
    sessionTimeout: number;
  };
}

export const envConfig: EnvironmentConfig = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'BO-System',
    version: import.meta.env.VITE_APP_VERSION || '0.1.0',
    isDevelopment: import.meta.env.DEV,
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  },
  auth: {
    tokenKey: import.meta.env.VITE_TOKEN_STORAGE_KEY || 'auth_token',
    sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '3600000'),
  },
};