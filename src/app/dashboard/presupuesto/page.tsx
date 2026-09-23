import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { PresupuestoModule } from '@/components/modules/PresupuestoModule';

export default async function GlobalPresupuestoPage() {
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

  const { data: presupuestos } = await supabase
    .from('presupuestos')
    .select('*, presupuesto_items(*), clientes(nombre)')
    .order('created_at', { ascending: false });

  return (
    <div className="h-full">
      <PresupuestoModule 
        initialData={presupuestos || []} 
        rol={userData?.rol || 'administrador'} 
        clientesGlobales={clientes || []}
      />
    </div>
  );
}
