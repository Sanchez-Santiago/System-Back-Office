export const TOKEN_KEY = 'auth_token';

const getStorage = (): Storage => {
  try {
    if (localStorage.getItem('keepSession') === 'true') {
      return localStorage;
    }
  } catch {}
  return sessionStorage;
};

export const tokenStorage = {
  setToken: (token: string): void => {
    try {
      getStorage().setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error('Error guardando token:', e);
    }
  },

  getToken: (): string | null => {
    try {
      let token = sessionStorage.getItem(TOKEN_KEY);
      if (token) return token;
      token = localStorage.getItem(TOKEN_KEY);
      return token;
    } catch (e) {
      console.error('Error leyendo token:', e);
      return null;
    }
  },

  removeToken: (): void => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('keepSession');
    } catch (e) {
      console.error('Error eliminando token:', e);
    }
  },

  hasToken: (): boolean => {
    return !!tokenStorage.getToken();
  }
};
