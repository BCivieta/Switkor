// src/app/page.tsx
"use client";

import Link from "next/link";
import {
  BoltIcon,
  AdjustmentsVerticalIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import MobileMenu from "../components/mobileMenu";
import {
  UserPlus,
  Dumbbell,
  BarChart3,
  CalendarClock,
  CalendarDays,
} from "lucide-react";
import { motion } from "framer-motion";
import ContactForm from "../components/ContactForm";

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center text-gray-800">
      {/* Header */}
      <header className="w-full flex justify-between items-center px-6 py-4 bg-white shadow-md sticky top-0 z-10">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/LogoSinLetras.png"
            alt="Switkor"
            width={48}
            height={48}
            className="h-18 w-auto"
          />
          <span className=" text-2xl sm:text-3xl font-bold text-[#123344]">
            Switkor
          </span>
        </div>
        {/* Menú visible en desktop */}
        <nav className="hidden lg:flex gap-6 ">
          <Link href="#inicio" className="hover:text-emerald-700">
            Inicio
          </Link>
          <Link href="#como-funciona" className="hover:text-emerald-700">
            Como funciona
          </Link>
          <Link href="#contacto" className="hover:text-emerald-700">
            Contacto
          </Link>
        </nav>
        <div className="hidden lg:flex gap-2">
          <Link
            href="/login"
            className="px-4 py-2 rounded-full border border-emerald-500 text-emerald-500 hover:bg-emerald-50"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white hover:from-emerald-500 hover:to-emerald-700 transition-all duration-200"
          >
            Registrarse
          </Link>
        </div>
        {/* Menú hamburguesa en móvil */}
        <div className="flex items-center gap-2 lg:hidden">
          <MobileMenu
            links={[
              { href: "#inicio", label: "Inicio" },
              { href: "#como-funciona", label: "Como funciona" },
              { href: "#contacto", label: "Contacto" },
            ]}
            actions={[
              { label: "Iniciar sesión", href: "/login" },
              { label: "Registrarse", href: "/register", isPrimary: true },
            ]}
          />
        </div>
      </header>

      {/* Hero principal */}
      <section id="inicio" className="scroll-mt-35 w-full max-w-6xl px-4 py-16">
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
            className="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white px-8 py-3 rounded-full text-base sm:text-lg font-semibold hover:from-emerald-500 hover:to-emerald-700 transition-all duration-200"
          >
            EXPLORA EL PROTOTIPO
          </Link>
        </div>
      </section>

      {/* Qué es Switkor */}
      <section className="w-full max-w-4xl px-4 mb-30">
        <h2 className=" text-xl sm:text-2xl font-bold text-center mb-10">
          {" "}
          ¿Qué es Switkor?
        </h2>
        <div className="space-y-6">
          <div className="bg-gray-100 p-6 rounded-xl shadow-md flex gap-4">
            <BoltIcon className="w-8 h-8 text-emerald-600" />
            <p className="text-sm sm:text-base">
              <strong>
                Aplicación que crea entrenamientos de manera automática.
              </strong>{" "}
              Introduce tus variables y la logica de switkor hara su magia.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-gray-100 shadow-md flex gap-4">
            <CalendarDays className="w-8 h-8 text-emerald-600" />
            <p className="text-sm sm:text-base">
              <strong>
                Podrás ver tu planificación de cuatro semanas en un calendario
                interactivo.
              </strong>{" "}
              Navega por tus sesiones y pincha para ver los detalles de cada una
              de ellas.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-gray-100 shadow-md flex gap-4">
            <AdjustmentsVerticalIcon className="w-8 h-8 text-emerald-600" />
            <p className="text-sm sm:text-base">
              <strong>Podrás ver metricas sobre tu regularidad, </strong>como
              racha de entrenos sin fallar y entrenamientos que has realizado
              cada mes.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-gray-100 shadow-md flex gap-4">
            <ShareIcon className="w-8 h-8 text-emerald-600" />
            <p className="text-sm sm:text-base">
              <strong>Proximamente funcionalidad social</strong> para que
              compartas tus progresos.
            </p>
          </div>
        </div>
      </section>
      {/* Beneficios cortos */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center px-4 mb-30">
        <div>
          <Dumbbell className="mx-auto mb-2 w-8 h-8 text-emerald-600" />
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            Planes adaptados
          </h3>
          <p className="text-sm sm:text-base">
            Entrenamientos según tu nivel y objetivo
          </p>
        </div>
        <div>
          <CalendarClock className="mx-auto mb-2 w-8 h-8 text-emerald-600" />
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            Automático y flexible
          </h3>
          <p className="text-sm sm:text-base">
            Generación automática según disponibilidad
          </p>
        </div>
      </section>
      {/* Cómo funciona */}
      <section
        id="como-funciona"
        className="scroll-mt-35 w-full max-w-6xl px-4 mb-20"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-10">
          ¿Cómo funciona?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Paso 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="relative border-4 border-[#6BE2DC] rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 bg-[#6BE2DC]/20 hover:-translate-y-1 transform text-center"
          >
            <span className="text-white absolute top-2 left-2 text-xs font-bold bg-[#11ADA5] px-2 py-1 rounded-full shadow-sm">
              Paso 1
            </span>
            <UserPlus className="w-8 h-8 text-[#143A49] mx-auto mb-4" />
            <h3 className="font-bold text-base sm:text-lg mb-4">
              Regístrate y completa tu perfil
            </h3>
            <p className="text-sm sm:text-base text-left">
              Crea una cuenta gratuita,no usamos cookies y respetamos tu privacidad.
              Pincha en crear un plan nuevo e introduce tus datos básicos.
            </p>
          </motion.div>

          {/* Paso 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative border-4 border-[#51DC8E] rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 bg-[#51DC8E]/20 hover:-translate-y-1 transform text-center"
          >
            <span className="absolute top-2 left-2 text-xs font-bold bg-emerald-600 text-white px-2 py-1 rounded-full shadow-sm">
              Paso 2
            </span>
            <Dumbbell className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
            <h3 className="font-bold text-base sm:text-lg mb-4">
              Recibe tu plan personalizado
            </h3>
            <p className="text-sm sm:text-base text-left">
              La app genera automáticamente un plan de entrenamiento semanal
              adaptado a tu nivel, tiempo disponible y objetivos.
            </p>
          </motion.div>

          {/* Paso 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="relative border-4 border-[#2D8392] rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 bg-[#2D8392]/20 hover:-translate-y-1 transform text-center"
          >
            <span className="absolute top-2 left-2 text-xs font-bold bg-[#2D8392] text-white px-2 py-1 rounded-full shadow-sm">
              Paso 3
            </span>
            <BarChart3 className="w-8 h-8 text-[#2D8392] mx-auto mb-4" />
            <h3 className="font-bold text-base sm:text-lg mb-4">
              Entrena, mejora y comparte
            </h3>
            <p className="text-sm sm:text-base text-left">
              Usa la app, marca tus sesiones completadas y sigue tu evolución.
              Es un prototipo en desarrollo, tu feedback nos ayuda.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="w-full max-w-3xl px-4 mb-20">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-10">
          ¿Quieres darnos tu feedback, hacer alguna propuesta, o tienes alguna
          duda?
        </h2>
        <ContactForm />
      </section>

      {/* Footer */}
      <footer className="w-full bg-sky-900 py-6 text-white text-center text-sm ">
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
    </main>
  );
}
