import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { CalendarioModule } from '@/components/modules/CalendarioModule';

export default async function GlobalCalendarioPage() {
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

  const { data: clientes } = await supabase.from('clientes').select('id, nombre').order('nombre');

  const { data: tareas } = await supabase
    .from('tareas_calendario')
    .select('*, clientes(nombre)')
    .order('fecha', { ascending: true });

  return (
    <div className="h-full">
      <CalendarioModule 
        initialData={tareas || []} 
        rol={userData?.rol || 'administrador'} 
        clientesGlobales={clientes || []}
      />
    </div>
  );
}
