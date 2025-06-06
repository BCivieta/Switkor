'use client';

import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';

interface RegisterDto {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterDto>();
  const [error, setError] = useState('');
  const router = useRouter();

  const onSubmit = async (data: RegisterDto) => {
    if (data.password !== data.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        email: data.email,
        name: data.name,
        password: data.password,
      });
      toast.success('¡Registro exitoso! Ahora puedes iniciar sesión');
      router.push('/login');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      setError(axiosErr.response?.data?.message ?? 'Error inesperado');
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-white">
      {/* ---------- Barra superior ---------- */}
      <header className="flex items-center px-6 pt-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-200"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Inicio
        </Link>
      </header>

      {/* ---------- Contenido principal ---------- */}
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

        <p className="mb-8 text-center text-base sm:text-lg font-semibold text-sky-900">
          Crea tu cuenta y empieza con tu planificación personalizada.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-lg"
        >
          <h2 className="text-lg sm:text-2xl font-bold text-sky-900">Registrarse</h2>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm sm:text-base font-medium">
              Correo electrónico:
            </label>
            <input
              id="email"
              type="email"
              placeholder="nombre@mail.com"
              className="w-full rounded-xl border-none bg-gray-100 px-3 py-2 sm:px-4 sm:py-3 shadow-inner focus:ring-2 focus:ring-sky-500 
              text-sm sm:text-base placeholder:text-xs sm:placeholder:text-sm"
              {...register('email', { required: true })}
            />
          </div>

          <div>
            <label htmlFor="name" className="mb-1 block text-sm sm:text-base font-medium">
              Nombre de usuario:
            </label>
            <input
              id="name"
              type="text"
              placeholder="Blanca"
              className="w-full rounded-xl border-none bg-gray-100 px-3 py-2 sm:px-4 sm:py-3 shadow-inner focus:ring-2 focus:ring-sky-500
               text-sm sm:text-base placeholder:text-xs sm:placeholder:text-sm"
              {...register('name', { required: true })}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm sm:text-base font-medium">
              Contraseña:
            </label>
            <input
              id="password"
              type="password"
              placeholder="123456B."
              className="w-full rounded-xl border-none bg-gray-100 px-3 py-2 sm:px-4 sm:py-3 shadow-inner focus:ring-2 focus:ring-sky-500
               text-sm sm:text-base placeholder:text-xs sm:placeholder:text-sm"
              {...register('password', { required: true })}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm sm:text-base font-medium">
              Repite la contraseña:
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="123456B."
              className="w-full rounded-xl border-none bg-gray-100 px-3 py-2 sm:px-4 sm:py-3 shadow-inner focus:ring-2 focus:ring-sky-500
               text-sm sm:text-base placeholder:text-xs sm:placeholder:text-sm"
              {...register('confirmPassword', { required: true })}
            />
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <input
              type="checkbox"
              {...register('termsAccepted', { required: true })}
              className="h-4 w-4 rounded border-gray-300 text-sky-600 accent-sky-600"
            />
            <span>Acepto la política de privacidad y cookies</span>
          </div>
          {errors.termsAccepted && (
            <p className="text-red-600 text-xs sm:text-sm mt-1">
              Debes aceptar la política de privacidad.
            </p>
          )}

          {error && (
            <span className="block text-xs sm:text-sm font-medium text-red-600">{error}</span>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-500 py-2 sm:py-3 text-sm sm:text-lg font-semibold text-white shadow hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            Crear cuenta
          </button>
        </form>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="mt-12 bg-sky-900 py-4 text-center text-sm text-white">
        <div className="space-x-4">
          <Link href="#" className="underline">
            Política de privacidad
          </Link>
          <Link href="#" className="underline">
            Cookies
          </Link>
        </div>
        <p className="mt-2">© 2025 Switkor</p>
      </footer>
    </div>
  );
}
