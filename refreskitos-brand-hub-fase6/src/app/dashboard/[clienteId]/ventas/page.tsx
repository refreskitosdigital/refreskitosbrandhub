import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { VentasModule } from '@/components/modules/VentasModule';

export default async function VentasPage({ params }: { params: { clienteId: string } }) {
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

  // Traer ventas
  const { data: ventas } = await supabase
    .from('leads')
    .select('*')
    .eq('cliente_id', params.clienteId)
    .order('mes', { ascending: false });

  return (
    <div className="h-full">
      <VentasModule 
        clienteId={params.clienteId} 
        initialData={ventas || []} 
        rol={userData?.rol || 'cliente'} 
      />
    </div>
  );
}
