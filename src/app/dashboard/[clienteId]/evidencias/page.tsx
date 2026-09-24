import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { BrandKitModule } from '@/components/modules/BrandKitModule';

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

  return (
    <div className="h-full">
      <BrandKitModule 
        clienteId={params.clienteId} 
        rol={userData?.rol || 'cliente'} 
      />
    </div>
  );
}
