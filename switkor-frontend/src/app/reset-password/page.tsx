'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';

type FormData = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  if (!token) {
    return (
      <main className="max-w-md mx-auto px-4 py-12 text-gray-800 text-center">
        <p className="text-red-600 font-semibold">
          Token inválido o ausente en la URL.
        </p>
      </main>
    );
  }

  const onSubmit = async (data: FormData) => {
    setMessage('');
    setError('');
    if (data.password !== data.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: data.password,
      });
      setMessage('Contraseña cambiada correctamente. Ya puedes iniciar sesión.');
      setTimeout(() => router.push('/login'), 3000);
    } catch {
      setError('Error al cambiar la contraseña. El enlace puede ser inválido o haber expirado.');
    } finally {
      setLoading(false);
    }
  };

  const passwordValue = watch('password', '');

  return (
    <main className="max-w-md mx-auto px-4 py-12 text-gray-800">
      <h1 className="text-2xl font-bold mb-6 text-center">Restablecer contraseña</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Nueva contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password', {
              required: 'La contraseña es obligatoria',
              pattern: {
                value: /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
                message:
                  'Debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo',
              },
            })}
            className={`mt-1 w-full rounded border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${
              errors.password
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-sky-500 focus:ring-sky-500'
            }`}
          />
          {errors.password && (
            <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium">
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword', {
              required: 'Confirma tu contraseña',
              validate: (value) =>
                value === passwordValue || 'Las contraseñas no coinciden',
            })}
            className={`mt-1 w-full rounded border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 ${
              errors.confirmPassword
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-sky-500 focus:ring-sky-500'
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-red-600 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-sky-900 px-4 py-2 text-white font-semibold hover:bg-sky-800 disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Cambiar contraseña'}
        </button>
      </form>

      {message && <p className="mt-4 text-green-600 text-sm text-center">{message}</p>}
      {error && <p className="mt-4 text-red-600 text-sm text-center">{error}</p>}
    </main>
  );
}

