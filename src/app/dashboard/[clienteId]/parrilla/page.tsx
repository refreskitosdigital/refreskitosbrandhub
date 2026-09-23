import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ParrillaTable } from '@/components/modules/ParrillaTable';

export default async function ParrillaPage({ params }: { params: { clienteId: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // Obtener rol
  const { data: userData } = await supabase
    .from('usuarios_clientes')
    .select('rol')
    .eq('usuario_id', user.id)
    .single();

  const { data: cliente } = await supabase.from('clientes').select('nombre').eq('id', params.clienteId).single();
  if (!cliente) notFound();

  // Fetch actual data
  const { data: parrillaData } = await supabase
    .from('parrilla_contenido')
    .select('*')
    .eq('cliente_id', params.clienteId)
    .order('created_at', { ascending: false });

  // Transform data if needed for the table
  const formattedData = (parrillaData || []).map(row => ({
    id: row.id,
    mes: row.mes,
    fecha: row.fecha_publicacion || row.mes,
    canal: row.canal || '',
    pilar: row.pilar || '',
    objetivo: row.objetivo || '',
    rrss: '', // We can add this column or infer it
    texto: row.informacion || '',
    caption: row.caption || '',
    formato: row.formato || row.tipo,
    estado: row.estado || 'Pendiente',
    guion: row.guion || '',
    link_referencia: row.link_referencia || ''
  }));

  return (
    <div className="h-[calc(100vh-8rem)]">
      <ParrillaTable 
        clienteId={params.clienteId} 
        initialData={formattedData} 
        rol={userData?.rol || 'cliente'} 
      />
    </div>
  );
}
