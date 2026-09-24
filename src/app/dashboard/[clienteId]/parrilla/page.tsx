import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { KanbanModule } from '@/components/modules/KanbanModule';
import { MockupApprovalModule } from '@/components/modules/MockupApprovalModule';

export default async function ParrillaPage({ params }: { params: { clienteId: string } }) {
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

  return (
    <div className="h-[calc(100vh-8rem)] p-4">
      {userData?.rol === 'administrador' ? (
        <KanbanModule clienteId={params.clienteId} rol="administrador" />
      ) : (
        <MockupApprovalModule clienteId={params.clienteId} />
      )}
    </div>
  );
}
