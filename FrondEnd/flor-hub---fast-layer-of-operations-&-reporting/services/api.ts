// services/api.ts
// Configuración base y cliente HTTP para la API

const API_URL = import.meta.env.VITE_API_URL || 'https://system-back-office.sanchez-santiago.deno.net/';
const TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');

interface ApiResponse<T> {
  success: boolean;
  data?: T;
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
  try {
    const response = await fetch(`${API_URL}/usuario/refresh`, {
      method: 'POST',
      credentials: 'include', // Enviar cookies automáticamente
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.success || false;
    }
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
}

// Cliente HTTP genérico
async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;
  const token = getCookie('token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
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
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    
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
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('La solicitud tardó demasiado tiempo');
      }
      throw error;
    }
    
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
