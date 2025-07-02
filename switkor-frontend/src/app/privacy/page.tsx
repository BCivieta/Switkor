// src/app/privacy/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    
    <main className="max-w-3xl mx-auto px-4 py-10 text-gray-800">

      {/* Botón atrás dinámico */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 shadow hover:bg-gray-200 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Atrás
        </button>
      </div>
      
      <h1 className="text-3xl font-bold mb-6 text-center">Política de Privacidad</h1>

      <p className="text-sm text-gray-500 text-center mb-10">
        Última actualización: Junio 2025
      </p>

      <section className="space-y-6 text-justify leading-relaxed">
        <p>
          Gracias por utilizar <strong>Switkor</strong>, una plataforma desarrollada para ayudarte a planificar tu entrenamiento de forma personalizada.
        </p>

        <h2 className="text-xl font-semibold mt-6">1. Responsable del tratamiento</h2>
        <p>
          La responsable del tratamiento de tus datos es Blanca Civieta. Puedes contactar en: <a href="mailto:blancacivieta@gmail.com" className="text-blue-600 underline">blancacivieta@gmail.com</a>
        </p>

        <h2 className="text-xl font-semibold mt-6">2. Qué datos recogemos</h2>
        <p>
          Switkor recoge únicamente los datos necesarios para generar tu plan de entrenamiento personalizado:
        </p>
        <ul className="list-disc list-inside">
          <li>Correo electrónico</li>
          <li>Nivel de experiencia</li>
          <li>Objetivos</li>
          <li>Sexo</li>
          <li>Días disponibles por semana</li>
        </ul>
        <p>No utilizamos cookies actualmente.</p>

        <h2 className="text-xl font-semibold mt-6">3. Para qué usamos tus datos</h2>
        <p>
          Tus datos se utilizan exclusivamente para generar tu plan personalizado y mostrar tu progreso. No compartimos tus datos con terceros.
        </p>

        <h2 className="text-xl font-semibold mt-6">4. Base legal</h2>
        <p>Tratamos tus datos en base a tu consentimiento.</p>

        <h2 className="text-xl font-semibold mt-6">5. Tus derechos</h2>
        <p>
          Puedes acceder, rectificar o eliminar tus datos, limitar u oponerte al tratamiento, y solicitar la portabilidad. Escribe a <a href="mailto:blancacivieta@gmail.com" className="text-blue-600 underline">blancacivieta@gmail.com</a>.
        </p>

        <h2 className="text-xl font-semibold mt-6">6. Seguridad</h2>
        <p>
          Tus datos están almacenados de forma segura en servidores gestionados por Supabase.
        </p>

        <h2 className="text-xl font-semibold mt-6">7. Cambios</h2>
        <p>
          Esta política puede actualizarse. Te notificaremos si hay cambios importantes.
        </p>

        <h2 className="text-xl font-semibold mt-6">8. Cookies</h2>
        <p>
          Actualmente <strong>no utilizamos cookies</strong>. Si en el futuro las usamos, lo notificaremos y pediremos tu consentimiento.
        </p>
      </section>
    </main>
  );
}
