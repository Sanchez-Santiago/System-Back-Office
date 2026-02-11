// services/api.ts
// Configuración base y cliente HTTP para la API

const API_URL = import.meta.env.VITE_API_URL || 'https://system-back-office.sanchez-santiago.deno.net/';
const TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  payload?: T;  // Para compatibilidad con /usuario/verify
  message?: string;
  errors?: { field: string; message: string }[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

interface RequestOptions extends RequestInit {
  timeout?: number;
}

// Función helper para obtener cookies
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Función para intentar refresh token
async function tryRefreshToken(): Promise<boolean> {
  console.log('🔄 [API DEBUG] Intentando refresh token');
  try {
    const response = await fetch(`${API_URL}/usuario/refresh`, {
      method: 'POST',
      credentials: 'include', // Enviar cookies automáticamente
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('🔄 [API DEBUG] Refresh status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('🔄 [API DEBUG] Refresh response:', data);
      return data.success || false;
    } else {
      console.error('🔄 [API DEBUG] Refresh failed with status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('🔄 [API DEBUG] Error refreshing token:', error);
    return false;
  }
}

// Cliente HTTP genérico
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const cleanBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${cleanBase}${cleanEndpoint}`;
  
  console.log('🔍 [API DEBUG] Petición:', { url, method: options.method || 'GET' });
  
  const token = getCookie('token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
    console.log('🔍 [API DEBUG] Token encontrado en headers:', token.substring(0, 20) + '...');
  }
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Importante para CORS con cookies
  };
  
  // Timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || TIMEOUT);
  config.signal = controller.signal;
  
  try {
    console.log('🔍 [API DEBUG] Headers de petición:', config.headers);
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    
    console.log('🔍 [API DEBUG] Status:', response.status);
    console.log('🔍 [API DEBUG] Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Verificar cookies en la respuesta
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      console.log('🔍 [API DEBUG] Set-Cookie header:', setCookieHeader);
    } else {
      console.log('🔍 [API DEBUG] No se recibió cookie en la respuesta');
    }
    
    if (!response.ok) {
      if (response.status === 401) {
        // Intentar refresh token automáticamente
        const refreshSuccess = await tryRefreshToken();
        
        if (refreshSuccess) {
          // Reintentar la request original con el nuevo token
          const newToken = getCookie('token');
          if (newToken) {
            defaultHeaders['Authorization'] = `Bearer ${newToken}`;
          }
          
          const retryConfig = {
            ...config,
            headers: {
              ...defaultHeaders,
              ...options.headers,
            },
          };
          
          const retryResponse = await fetch(url, retryConfig);
          
          if (retryResponse.ok) {
            return await retryResponse.json();
          }
        }
        
        // Refresh falló, limpiar y lanzar error
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
        
        // Leer el mensaje específico del backend
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Error de autenticación';
        throw new Error(errorMessage);
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    const data: ApiResponse<T> = await response.json();
    console.log('🔍 [API DEBUG] Response data:', data);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('🔍 [API DEBUG] Error en petición:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('🔍 [API DEBUG] Error: Timeout alcanzado');
        throw new Error('La solicitud tardó demasiado tiempo');
      }
      throw error;
    }
    
    console.error('🔍 [API DEBUG] Error desconocido:', error);
    throw new Error('Error desconocido en la solicitud');
  }
}

// Métodos HTTP helper
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, body: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      body: JSON.stringify(body) 
    }),
    
  put: <T>(endpoint: string, body: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: JSON.stringify(body) 
    }),
    
  patch: <T>(endpoint: string, body: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: JSON.stringify(body) 
    }),
    
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

export type { ApiResponse };
export { API_URL };
