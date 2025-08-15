//src/lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // Si más adelante se usan cookies httpOnly, cambio a true.
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
});

// Añade el token JWT a cada petición si existe
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = typeof window !== 'undefined'
    ? sessionStorage.getItem('token') || localStorage.getItem('token')
    : null;
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
