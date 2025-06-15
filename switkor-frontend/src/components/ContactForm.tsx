'use client';
import { useState } from 'react';
import CustomSelect from '@/components/CustomSelect';



export default function ContactForm() {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <form className="max-w-md mx-auto p-6 bg-gray-50 rounded-2xl shadow space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre:</label>
        <input
          type="text"
          placeholder="Nombre"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico:</label>
        <input
          type="email"
          placeholder="Correo@mail.com"
          className="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      <div>
        <CustomSelect
            label="Tipo de consulta"
            options={[
                'General',
                'Duda sobre planes',
                'Propuesta de colaboración',
                'Plan especial para empresas o clubes',
                'Otro',
            ]}
            selected={selectedOption}
            onSelect={setSelectedOption}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje:</label>
        <textarea
          placeholder="Escribe tu propuesta o duda..."
          className="w-full rounded-lg border border-gray-300 text-sm px-4 py-2 min-h-[120px] shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-medium px-6 py-2 rounded-full shadow-md hover:from-emerald-500 hover:to-emerald-700 transition-all duration-200"
        >
          Enviar mensaje
        </button>
      </div>
    </form>
  );
}
