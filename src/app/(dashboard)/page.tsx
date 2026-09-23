import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardRoot() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/');

  const { data: userData } = await supabase
    .from('usuarios_clientes')
    .select('rol, cliente_id')
    .eq('usuario_id', user.id)
    .single();

  if (userData?.rol === 'administrador') {
    // Redirigir al administrador a la vista general o configuración
    // En este diseño lo llevaremos a la lista de clientes o al primer cliente
    const { data: clientes } = await supabase.from('clientes').select('id').eq('activo', true).limit(1).single();
    if (clientes) {
      redirect(`/dashboard/${clientes.id}`);
    } else {
      redirect('/dashboard/configuracion');
    }
  } else if (userData?.rol === 'cliente') {
    redirect(`/dashboard/${userData.cliente_id}`);
  }

  return null;
}
