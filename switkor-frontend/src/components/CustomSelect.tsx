// components/CustomSelect.tsx
'use client';
import { useState, useEffect } from 'react';
import { ChevronDownIcon } from 'lucide-react';

interface CustomSelectProps {
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export default function CustomSelect({
  label,
  options,
  selected,
  onSelect,
  placeholder = 'Selecciona una opción',
  error,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  return (
    <div className="relative z-10">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        className="w-full rounded-xl border border-gray-300 bg-white shadow-sm cursor-pointer px-4 py-2 flex justify-between items-center"
        onClick={(e) => {
          e.stopPropagation(); // evita que el window.click lo cierre de inmediato
          setOpen(!open);
        }}
      >
        <span>{selected ?? placeholder}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </div>
      {open && (
        <div className="absolute mt-2 w-full bg-slate-800 p-3 rounded-xl shadow-lg space-y-2">
          {options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
              className="w-full text-sm text-white bg-cyan-600 hover:bg-cyan-500 px-4 py-1.5 rounded-full text-left transition-all"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
