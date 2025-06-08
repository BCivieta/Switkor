'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/store/auth-store';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const planSchema = z.object({
  sex: z.enum(['male', 'female'], { required_error: 'Elige un sexo' }),
  level: z.enum(['beginner', 'intermediate', 'advanced'], { required_error: 'Elige un nivel' }),
  goal: z.enum(['muscle_gain', 'strength', 'health'], { required_error: 'Elige un objetivo' }),
  daysPerWeek: z.enum(['3', '4', '5'], { required_error: 'Selecciona los días' }),
});

type PlanFormData = z.infer<typeof planSchema>;

export default function CreatePlanPage() {
  const token = useAuthStore((state) => state.token);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
  });

  const onSubmit = async (data: PlanFormData) => {
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/plan/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...data, daysPerWeek: Number(data.daysPerWeek) }),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success('¡Plan creado correctamente! 🎉');

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch {
      setError('Error al crear el plan. Intenta nuevamente.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-white">
      <header className="flex items-center px-6 pt-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-200"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver
        </Link>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-6">
        <div className="flex justify-center">
          <Image
            src="/LogoSinFondo.png"
            alt="Switkor"
            width={200}
            height={120}
            priority
          />
        </div>

        <p className="mb-6 text-center text-base sm:text-lg font-semibold text-sky-900">
          Crea tu nuevo plan de entrenamiento personalizado.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-lg"
        >
          <h2 className="text-lg sm:text-2xl font-bold text-sky-900">Formulario de Plan</h2>

          {/* Sexo */}
          <div>
            <label className="mb-1 block text-sm font-medium">Sexo:</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" value="male" {...register('sex')} />
                Hombre
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" value="female" {...register('sex')} />
                Mujer
              </label>
            </div>
            {errors.sex && <p className="text-sm text-red-600">{errors.sex.message}</p>}
          </div>

          {/* Nivel */}
          <div>
            <label className="mb-1 block text-sm font-medium">Nivel:</label>
            <div className="flex gap-4 flex-wrap">
              <label><input type="radio" value="beginner" {...register('level')} /> Principiante</label>
              <label><input type="radio" value="intermediate" {...register('level')} /> Intermedio</label>
              <label><input type="radio" value="advanced" {...register('level')} /> Avanzado</label>
            </div>
            {errors.level && <p className="text-sm text-red-600">{errors.level.message}</p>}
          </div>

          {/* Objetivo */}
          <div>
            <label className="mb-1 block text-sm font-medium">Objetivo:</label>
            <div className="flex gap-4 flex-wrap">
              <label><input type="radio" value="muscle_gain" {...register('goal')} /> Hipertrofia</label>
              <label><input type="radio" value="strength" {...register('goal')} /> Fuerza</label>
              <label><input type="radio" value="health" {...register('goal')} /> Salud</label>
            </div>
            {errors.goal && <p className="text-sm text-red-600">{errors.goal.message}</p>}
          </div>

          {/* Días por semana */}
          <div>
            <label className="mb-1 block text-sm font-medium">Días por semana:</label>
            <select
              className="w-full rounded-xl bg-gray-100 p-2 shadow-inner focus:ring-2 focus:ring-sky-500"
              {...register('daysPerWeek')}
              defaultValue=""
            >
              <option value="" disabled>Selecciona días</option>
              <option value="3">3 días</option>
              <option value="4">4 días</option>
              <option value="5">5 días</option>
            </select>
            {errors.daysPerWeek && <p className="text-sm text-red-600">{errors.daysPerWeek.message}</p>}
          </div>

          {/* Mensajes de error */}
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          {/* Botón */}
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-500 py-2 sm:py-3 text-sm sm:text-lg font-semibold text-white shadow hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            Crear Plan
          </button>
        </form>
      </main>

      <footer className="mt-12 bg-sky-900 py-4 text-center text-sm text-white">
        <div className="space-x-4">
          <Link href="#" className="underline">Política de privacidad</Link>
          <Link href="#" className="underline">Cookies</Link>
        </div>
        <p className="mt-2">© 2025 Switkor</p>
      </footer>
    </div>
  );
}
