import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const configuredApiUrl =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  '';
const fallbackApiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/v1' : 'http://localhost:3000/api/v1';
const API_URL = configuredApiUrl || fallbackApiUrl;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@hse_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error reading token from storage', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
