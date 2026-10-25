import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

export interface ExpositorData {
  ci: string;
  nombre: string;
  paterno?: string;
  materno?: string;
  correo?: string;
  telefono?: string;
}

export interface User {
  idUsuario: number;
  correo: string;
  rol: 'ADMIN' | 'USUARIO';
  estado: 'ACTIVO' | 'INACTIVO';
  esExpositor: boolean;
  ciExpositor?: string | null;
  expositor?: ExpositorData | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isExpositor: boolean;
  login: (correo: string, password: string) => Promise<void>;
  register: (correo: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiClient.get('/me');
      setUser(res.data);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (correo: string, password: string) => {
    const res = await apiClient.post('/auth/login', { correo, password });
    const { accessToken, user: userData } = res.data;
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    setUser(userData);
  };

  const register = async (correo: string, password: string) => {
    await apiClient.post('/auth/register', { correo, password });
    // Tras registrarse con éxito, hacer login automático
    await login(correo, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.rol === 'ADMIN';
  const isExpositor = !!user?.esExpositor || !!user?.ciExpositor;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        isExpositor,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
