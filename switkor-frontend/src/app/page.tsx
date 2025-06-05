// src/app/page.tsx
'use client';

import Link from 'next/link';
import { BoltIcon, ClockIcon, AdjustmentsVerticalIcon, ShareIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';


export default function LandingPage() {
  return (
    <main className="flex flex-col items-center text-gray-800">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-4 bg-white shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
           <Image
            src="/logoSinLetras.png"
            alt="Switkor"
            width={48}
            height={48}
            className="h-18 w-auto"
          />
          <span className="text-3xl font-bold text-[#1A3F4E]">Switkor</span>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link href="#">Inicio</Link>
          <Link href="#planes">Planes</Link>
          <Link href="#ejemplo">Ejemplo de sesión</Link>
          <Link href="#contacto">Contacto</Link>
        </nav>
        <div className="flex gap-2">
          <Link
            href="/login"
            className="px-4 py-2 rounded-full border border-green-500 text-green-500 hover:bg-green-50"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600"
          >
            Registrarse
          </Link>
        </div>
      </header>

      {/* Hero principal */}
      <section className="w-full max-w-6xl px-4 py-16">
        <div className="relative rounded-3xl overflow-hidden h-[500px] shadow-lg">
          <Image
            src="/Landing.png"
            alt="Entrenamiento"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <h1 className="text-white text-3xl sm:text-5xl font-bold text-center px-4">
              Automatiza tu Entrenamiento
            </h1>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="bg-green-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-600"
          >
            EMPIEZA GRATIS
          </Link>
        </div>
      </section>

      {/* Beneficios cortos */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center px-4 mb-20">
        <div>
          <h3 className="text-lg font-semibold mb-2">Planes adaptados</h3>
          <p>Entrenamientos según tu nivel y objetivos</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Automático y flexible</h3>
          <p>Generación automática según disponibilidad</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Conecta y comparte</h3>
          <p>Comparte tus progresos con la comunidad</p>
        </div>
      </section>

      {/* Por qué elegir Switkor */}
      <section className="w-full max-w-4xl px-4 mb-20">
        <h2 className="text-2xl font-bold text-center mb-10"> ¿Por qué elegir Switkor?</h2>
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-white shadow-md flex gap-4">
            <BoltIcon className="w-8 h-8 text-green-600" />
            <p>
              <strong>Entrena con lógica, no con suposiciones.</strong> Switkor genera planes realistas y eficientes según objetivos y nivel.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white shadow-md flex gap-4">
            <ClockIcon className="w-8 h-8 text-green-600" />
            <p>
              <strong>Ahorra tiempo y esfuerzo</strong> en la planificación. Solo rellena tu perfil y listo.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white shadow-md flex gap-4">
            <AdjustmentsVerticalIcon className="w-8 h-8 text-green-600" />
            <p>
              <strong>Adáptate a tu carga semanal.</strong> Cada semana el sistema ajusta tu plan.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white shadow-md flex gap-4">
            <ShareIcon className="w-8 h-8 text-green-600" />
            <p>
              <strong>Comparte tu progreso</strong> con quien quieras.
            </p>
          </div>
        </div>
      </section>

      {/* Planes */}
      <section id="planes" className="w-full max-w-6xl px-4 mb-20">
        <h2 className="text-2xl font-bold text-center mb-10">Nuestros planes</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="relative border rounded-xl p-6 shadow-lg text-center bg-gray-50">
            <span className="absolute top-2 left-2 text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Gratuito
            </span>
            <h3 className="font-bold text-lg mb-4 mt-4">Plan Gratuito</h3>
            <ul className="text-sm space-y-1 mb-4 text-left">
              <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-green-500" /> Generador básico de planes</li>
              <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-green-500" /> Acceso limitado a funciones</li>
              <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-green-500" /> Registro gratuito</li>
            </ul>
            <p className="font-semibold mb-2">0 € / mes</p>
            <Link href="/login" className="inline-block bg-green-100 text-green-700 font-medium px-4 py-2 rounded-full">
              Empieza gratis
            </Link>
          </div>

          <div className="relative border-2 border-green-500 rounded-xl p-6 shadow-xl text-center bg-green-50">
            <span className="absolute top-2 left-2 text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
              El más popular
            </span>
            <h3 className="font-bold text-lg mb-4 mt-4">Plan Premium Individual</h3>
            <ul className="text-sm space-y-1 mb-4 text-left">
              <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-green-500" /> Planes personalizados</li>
              <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-green-500" /> Estadísticas y seguimiento</li>
              <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-green-500" /> Integración con wearables</li>
              <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-green-500" /> Comunidad global</li>
            </ul>
            <p className="font-semibold mb-2">12,99 € / mes</p>
            <Link href="/login" className="inline-block bg-green-500 text-white font-medium px-4 py-2 rounded-full">
              Quiero ser premium
            </Link>
          </div>

          <div className="relative border rounded-xl p-6 shadow-lg text-center bg-gray-50">
            <span className="absolute top-2 left-2 text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Ideal para clubs
            </span>
            <h3 className="font-bold text-lg mb-4 mt-4">Plan Compartido</h3>
            <ul className="text-sm space-y-1 mb-4 text-left">
              <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-green-500" /> Entrenamiento coordinado</li>
              <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-green-500" /> Acceso premium para miembros</li>
              <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-green-500" /> Comunidad privada</li>
            </ul>
            <p className="font-semibold mb-2">29,99 € / grupo</p>
            <Link href="/login" className="inline-block bg-green-100 text-green-700 font-medium px-4 py-2 rounded-full">
              Registrar mi equipo
            </Link>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="w-full max-w-3xl px-4 mb-20">
        <h2 className="text-2xl font-bold text-center mb-10">¿Tienes una duda, una propuesta o quieres colaborar?
        </h2>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Nombre"
            className="w-full rounded border px-4 py-2"
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full rounded border px-4 py-2"
          />
          <select className="w-full rounded border px-4 py-2">
            <option>General</option>
            <option>Duda sobre planes</option>
            <option>Propuesta de colaboración</option>
            <option>Empresas o clubes</option>
          </select>
          <textarea
            placeholder="Escribe tu propuesta o duda..."
            className="w-full rounded border px-4 py-2 min-h-[120px]"
          />
          <button className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
            Enviar mensaje
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="w-full bg-sky-900 py-6 text-white text-center text-sm">
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
    </main>
  );
}
