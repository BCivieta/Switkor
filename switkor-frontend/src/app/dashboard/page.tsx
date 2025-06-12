'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { PlusIcon, LogOutIcon } from 'lucide-react';
import { api } from '@/lib/api';
import CustomCalendar from '@/components/CustomCalendar';
import MobileMenu from '@/components/mobileMenu';

interface Session {
  id: number;
  date: string;
  weekNumber: number;
  focus:string;
  sessionType: string;
}

interface Plan {
  sessions?: Session[];
}

export default function DashboardPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const [sessionsByDate, setSessionsByDate] = useState<Record<string, { id: number; label: string; focus: string; sessionType: string}>>({});
  const [nextSessionDate, setNextSessionDate] = useState<string | null>(null);
  const [nextSessionId, setNextSessionId] = useState<number | null>(null);
  const formatDateKey = (date: Date) => date.toLocaleDateString('sv-SE'); // 'YYYY-MM-DD'
  const username = useAuthStore((state) => state.name || '');


  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await api.get<Plan>('/plan/current');
        //debug
        console.log('Respuesta del backend:', res.data);
        //debug
        const plan = res.data;

        const sessionsMap: Record<string, { id: number; label: string; focus: string,  sessionType: string }> = {};
        plan.sessions?.forEach((session) => {
          const date = formatDateKey(new Date(session.date));
          sessionsMap[date] = { id: session.id, label: `Semana ${session.weekNumber}`, focus: session.focus, sessionType: session.sessionType,};
        });

        setSessionsByDate(sessionsMap);

        const futureSession = plan.sessions?.find(
          (s) => new Date(s.date) >= new Date()
        );

        if (futureSession) {
          setNextSessionDate(formatDateKey(new Date(futureSession.date)));
          setNextSessionId(futureSession.id);
        }
      } catch (err) {
        console.error('Error al cargar el plan:', err);
      }
    };

    if (token) fetchPlan();
  }, [token]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleDayClick = (value: Date) => {
    const iso = formatDateKey(value);
    const sessionInfo = sessionsByDate[iso];
    if (sessionInfo) {
    router.push(`/dashboard/session/${sessionInfo.id}`);
    }
  };

  return (
    <main className="flex flex-col items-center text-gray-800">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-4 bg-white shadow-md sticky top-0 z-10">
          {/* Logo */}
        <div className="flex items-center gap-2">
            <Image
                src="/logoSinLetras.png"
            alt="Switkor"
            width={48}
            height={48}
            className="h-18 w-auto"
          />
          <span className=" text-2xl sm:text-3xl font-bold text-[#1A3F4E]">Switkor</span>
        </div>
        {/* Menú desktop */}
        <nav className="hidden lg:flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-emerald-600">Inicio</Link>
          <Link href="/dashboard/form" className="bg-emerald-500 text-white px-4 py-2 rounded-full hover:bg-emerald-600 flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> Nuevo plan
          </Link>
          <button onClick={handleLogout} className="text-red-600 hover:underline flex items-center gap-1">
            <LogOutIcon className="w-4 h-4" /> Cerrar sesión
          </button>
        </nav>

        {/* MobileMenu - Reutilizable */}
        <div className="lg:hidden">
          <MobileMenu
            links={[
              { label: 'Inicio', href: '/' },
              { label: 'Nuevo plan', href: '/dashboard/form' },
            ]}
            actions={[
              { label: 'Cerrar sesión', href: '#', isPrimary: false },
            ]}
          />
        </div>
      </header>
       {/* Bienvenida + Calendario */}
        <section className="px-4 sm:px-8 mt-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-sky-900 mb-4">
          Hola {username} ¡Vamos a por un nuevo entreno!
          </h2>

          {nextSessionDate &&  nextSessionId &&(
          <div className="text-center mt-6">
           <button
             onClick={() => router.push(`/dashboard/session/${nextSessionId}`)}
             className="bg-emerald-500 text-white px-6 py-3 rounded-full text-base font-medium hover:bg-emerald-600"
            >
             Ir a mi próxima sesión ⚡
            </button>
          </div>
          )}
        </section>

      <section className="bg-gray-50 rounded-3xl p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-sky-900">Tu calendario de entrenamiento</h2>

        <CustomCalendar
          sessionsByDate={sessionsByDate}
          onClickDay={handleDayClick}
        />

        {Object.keys(sessionsByDate).length === 0 && (
          <p className="mt-4 text-center text-gray-500">
            No tienes planes activos. Crea uno para comenzar.
          </p>
        )}
      </section>
      <div className="mt-4 mb-8 flex gap-6 justify-center text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-blue-100 border border-blue-400" />
          Entrenamiento
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-green-100 border border-green-400" />
          Recuperación
        </div>
      </div>

    </main>
  );
}
