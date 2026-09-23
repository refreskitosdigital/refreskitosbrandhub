'use client';

import { Bell } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface TopbarProps {
  rol: 'administrador' | 'cliente';
  clientes?: { id: string; nombre: string }[];
}

export function Topbar({ rol, clientes }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const parts = pathname.split('/');
  const isDashboardRoute = parts[1] === 'dashboard';
  const currentClienteId = (isDashboardRoute && parts[2] && parts[2] !== 'configuracion') ? parts[2] : '';

  const handleClienteChange = (newId: string) => {
    if (parts.length >= 4) {
      router.push(`/dashboard/${newId}/${parts[3]}`);
    } else {
      router.push(`/dashboard/${newId}`);
    }
  };

  return (
    <header className="h-16 flex items-center px-8 border-b border-border justify-between bg-black shrink-0 relative z-10">
      <div className="flex items-center gap-4">
        {rol === 'administrador' && clientes && (
          <>
            <span className="text-text-dim text-sm font-medium">Workspace actual:</span>
            <select 
              className="bg-panel-2 border border-border text-text text-sm font-medium rounded-btn px-3 py-1.5 focus:outline-none focus:border-magenta transition-colors"
              value={currentClienteId}
              onChange={(e) => handleClienteChange(e.target.value)}
            >
              <option value="" disabled>Selecciona un cliente</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {rol === 'administrador' && (
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-panel-2 text-text-dim hover:text-text transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-magenta rounded-full ring-2 ring-black"></span>
          </div>
        )}
        <div className="w-8 h-8 rounded-full bg-magenta/20 text-magenta flex items-center justify-center font-bold font-syne border border-magenta/30 shadow-sm text-sm">
          {rol === 'administrador' ? 'RF' : 'CL'}
        </div>
      </div>
    </header>
  );
}
