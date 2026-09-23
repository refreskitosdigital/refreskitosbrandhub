import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Building2, UserPlus, Power } from 'lucide-react';

export default async function ConfiguracionPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/');

  // Validar rol de administrador
  const { data: userData } = await supabase
    .from('usuarios_clientes')
    .select('rol')
    .eq('usuario_id', user.id)
    .single();

  if (userData?.rol !== 'administrador') {
    redirect('/dashboard');
  }

  // Traer todos los clientes
  const { data: clientes } = await supabase.from('clientes').select('*').order('nombre');

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-syne font-bold text-text">Configuración Global</h1>
          <p className="text-text-dim text-sm mt-1">Gestión de Workspaces (Clientes) y Accesos.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-magenta text-black text-sm font-bold rounded-btn hover:opacity-90 transition-opacity flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Nuevo Workspace
          </button>
        </div>
      </div>

      <div className="bg-panel border border-border rounded-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text">
            <thead className="bg-panel-2/50 text-xs text-text-dim uppercase font-bold border-b border-border">
              <tr>
                <th className="px-6 py-4">Nombre del Workspace</th>
                <th className="px-6 py-4">Colores de Marca</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clientes?.map(c => (
                <tr key={c.id} className="hover:bg-panel-2/30 transition-colors">
                  <td className="px-6 py-4 font-bold">{c.nombre}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <div className="w-4 h-4 rounded-full border border-border shadow-sm" style={{ backgroundColor: c.color_primario || '#FF2D8B' }}></div>
                      <div className="w-4 h-4 rounded-full border border-border shadow-sm" style={{ backgroundColor: c.color_secundario || '#C4F135' }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {c.activo ? (
                      <span className="text-[10px] px-2 py-1 bg-lime/10 text-lime rounded-full font-bold uppercase tracking-widest">Activo</span>
                    ) : (
                      <span className="text-[10px] px-2 py-1 bg-alert/10 text-alert rounded-full font-bold uppercase tracking-widest">Inactivo</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 bg-panel border border-border rounded hover:bg-panel-2 hover:text-magenta transition-colors" title="Invitar Usuario">
                        <UserPlus className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-panel border border-border rounded hover:bg-panel-2 hover:text-alert transition-colors" title={c.activo ? 'Desactivar' : 'Activar'}>
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
