// services/api.ts
// Configuración base y cliente HTTP para la API
// ✅ OPTIMIZADO: Las cookies httpOnly se envían automáticamente con credentials: 'include'

const API_URL = import.meta.env.VITE_API_URL || 'https://system-back-office.sanchez-santiago.deno.net/';
const TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  payload?: T;
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

// Función para intentar refresh token
async function tryRefreshToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/usuario/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
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
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  };
  
  // Timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || TIMEOUT);
  config.signal = controller.signal;
  
  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    
    console.log('[API REQUEST]', { 
      url, 
      method: config.method, 
      status: response.status,
      statusText: response.statusText 
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('401:Token inválido o expirado');
      }
      
      const errorData = await response.json().catch(() => ({}));
      console.log('[API ERROR RESPONSE]', { url, status: response.status, errorData });
      const errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
    const data: ApiResponse<T> = await response.json();
    console.log('[API SUCCESS]', { url, status: response.status, data });
    return data;
  } catch (error) {
    console.log('[API CATCH ERROR]', { url, error: error?.message });
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
