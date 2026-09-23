import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function ParrillaPage({ params }: { params: { clienteId: string } }) {
  const supabase = createClient();
  const { data: cliente } = await supabase.from('clientes').select('nombre').eq('id', params.clienteId).single();
  if (!cliente) notFound();

  const columnas = ['Idea', 'Guion', 'Diseño', 'Aprobado', 'Publicado'];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-syne font-bold text-text">Parrilla de Contenidos</h1>
          <p className="text-text-dim text-sm mt-1">Kanban mensual de publicaciones.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-magenta text-black text-sm font-bold rounded-btn hover:opacity-90 transition-opacity">
            + Nuevo Contenido
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 scrollbar-minimal">
        {columnas.map(col => (
          <div key={col} className="w-72 shrink-0 flex flex-col bg-panel border border-border rounded-card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-syne font-bold text-sm text-text">{col}</h3>
              <span className="bg-panel-2 text-text-dim text-xs px-2 py-0.5 rounded-full font-bold">0</span>
            </div>
            
            <div className="p-3 flex-1 overflow-y-auto space-y-3 scrollbar-minimal">
              {/* Ejemplo Mock Card (se repetiría para data real) */}
              {col === 'Idea' && (
                <div className="bg-panel-2 border border-transparent hover:border-magenta/50 p-4 rounded-lg cursor-grab active:cursor-grabbing transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-magenta bg-magenta/10 px-2 py-1 rounded">Reel</span>
                    <button className="text-text-dim opacity-0 group-hover:opacity-100 hover:text-text transition-all">⋯</button>
                  </div>
                  <h4 className="font-bold text-sm text-text mb-2 line-clamp-2">5 Beneficios de la Keratina</h4>
                  <p className="text-xs text-text-dim line-clamp-2">Objetivo: Educativo y captación de leads.</p>
                  
                  {/* Acciones para Cliente */}
                  <div className="mt-3 pt-3 border-t border-border flex justify-between">
                    <button className="text-xs text-text-dim hover:text-magenta transition-colors">💬 0 Comentarios</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
