'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarDays, 
  LayoutList, 
  CircleDollarSign, 
  Image as ImageIcon, 
  LineChart, 
  Target, 
  Settings,
  Users
} from 'lucide-react';

interface SidebarProps {
  rol: 'administrador' | 'cliente';
  clienteId?: string;
  clienteNombre?: string;
}

export function Sidebar({ rol, clienteId, clienteNombre }: SidebarProps) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  
  let currentClienteId = clienteId;
  
  if (rol === 'administrador') {
    if (segments.length >= 2 && segments[0] === 'dashboard' && segments[1] !== 'configuracion' && segments[1] !== 'equipo') {
      currentClienteId = segments[1];
    }
  }

  const baseUrl = currentClienteId ? `/dashboard/${currentClienteId}` : '/dashboard';

  const menuItems = [
    { name: 'Dashboard General', icon: LayoutDashboard, href: baseUrl },
    { name: 'Calendario de Contenidos', icon: CalendarDays, href: `${baseUrl}/calendario` },
    { name: 'Parrilla de Contenidos', icon: LayoutList, href: `${baseUrl}/parrilla` },
    { name: 'Presupuesto y Facturación', icon: CircleDollarSign, href: `${baseUrl}/presupuesto` },
    { name: 'Caja Fuerte / Evidencias', icon: ImageIcon, href: `${baseUrl}/evidencias` },
    { name: 'Métricas y ADS', icon: LineChart, href: `${baseUrl}/metricas` },
    { name: 'Ventas y Leads', icon: Target, href: `${baseUrl}/ventas` },
  ];

  if (rol === 'administrador') {
    menuItems.push({ name: 'Rendimiento (Equipo)', icon: Users, href: '/dashboard/equipo' });
    menuItems.push({ name: 'Configuración de Sistema', icon: Settings, href: '/dashboard/configuracion' });
  }

  return (
    <aside className="w-64 bg-panel border-r border-border flex flex-col h-screen shrink-0 transition-all duration-200">
      <div className="h-16 flex items-center px-6 border-b border-border justify-between shrink-0">
        <div className="font-syne font-bold text-lg text-text truncate">
          {clienteNombre || 'REFRESKITOS'}
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== baseUrl);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                isActive 
                  ? 'bg-panel-2 text-magenta' 
                  : 'text-text-dim hover:bg-panel-2 hover:text-text'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3 shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Botón temporal de Logout para desarrollo */}
      <div className="p-4 border-t border-border">
        <button onClick={() => {/* TODO */}} className="w-full py-2 px-3 text-xs font-bold text-text-dim hover:text-alert text-left flex items-center transition-colors">
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
