import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar token JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores comunes
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si el token expira o es inválido en una ruta protegida
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/registro')) {
        // Opcional: auto-logout si falla auth
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
