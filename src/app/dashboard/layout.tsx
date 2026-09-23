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
    .select('rol, cliente_id, clientes(id, nombre, bloqueado)')
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
  const clienteActual = userData.clientes as unknown as {id: string, nombre: string, bloqueado?: boolean};

  const estaBloqueado = rol === 'cliente' && clienteActual?.bloqueado === true;

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      <Sidebar 
        rol={rol} 
        clienteId={rol === 'cliente' ? clienteActual?.id : undefined} 
        clienteNombre={rol === 'cliente' ? clienteActual?.nombre : undefined}
      />
      <div className="flex-1 flex flex-col min-w-0 relative">
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
          {estaBloqueado ? (
            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center border-t-4 border-alert">
              <h2 className="text-4xl font-syne font-bold text-alert mb-4">ACCESO BLOQUEADO</h2>
              <p className="text-lg text-text max-w-lg mb-8">
                El acceso a este workspace ha sido suspendido temporalmente. Por favor, póngase al día con sus pagos pendientes para seguir disfrutando de su plan.
              </p>
              <div className="bg-panel border border-alert/30 rounded-card p-6 w-full max-w-md">
                <h3 className="font-bold text-text mb-4 text-left">Resumen de Cuenta</h3>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-text-dim">Estado:</span>
                  <span className="text-alert font-bold uppercase text-xs tracking-widest">En Deuda</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-text-dim">Notas pendientes:</span>
                  <span className="text-text font-bold">Verificar con el asesor</span>
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
