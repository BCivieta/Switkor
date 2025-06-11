'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import Image from 'next/image';
//import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Exercise {
  id: number;
  block: 'warmup' | 'main' | 'accessory' | 'core' | 'hiit';
  reps: string;
  sets: number;
  exercise: {
    name: string;
    videoUrl?: string;
  };
}

interface Session {
  id: number;
  date: string;
  sessionType: string;
  exercises: Exercise[];
}

export default function SessionPage() {
  const [session, setSession] = useState<Session | null>(null);
  const token = useAuthStore((state) => state.token);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get('/plan/session/next'); // TODO: Cambiar por id de sesión si viene de la URL
        setSession(res.data);
      } catch (err) {
        console.error('Error al cargar la sesión:', err);
      }
    };

    if (token) fetchSession();
  }, [token]);

  const groupByBlock = (exercises: Exercise[]) => {
    return exercises.reduce((acc, ex) => {
      if (!acc[ex.block]) acc[ex.block] = [];
      acc[ex.block].push(ex);
      return acc;
    }, {} as Record<string, Exercise[]>);
  };

  if (!session) return <p className="text-center mt-20 text-gray-500">Cargando sesión...</p>;

  const blocks = groupByBlock(session.exercises);

  const descanso = session.sessionType === 'strength'
    ? 'Descanso: 2 minutos'
    : session.sessionType === 'muscle_gain'
    ? 'Descanso: 90 segundos'
    : 'Descanso: 30-40 segundos';

  return (
    <main className="min-h-screen bg-white px-4 py-6 text-gray-800">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 shadow hover:bg-gray-200"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Atrás
        </button>
        <Image src="/LogoSinFondo.png" alt="Switkor" width={100} height={60} />
      </header>

      {/* Info sesión */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-sky-900">¡Hoy es un buen día para entrenar!</h1>
        <p className="text-gray-600">No esperes a estar motivado, empieza y la motivación llegará</p>

        <div className="flex justify-center mt-4 gap-4 flex-wrap">
          <span className="border border-gray-300 rounded-full px-4 py-1 text-sm text-gray-700">
            {format(new Date(session.date), 'd-M-yyyy', { locale: es })}
          </span>
          <span className="bg-rose-100 text-rose-800 px-4 py-1 rounded-full text-sm">
            {session.sessionType === 'strength' ? 'Sesión de fuerza máxima' : session.sessionType === 'muscle_gain' ? 'Sesión de hipertrofia' : 'Sesión de salud'}
          </span>
          <span className="bg-indigo-100 text-indigo-800 px-4 py-1 rounded-full text-sm">
            Duración 1h
          </span>
          <span className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full text-sm">
            {descanso}
          </span>
        </div>
      </div>

      {/* Bloques */}
      <section className="space-y-8">
        {Object.entries(blocks).map(([block, exercises]) => (
          <div key={block} className="bg-emerald-50 p-6 rounded-3xl shadow-md">
            <h2 className="font-semibold mb-2">
              {block === 'warmup' && 'Bloque 1 - Activación 🔥'}
              {block === 'main' && 'Bloque 2 - Principal 🐐'}
              {block === 'accessory' && 'Bloque 3 - Complementario ⚡'}
              {block === 'core' && 'Bloque 4 - Core 💪'}
              {block === 'hiit' && 'Bloque 5 - HIIT 💥'}
            </h2>
            <ul className="space-y-2">
              {exercises.map((ex) => (
                <li key={ex.id} className="flex justify-between items-center border-b pb-2">
                  <span>{ex.exercise.name} x {ex.reps} ({ex.sets} series)</span>
                  {ex.exercise.videoUrl && (
                    <a
                      href={ex.exercise.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 text-sm hover:underline"
                    >
                      ▶ Ver video
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Evaluación (pendiente funcionalidad real) */}
      <div className="mt-10 border-t pt-6">
        <div className="mb-4 flex items-center gap-4">
          <label className="text-sm font-medium">Marcar como realizada:</label>
          <input type="checkbox" className="h-5 w-5 text-emerald-600 rounded" />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium">Valoración del esfuerzo:</label>
          <div className="flex gap-1">
            {[...Array(10)].map((_, i) => (
              <button key={i} className="w-8 h-8 rounded-full border text-sm hover:bg-emerald-100">
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
