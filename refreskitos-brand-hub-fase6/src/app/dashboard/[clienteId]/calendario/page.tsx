import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { CalendarioModule } from '@/components/modules/CalendarioModule';

export default async function CalendarioPage({ params }: { params: { clienteId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: userData } = await supabase
    .from('usuarios_clientes')
    .select('rol')
    .eq('usuario_id', user.id)
    .single();

  const { data: cliente } = await supabase.from('clientes').select('nombre').eq('id', params.clienteId).single();
  if (!cliente) notFound();

  // Traer tareas (Ahora se sincronizan con las tarjetas de Kanban)
  const { data: tareas } = await supabase
    .from('kanban_cards')
    .select('id, titulo, fecha_publicacion as fecha, estado_cliente as estado, etiquetas as prioridad')
    .eq('cliente_id', params.clienteId)
    .not('fecha_publicacion', 'is', null)
    .order('fecha_publicacion', { ascending: true });

  return (
    <div className="h-full">
      <CalendarioModule 
        clienteId={params.clienteId} 
        initialData={tareas || []} 
        rol={userData?.rol || 'cliente'} 
      />
    </div>
  );
}
