import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/');
  }

  // Obtener rol y cliente
  const { data: userData } = await supabase
    .from('usuarios_clientes')
    .select('rol, cliente_id, clientes(id, nombre)')
    .eq('usuario_id', user.id)
    .single();

  if (!userData) {
    redirect('/');
  }

  const rol = userData.rol as 'administrador' | 'cliente';
  
  // Si es administrador, buscamos todos los clientes activos para el selector
  let todosClientes: { id: string, nombre: string }[] = [];
  if (rol === 'administrador') {
    const { data: clis } = await supabase.from('clientes').select('id, nombre').eq('activo', true).order('nombre');
    todosClientes = clis || [];
  }

  // Nombre del cliente actual a mostrar en el sidebar
  // (Esto podría volverse dinámico en el cliente o por URL)
  const clienteActual = userData.clientes as unknown as {id: string, nombre: string};

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar 
        rol={rol} 
        clienteId={rol === 'cliente' ? clienteActual?.id : undefined} 
        clienteNombre={rol === 'cliente' ? clienteActual?.nombre : undefined}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar 
          rol={rol} 
          clientes={todosClientes}
        />
        {rol === 'cliente' && (
          <div className="bg-lime/10 border-b border-lime/20 text-lime px-8 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center shrink-0">
            Estás viendo este workspace en modo lectura
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
