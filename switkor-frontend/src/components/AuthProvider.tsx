'use client';

import { useEffect, ReactNode} from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '../store/auth-store';
import type { JwtPayload } from '../types/auth';

interface Props {
  children: ReactNode;
}
export function AuthProvider({ children }: Props) {
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      setAuth({
        token,
        email: decoded.email,
        id: decoded.sub,
        name: decoded.name ?? '',
      });
    } catch {
      console.warn('Token inválido o expirado');
      localStorage.removeItem('token');
    }
  }, [setAuth]);

  return <>{children}</>;
}
