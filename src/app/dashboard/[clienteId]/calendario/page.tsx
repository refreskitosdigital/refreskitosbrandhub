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

  // Traer tareas
  const { data: tareas } = await supabase
    .from('tareas_calendario')
    .select('*')
    .eq('cliente_id', params.clienteId)
    .order('fecha', { ascending: true });

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
