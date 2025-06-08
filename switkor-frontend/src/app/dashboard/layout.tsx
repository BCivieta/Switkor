'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/auth-store'; // Ajusta la ruta si es distinta
import { jwtDecode } from 'jwt-decode';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.replace('/login');
      return;
    }

    try {
      const decoded = jwtDecode<{ exp: number }>(token);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (isExpired) {
        logout();
        router.replace('/login');
        return;
      }
    } catch {
      logout();
      router.replace('/login');
      return;
    }

    setLoading(false);
  }, [token, logout, router]);

  if (loading) return null;

  return <>{children}</>;
}

