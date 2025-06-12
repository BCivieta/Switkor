'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

interface MenuItem {
  label: string;
  href: string;
  isPrimary?: boolean; // Para estilo botón
}

interface MobileMenuProps {
  links: MenuItem[];     
  actions?: MenuItem[]; 
}

export default function MobileMenu({ links, actions = [] }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleActionClick = (label: string, href: string) => {
    setOpen(false);
    if (label === 'Cerrar sesión') {
      logout();
      router.push('/login');
    } else {
      router.push(href);
    }
  };

  return (
    <div className="lg:hidden relative z-20">
      <button
        onClick={() => setOpen(!open)}
        className="relative z-50 p-2 rounded-md border border-emerald-200 bg-white shadow hover:bg-emerald-50 transition"
        >
        {open ? (
            <X className="w-6 h-6 text-emerald-600" />
        ) : (
            <Menu className="w-6 h-6 text-emerald-600" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-56 rounded-xl bg-white shadow-lg p-4 space-y-4 text-sm">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block text-gray-700 hover:text-emerald-600"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {actions.length > 0 && <hr className="border-gray-200" />}

          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleActionClick(action.label, action.href)}
              className={`w-full text-left font-medium px-4 py-2 rounded-md ${
                action.isPrimary
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'text-emerald-600 hover:text-emerald-800'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
