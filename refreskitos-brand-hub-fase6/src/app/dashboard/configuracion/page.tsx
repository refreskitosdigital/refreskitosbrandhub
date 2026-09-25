import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { ConfiguracionModule } from '@/components/modules/ConfiguracionModule';

export default async function ConfiguracionPage() {
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

  return (
    <div className="h-full">
      <ConfiguracionModule />
    </div>
  );
}
