// src/app/forgot-password/page.tsx

'use client';

import { useState } from 'react';
import { api } from "@/lib/api";
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/request-password-reset', { email });
      setMessage('Si existe una cuenta con ese correo, se ha enviado un enlace para restablecer la contraseña.');
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al enviar la solicitud. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-12 text-gray-800">
      {/* Botón atrás */}
      <div className="mb-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-200"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver al inicio de sesión
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6 text-center">¿Has olvidado tu contraseña?</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Introduce tu correo electrónico
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-sky-900 px-4 py-2 text-white font-semibold hover:bg-sky-800 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
        </button>
      </form>

      {message && <p className="mt-4 text-green-600 text-sm text-center">{message}</p>}
      {error && <p className="mt-4 text-red-600 text-sm text-center">{error}</p>}
    </main>
  );
}
