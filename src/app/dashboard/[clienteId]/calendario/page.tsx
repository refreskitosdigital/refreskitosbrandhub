import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function CalendarioPage({ params }: { params: { clienteId: string } }) {
  const supabase = createClient();
  const { data: cliente } = await supabase.from('clientes').select('nombre').eq('id', params.clienteId).single();
  if (!cliente) notFound();

  // Traer tareas del mes actual (simplificado)
  const { data: tareas } = await supabase
    .from('tareas_calendario')
    .select('*')
    .eq('cliente_id', params.clienteId)
    .order('fecha', { ascending: true });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-syne font-bold text-text">Calendario de Contenidos</h1>
          <p className="text-text-dim text-sm mt-1">Gestión de fechas de entrega y publicación.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex bg-panel-2 rounded-btn p-1 border border-border">
            <button className="px-3 py-1 bg-panel text-text text-sm rounded-md font-medium shadow-sm">Mes</button>
            <button className="px-3 py-1 text-text-dim hover:text-text text-sm rounded-md font-medium transition-colors">Lista</button>
          </div>
          <button className="px-4 py-2 bg-magenta text-black text-sm font-bold rounded-btn hover:opacity-90 transition-opacity">
            + Nueva Tarea
          </button>
        </div>
      </div>

      <div className="flex-1 bg-panel border border-border rounded-card p-6 flex flex-col">
        {/* Encabezado días semana */}
        <div className="grid grid-cols-7 gap-4 mb-4 text-center">
          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => (
            <div key={dia} className="text-xs font-bold text-text-dim uppercase tracking-wider">{dia}</div>
          ))}
        </div>
        
        {/* Grid de días (Mock 35 días) */}
        <div className="grid grid-cols-7 gap-4 flex-1">
          {Array.from({ length: 35 }).map((_, i) => {
            const isToday = i === 14; // Mock today
            return (
              <div key={i} className={`border rounded-lg p-2 flex flex-col gap-2 min-h-[120px] transition-colors ${isToday ? 'border-magenta bg-magenta/5' : 'border-border bg-panel-2/50'}`}>
                <div className={`text-xs font-bold ${isToday ? 'text-magenta' : 'text-text-dim'}`}>
                  {(i % 31) + 1}
                </div>
                {/* Mock Task */}
                {i === 14 && (
                  <div className="bg-panel border-l-2 border-magenta p-2 rounded text-xs flex flex-col gap-1 cursor-pointer hover:border-l-4 transition-all">
                    <span className="font-bold text-text truncate">Reels Promo</span>
                    <span className="text-text-dim">Alta</span>
                  </div>
                )}
                {i === 16 && (
                  <div className="bg-panel border-l-2 border-lime p-2 rounded text-xs flex flex-col gap-1 cursor-pointer hover:border-l-4 transition-all">
                    <span className="font-bold text-text truncate">Carrusel Testimonios</span>
                    <span className="text-text-dim">Media</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
