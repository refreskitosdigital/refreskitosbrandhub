import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { MetricasModule } from '@/components/modules/MetricasModule';

export default async function MetricasPage({ params }: { params: { clienteId: string } }) {
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

  // Traer metricas
  const { data: metricas } = await supabase
    .from('metricas_mensuales')
    .select('*')
    .eq('cliente_id', params.clienteId)
    .order('mes', { ascending: false });

  return (
    <div className="h-full">
      <MetricasModule 
        clienteId={params.clienteId} 
        initialData={metricas || []} 
        rol={userData?.rol || 'cliente'} 
      />
    </div>
  );
}
