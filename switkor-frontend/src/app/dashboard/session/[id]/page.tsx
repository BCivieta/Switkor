'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

interface Exercise {
  block: string;
  sets: number;
  reps: string;
  exercise: {
    name: string;
  };
}

interface Session {
  id: number;
  date: string;
  dayOfWeek: string;
  sessionType: string;
  focus: string;
  exercises: Exercise[];
}

export default function SessionPage() {
  const { id } = useParams();
  const token = useAuthStore((state) => state.token);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get<Session>(`/session/${String(id)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSession(res.data);
      } catch (error) {
        console.error('Error al cargar la sesión:', error);
      }
    };

    if (typeof id === 'string' && token) fetchSession();
  }, [id, token]);

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center text-sky-900 font-medium">
        Cargando sesión...
      </div>
    );
  }

  const groupedExercises = session.exercises.reduce<Record<string, Exercise[]>>((acc, exercise) => {
    if (!acc[exercise.block]) acc[exercise.block] = [];
    acc[exercise.block].push(exercise);
    return acc;
  }, {});

  const blockTitles: Record<string, string> = {
    warmup: 'Bloque 1 - Activación 🔥',
    main: 'Bloque 2 - Principal 🐅',
    accessory: 'Bloque 3 - Complementario ⚡',
    core: 'Core 💪',
    hiit: 'HIIT 🚀',
  };

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-center text-sky-900 mb-4">
        {session.dayOfWeek} - {new Date(session.date).toLocaleDateString()}
      </h1>
      <div className="flex justify-center gap-2 mb-6">
        <span className="px-4 py-1 bg-rose-100 text-rose-600 font-medium rounded-full text-sm">
          {session.sessionType}
        </span>
        <span className="px-4 py-1 bg-indigo-100 text-indigo-600 font-medium rounded-full text-sm">
          {session.focus}
        </span>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedExercises).map(([block, exercises]) => (
          <div
            key={block}
            className="bg-emerald-50 border border-emerald-100 rounded-3xl shadow p-6"
          >
            <h2 className="text-lg font-semibold text-emerald-800 mb-4">
              {blockTitles[block] || block}
            </h2>
            <ul className="space-y-2">
              {exercises.map((ex, index) => (
                <li key={index} className="flex justify-between items-center text-sm">
                  <span>🔹 {ex.exercise.name}</span>
                  <span className="font-medium">
                    {ex.sets}x{ex.reps}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
