import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { EquipoModule } from '@/components/modules/EquipoModule';

export default async function EquipoPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: userData } = await supabase
    .from('usuarios_clientes')
    .select('rol')
    .eq('usuario_id', user.id)
    .single();

  if (userData?.rol !== 'administrador') {
    redirect('/dashboard');
  }

  // Obtener tareas pendientes
  const { data: tareas } = await supabase
    .from('kanban_cards')
    .select('id, titulo, fecha_publicacion, responsable, estado_cliente, clientes(nombre)')
    .neq('estado_cliente', 'aprobado'); // No contar aprobadas o finalizadas

  return (
    <div className="h-[calc(100vh-8rem)] p-4">
      <EquipoModule initialTasks={tareas || []} />
    </div>
  );
}
