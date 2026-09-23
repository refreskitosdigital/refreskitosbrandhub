import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { LineChart, Target, ImageIcon } from 'lucide-react';

export default async function GlobalPlaceholderPage() {
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
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="w-20 h-20 bg-panel-2 rounded-full flex items-center justify-center text-magenta mb-6">
        <LineChart className="w-10 h-10" />
      </div>
      <h1 className="text-3xl font-syne font-bold text-text mb-4">Módulo Específico de Marca</h1>
      <p className="text-text-dim max-w-md mx-auto">
        Este módulo requiere que selecciones un cliente. Usa el menú "Workspace actual" en la barra superior para entrar al entorno de una marca.
      </p>
    </div>
  );
}
