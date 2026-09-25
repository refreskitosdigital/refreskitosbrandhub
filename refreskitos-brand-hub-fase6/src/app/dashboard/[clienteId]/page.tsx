import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function ClienteDashboard({ params }: { params: { clienteId: string } }) {
  const supabase = createClient();

  // Validar acceso (RLS protege, pero hacemos query igual)
  const { data: cliente, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', params.clienteId)
    .single();

  if (error || !cliente) {
    notFound();
  }

  // Traer KPIs de ejemplo
  const { count: tareasPendientes } = await supabase
    .from('tareas_calendario')
    .select('id', { count: 'exact' })
    .eq('cliente_id', cliente.id)
    .eq('estado', 'pendiente');

  // En una app real, traeríamos presupuesto y métricas filtradas por mes
  // Por ahora, mostraremos la UI base
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-syne font-bold text-text">Dashboard General</h1>
          <p className="text-text-dim text-sm mt-1">Resumen mensual de gestión para <strong className="text-magenta">{cliente.nombre}</strong></p>
        </div>
        
        {/* Este bloque solo debe ser usable por el Admin. 
            Podemos obtener el rol en el cliente o pasarlo. Por simplicidad, se puede validar en UI */}
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-magenta text-black text-sm font-bold rounded-btn hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(255,45,139,0.3)]">
            + Nueva Tarea
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-panel border border-border rounded-card p-5 hover:border-magenta/50 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-dim text-xs font-bold uppercase tracking-wider">Tareas Pendientes</span>
            <span className="p-1.5 bg-panel-2 rounded-md">📋</span>
          </div>
          <div className="text-3xl font-syne font-bold mt-2 text-text">{tareasPendientes || 0}</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-text-dim">Esta semana</span>
          </div>
        </div>

        <div className="bg-panel border border-border rounded-card p-5 hover:border-lime/50 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-dim text-xs font-bold uppercase tracking-wider">Presupuesto</span>
            <span className="p-1.5 bg-panel-2 rounded-md">💰</span>
          </div>
          <div className="text-3xl font-syne font-bold mt-2 text-text">$0</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-text-dim">Mes actual</span>
          </div>
        </div>
      </div>
      
      {/* Sección Tareas */}
      <div className="bg-panel border border-border rounded-card p-6">
        <h3 className="font-syne font-bold text-lg mb-6 text-text">Tareas Recientes</h3>
        <div className="text-sm text-text-dim text-center py-10 border border-dashed border-border rounded-lg">
          No hay tareas pendientes por el momento.
        </div>
      </div>
    </div>
  );
}
