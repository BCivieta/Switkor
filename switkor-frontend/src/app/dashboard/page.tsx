'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { PlusIcon, LogOutIcon, UserIcon } from 'lucide-react';
import { api } from '@/lib/api';
import CustomCalendar from '@/components/CustomCalendar';

interface Session {
  id: number;
  date: string;
  weekNumber: number;
  focus:string;
}

interface Plan {
  sessions?: Session[];
}

export default function DashboardPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const [sessionsByDate, setSessionsByDate] = useState<Record<string, { id: number; label: string; focus: string}>>({});
  const [nextSessionDate, setNextSessionDate] = useState<string | null>(null);
  const [nextSessionId, setNextSessionId] = useState<number | null>(null);


  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await api.get<Plan>('/plan/current');
        //debug
        console.log('Respuesta del backend:', res.data);
        //debug
        const plan = res.data;

        const sessionsMap: Record<string, { id: number; label: string; focus: string }> = {};
        plan.sessions?.forEach((session) => {
          const date = new Date(session.date).toISOString().split('T')[0];
          sessionsMap[date] = { id: session.id, label: `Semana ${session.weekNumber}`, focus: session.focus,};
        });

        setSessionsByDate(sessionsMap);

        const futureSession = plan.sessions?.find(
          (s) => new Date(s.date) >= new Date()
        );

        if (futureSession) {
          setNextSessionDate(new Date(futureSession.date).toISOString().split('T')[0]);
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
    const iso = value.toISOString().split('T')[0];
    const sessionInfo = sessionsByDate[iso];
    if (sessionInfo) {
    router.push(`/dashboard/session/${sessionInfo.id}`);
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 py-6 sm:px-8 lg:px-16 text-gray-800">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <Image src="/LogoSinFondo.png" alt="Switkor" width={50} height={50} />
          <h1 className="text-2xl font-bold text-[#1A3F4E]">Switkor</h1>
        </div>

        <nav className="flex gap-4 text-sm">
          <Link href="/dashboard" className="hover:underline text-emerald-600">Inicio</Link>
          <Link href="/dashboard/form" className="bg-emerald-500 text-white px-4 py-2 rounded-full hover:bg-emerald-600 flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> Nuevo plan
          </Link>
          <button onClick={() => router.push('/perfil')} className="flex items-center gap-1 text-sky-900 hover:underline">
            <UserIcon className="w-4 h-4" /> Perfil
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1 text-red-600 hover:underline">
            <LogOutIcon className="w-4 h-4" /> Cerrar sesión
          </button>
        </nav>
      </header>

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
    </main>
  );
}
