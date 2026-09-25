import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import EvidenciasPageWrapper from '@/components/modules/EvidenciasWrapper';

export default async function EvidenciasPage({ params }: { params: { clienteId: string } }) {
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

  // Fetch Evidencias Data
  const { data: evidencias } = await supabase
    .from('evidencias')
    .select('*')
    .eq('cliente_id', params.clienteId)
    .order('fecha', { ascending: false });

  return (
    <div className="h-[calc(100vh-8rem)]">
      <EvidenciasPageWrapper 
        clienteId={params.clienteId} 
        rol={userData?.rol || 'cliente'} 
        evidenciasData={evidencias || []}
      />
    </div>
  );
}
