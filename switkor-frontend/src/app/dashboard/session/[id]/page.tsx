"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { patternTranslations } from "@/lib/patternTranslations";
import { goalTranslations } from "@/lib/goalTranslations";
import type { Session, Exercise } from "@/types/plan";

export default function SessionPage() {
  const { id } = useParams();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [session, setSession] = useState<Session | null>(null);
  const [marking, setMarking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get<Session>(`/session/${String(id)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        //debug
        console.log("Sesión recibida:", res.data);
        //debug
        setSession(res.data);
      } catch (error) {
        console.error("Error al cargar la sesión:", error);
      }
    };

    if (typeof id === "string" && token) fetchSession();
  }, [id, token]);

  // Limpia el mensaje de error tras 5 segundos
  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => setErrorMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  // Función para marcar sesión como completada
  const handleComplete = () => {
    if (!session) return;
    const today = new Date().toDateString();
    const sessionDay = new Date(session.date).toDateString();
    if (today !== sessionDay) {
      setErrorMessage(
        `Hoy no toca completar esta sesión. La sesión es el ${new Date(
          session.date
        ).toLocaleDateString("es-ES")}`
      );
      return;
    }
    // proceed to mark
    setErrorMessage(null);
    setMarking(true);
    api
      .patch(`/session/${id}/complete`, null, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => router.push("/dashboard"))
      .catch((err) => {
        console.error("Error marcando completada:", err);
        setErrorMessage("No se pudo completar. Inténtalo más tarde.");
        setMarking(false);
      });
  };
  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center text-sky-900 font-medium">
        Cargando sesión...
      </div>
    );
  }

  const groupedExercises = session.exercises.reduce<Record<string, Exercise[]>>(
    (acc, exercise) => {
      if (!acc[exercise.block]) acc[exercise.block] = [];
      acc[exercise.block].push(exercise);
      return acc;
    },
    {}
  );

  const blockTitles: Record<string, string> = {
    warmup: "Bloque Activación 🔥",
    main: "Bloque Principal 🐅",
    global: "Bloque Global 🌍",
    accessory: "Bloque Complementario ⚡",
    recovery: "Recuperación 🧘",
  };

  return (
    <div>
      {/* Header */}
      <header className=" px-2 pt-4 sm:px-4 sm:pt-6">
        {/* Botón atrás */}
        <div className="mb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 shadow hover:bg-gray-200"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Atrás
          </Link>
        </div>
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/LogoSinFondo.png"
            alt="Switkor"
            width={230}
            height={120}
            priority
          />
        </div>

        {/* Claim */}
        <p className="mb-2 text-center text-lg sm:text-2xl font-semibold text-sky-900">
          ¡Hoy es un buen día para entrenar!
        </p>
      </header>
      {/* Contenido */}
      <main className="py-6 w-full flex flex-col items-center">
        <div className="w-full sm:max-w-4xl sm:px1">
          <h1 className="text-lg sm:text-2xl font-bold text-center text-sky-900 mb-4 sm:mb-6">
            {session.dayOfWeek} - {new Date(session.date).toLocaleDateString()}
          </h1>
          {/* Checkbox para completar sesion */}
          <label className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              checked={session.completed}
              onChange={handleComplete}
              disabled={marking}
              className="form-checkbox h-5 w-5 text-emerald-500"
            />
            <span className="text-sm font-medium">Completada</span>
          </label>

          {/* Mostrar error si la petición devuelve 400 */}
          {errorMessage && (
            <div className="mb-4 flex justify-between items-center bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
              <span>{errorMessage}</span>
              {/* Aquí está el botón de cierre */}
              <button
                onClick={() => setErrorMessage(null)}
                className="font-bold ml-4"
              >
                ×
              </button>
            </div>
          )}
          {/* Card gris*/}
          <div className=" bg-gray-50 rounded-3xl p-4 sm:p-6 shadow-inner px-1 sm:px-6">
            {/* Etiquetas */}
            <div className="flex justify-center gap-2 mb-4 sm:mb-6 flex-wrap">
              <span className="px-3 py-1 bg-rose-100 text-rose-600 font-medium rounded-full text-xs sm:text-sm">
                {goalTranslations[session.trainingPlan.goal] ||
                  session.trainingPlan.goal}
              </span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-600 font-medium rounded-full text-xs sm:text-sm">
                {session.focus
                  .split(",")
                  .map((key) => patternTranslations[key.trim()] || key)
                  .join(" / ")}
              </span>
            </div>
            {/* Bloques de ejercicios */}
            <div className="space-y-6 sm:space-y-8 m-0">
              {Object.entries(groupedExercises).map(([block, exercises]) => (
                <div
                  key={block}
                  className="bg-emerald-50 border border-emerald-100 rounded-2xl sm:rounded-3xl shadow p-4 sm:p-8"
                >
                  <h2 className=" text-base sm:text-lg font-semibold text-emerald-800 mb-3 sm:mb-4">
                    {blockTitles[block] || block}
                  </h2>
                  <ul className="space-y-1 sm:space-y-2">
                    {exercises.map((ex, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center text-responsive"
                      >
                        <span>🔹{ex.exercise.name}</span>
                        <span className="font-medium">
                          {ex.sets}x{ex.reps}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
