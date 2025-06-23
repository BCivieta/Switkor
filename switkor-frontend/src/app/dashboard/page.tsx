"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { PlusIcon, LogOutIcon } from "lucide-react";
import { api } from "@/lib/api";
import CustomCalendar from "@/components/CustomCalendar";
import MobileMenu from "@/components/mobileMenu";
import TrainingHistoryChart from "@/components/TrainingHistoryChart";
import type { DashboardData } from "@/types/dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const username = useAuthStore((state) => state.name || "");

  const [sessionsByDate, setSessionsByDate] = useState<Record<
    string,
    {
      id: number;
      label: string;
      focus: string;
      sessionType: string;
      completed: boolean;
    }
  > | null>(null);

  const [nextSessionDate, setNextSessionDate] = useState<string | null>(null);
  const [nextSessionId, setNextSessionId] = useState<number | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [chartData, setChartData] = useState<
    { month: string; count: number }[]
  >([]);

  const formatDateKey = (date: Date) => date.toLocaleDateString("sv-SE"); // 'YYYY-MM-DD'

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) return;
        
        const res = await api.get<DashboardData>("/dashboard/data");
        const { allSessions, nextSession, streak, chartData } = res.data;

        const sessionsMap: Record<string, {
          id: number;
          label: string;
          focus: string;
          sessionType: string;
          completed: boolean;
        }> = {};

        allSessions.forEach((session) => {
          const key = formatDateKey(new Date(session.date));
          sessionsMap[key] = {
            id: session.id,
            label: `Semana ${session.weekNumber}`,
            focus: session.focus,
            sessionType: session.sessionType,
            completed: session.completed,
          };
        });

        setSessionsByDate(sessionsMap);

        if (nextSession) {
          setNextSessionDate(nextSession.date);
          setNextSessionId(nextSession.id);
        } else {
          setNextSessionDate(null);
          setNextSessionId(null);
        }

        setStreak(streak);
        setChartData(chartData);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };
        
    fetchData();
  }, [token]);
  // Si aún estamos esperando la respuesta, mostramos un loader
  if (sessionsByDate === null) {
    return (
      <main className="flex items-center justify-center h-screen">
        <p className="text-lg text-sky-900">Cargando tu plan…</p>
      </main>
    );
  }
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleDayClick = (value: Date) => {
    const key = formatDateKey(value);
    const sessionInfo = sessionsByDate[key];
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
          <span className=" text-2xl sm:text-3xl font-bold text-[#1A3F4E]">
            Switkor
          </span>
        </div>
        {/* Menú desktop */}
        <nav className="hidden lg:flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-emerald-600">
            Inicio
          </Link>
          <Link
            href="/dashboard/form"
            className="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold px-4 py-2 rounded-full hover:to-emerald-700 transition-all duration-200 flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" /> Nuevo plan
          </Link>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:underline flex items-center gap-1"
          >
            <LogOutIcon className="w-4 h-4" /> Cerrar sesión
          </button>
        </nav>

        {/* MobileMenu - Reutilizable */}
        <div className="lg:hidden">
          <MobileMenu
            links={[
              { label: "Inicio", href: "/" },
              { label: "Nuevo plan", href: "/dashboard/form" },
            ]}
            actions={[{ label: "Cerrar sesión", href: "#", isPrimary: false }]}
          />
        </div>
      </header>
      {/* Bienvenida + Calendario */}
      <section className="px-4 sm:px-8 mt-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-sky-900 mb-4">
          Hola {username} ¡Vamos a por un nuevo entreno!
        </h2>

        {nextSessionDate && nextSessionId && (
          <div className="text-center mt-6">
            <button
              onClick={() => router.push(`/dashboard/session/${nextSessionId}`)}
              className="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white px-6 py-3 rounded-full text-sm sm:text-base font-bold hover:to-emerald-700 transition-all duration-200"
            >
              Ir a mi próxima sesión ⚡
            </button>
          </div>
        )}
      </section>
      <section className="bg-gray-100 rounded-3xl py-6 px-2 sm:px-10 lg:px-16 xl:px-24 shadow-md mt-4 max-w-7xl mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-sky-900">
          Tu calendario de entrenamiento
        </h2>
        {sessionsByDate && Object.keys(sessionsByDate).length === 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mt-4 text-center text-base font-semibold mb-4">
            ⚠️ No tienes planes activos. Crea uno para comenzar.
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Calendario */}
          <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
            <CustomCalendar
              sessionsByDate={sessionsByDate}
              onClickDay={handleDayClick}
            />
          </div>

          {/* Racha y gráfica */}
          <div className="w-full max-w-[500px] flex flex-col items-center self-center">
            {streak > 1 && (
              <div className="mt-4 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-center text-base sm:text-lg w-full max-w-md">
                Llevas una racha de <strong>{streak}</strong> entrenamientos sin
                fallar. 🎉
              </div>
            )}
            <div className="mt-6 w-full">
              <TrainingHistoryChart data={chartData} />
            </div>
          </div>
        </div>
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
{
  /* para que solo aparezca cuando al menos llevas una
        {streak > 0 && (
        <div className="mt-4 …">
          Llevas una racha de <strong>{streak}</strong> entrenamientos sin fallar. 🎉
        </div>
        )} */
}
