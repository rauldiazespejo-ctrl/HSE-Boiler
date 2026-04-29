import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

interface User {
  id: number | string;
  nombre: string;
  email: string;
  rol: string;
  empresa_id?: number | null;
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@hse_token');
      const storedUser = await AsyncStorage.getItem('@hse_user');

      if (storedToken && storedUser) {
        api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
        const parsedUser = JSON.parse(storedUser);
        try {
          const meResponse = await api.get('/auth/me');
          if (meResponse.data?.success) {
            const meUser = meResponse.data.usuario;
            const normalizedUser = {
              id: meUser.id_usuario ?? parsedUser.id,
              nombre: meUser.nombre ?? parsedUser.nombre,
              email: meUser.email ?? parsedUser.email,
              rol: meUser.rol ?? parsedUser.rol,
              empresa_id: meUser.empresa_id ?? parsedUser.empresa_id ?? null,
            };
            setUser(normalizedUser);
            await AsyncStorage.setItem('@hse_user', JSON.stringify(normalizedUser));
            return;
          }
        } catch {
          await AsyncStorage.removeItem('@hse_token');
          await AsyncStorage.removeItem('@hse_user');
          delete api.defaults.headers.common.Authorization;
          setUser(null);
          return;
        }
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Failed to load storage data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string, userData: User) => {
    try {
      await AsyncStorage.setItem('@hse_token', token);
      await AsyncStorage.setItem('@hse_user', JSON.stringify(userData));
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser(userData);
    } catch (error) {
      console.error('Failed to save login data', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@hse_token');
      await AsyncStorage.removeItem('@hse_user');
      delete api.defaults.headers.common.Authorization;
      setUser(null);
    } catch (error) {
      console.error('Failed to clear storage on logout', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
