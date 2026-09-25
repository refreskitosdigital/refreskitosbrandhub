import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Folder, LayoutList } from 'lucide-react';
import Link from 'next/link';

export default async function GlobalParrillaFoldersPage() {
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

  const { data: clientes } = await supabase.from('clientes').select('id, nombre').order('nombre');

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black font-syne text-text">Tableros de Contenido (Parrillas)</h1>
          <p className="text-text-dim text-sm mt-2">Selecciona la carpeta de un cliente para entrar a su tablero Kanban interactivo.</p>
        </div>
        <div className="w-12 h-12 bg-magenta/10 rounded-xl flex items-center justify-center text-magenta">
          <LayoutList className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {clientes?.map(c => (
          <Link 
            href={`/dashboard/${c.id}/parrilla`} 
            key={c.id}
            className="group bg-panel border border-border rounded-2xl p-6 hover:border-magenta hover:shadow-[0_0_20px_rgba(230,0,0,0.15)] transition-all flex flex-col items-center text-center cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-magenta transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            
            <Folder className="w-16 h-16 text-text-dim group-hover:text-magenta transition-colors mb-4 stroke-[1.5]" />
            <h3 className="font-syne font-bold text-lg text-text group-hover:text-magenta transition-colors">{c.nombre}</h3>
            <span className="text-xs font-medium text-text-dim mt-2 bg-panel-2 px-3 py-1 rounded-full group-hover:bg-magenta/10 transition-colors">
              Abrir Tablero
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
