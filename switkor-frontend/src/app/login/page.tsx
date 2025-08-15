//switkor-frontend\src\app\login\page.tsx
"use client";

import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import type { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
import { useAuthStore } from "../../store/auth-store";
import type { LoginDto, JwtPayload } from "../../types/auth";

export default function LoginPage() {
  const { register, handleSubmit } = useForm<LoginDto>();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const onSubmit = async (data: LoginDto) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", data);
      const token = res.data.access_token;

      // Decodifica el token para extraer email, id y opcionalmente name
      const decoded = jwtDecode<JwtPayload>(token);

      // Guardar token según "Recuérdame"
      if (data.remember) {
        localStorage.setItem("token", token);
      } else {
        sessionStorage.setItem("token", token);
      }

      setAuth({
        token,
        email: decoded.email,
        id: decoded.sub,
        name: decoded.name ?? "",
      });

      router.push("/dashboard");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      setError(axiosErr.response?.data?.message ?? "Error inesperado");
    }finally {
    setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-white mx-0">
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
      <main className="mx-auto w-full max-w-lg flex-1 px-1">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/LogoSinFondo.png"
            alt="Switkor"
            width={200}
            height={120}
            priority
          />
        </div>

        {/* Claim */}
        <p className="mb-8 text-center text-base sm:text-lg font-semibold text-sky-900">
          Accede a tu cuenta y continúa tu planificación personalizada.
        </p>

        {/* Card de login */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 sm:p-10 shadow-lg"
        >
          <h2 className="text-lg sm:text-2xl font-bold text-sky-900">
            Iniciar sesión
          </h2>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm sm:text-base font-medium"
            >
              Usuario:
            </label>
            <input
              id="email"
              type="email"
              placeholder="nombre@mail.com"
              className="w-full rounded-xl border-none bg-gray-100 px-3 py-2 sm:px-4 sm:py-3 shadow-inner focus:ring-2 focus:ring-sky-500
              placeholder:text-xs sm:placeholder:text-sm  text-sm sm:text-base "
              {...register("email", { required: true })}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm sm:text-base font-medium"
            >
              Contraseña:
            </label>
            <input
              id="password"
              type="password"
              placeholder="Tu contraseña"
              className="w-full rounded-xl border-none bg-gray-100 px-3 py-2 sm:px-4 sm:py-3 shadow-inner focus:ring-2 focus:ring-sky-500 
              placeholder:text-xs sm:placeholder:text-sm  text-sm sm:text-base "
              {...register("password", { required: true })}
            />
          </div>

          {/* Recordarme + error */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs sm:text-sm">
              <input
                type="checkbox"
                {...register("remember")}
                className="h-4 w-4 rounded border-gray-300 text-sky-600 accent-sky-600"
              />
              Recuérdame
            </label>

            {error && (
              <span className="text-xs sm:text-sm font-medium text-red-600">
                {error}
              </span>
            )}
          </div>

          {/* Botón entrar */}
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 py-2 sm:py-3 text-sm sm:text-lg font-semibold text-white shadow hover:from-emerald-500 hover:to-emerald-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {isLoading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                ></path>
              </svg>
            )}
            {isLoading ? "Entrando..." : "Entrar"}
          </button>

          {/* Link recuperar contraseña */}
          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-xs sm:text-sm font-medium text-sky-700 underline hover:text-sky-900"
            >
              ¿Has olvidado tu contraseña?
            </Link>
          </div>

          {/* Botón registro */}
          <Link
            href="/register"
            className="block w-full rounded-xl border-2 border-emerald-500 py-2 sm:py-3 text-center text-sm sm:text-lg font-semibold text-emerald-600 shadow hover:bg-emerald-50"
          >
            ¿No tienes cuenta? Regístrate
          </Link>
        </form>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="mt-12 bg-sky-900 py-4 text-center text-sm text-white">
        <div className="space-x-4">
          <Link
            href="/privacy"
            className="hover:text-sky-300 transition-colors duration-200"
          >
            Política de privacidad
          </Link>
        </div>
        <p className="mt-2">© 2025 Switkor</p>
      </footer>
    </div>
  );
}
