import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { PresupuestoModule } from '@/components/modules/PresupuestoModule';

export default async function PresupuestoPage({ params }: { params: { clienteId: string } }) {
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

  // Fetch presupuestos with their items
  const { data: presupuestos } = await supabase
    .from('presupuestos')
    .select('*, presupuesto_items(*)')
    .eq('cliente_id', params.clienteId)
    .order('created_at', { ascending: false });

  return (
    <div className="h-full">
      <PresupuestoModule 
        clienteId={params.clienteId} 
        initialData={presupuestos || []} 
        rol={userData?.rol || 'cliente'} 
      />
    </div>
  );
}
