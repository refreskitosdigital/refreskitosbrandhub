import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ImagePlus, ExternalLink } from 'lucide-react';

export default async function EvidenciasPage({ params }: { params: { clienteId: string } }) {
  const supabase = createClient();
  const { data: cliente } = await supabase.from('clientes').select('nombre').eq('id', params.clienteId).single();
  if (!cliente) notFound();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-syne font-bold text-text">Evidencias y Captures</h1>
          <p className="text-text-dim text-sm mt-1">Historial visual de publicaciones por mes y red social.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-magenta text-black text-sm font-bold rounded-btn hover:opacity-90 transition-opacity flex items-center gap-2">
            <ImagePlus className="w-4 h-4" /> Subir Evidencia
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <select className="bg-panel border border-border text-text text-sm rounded-btn px-4 py-2 focus:outline-none focus:border-magenta">
          <option>Octubre 2023</option>
          <option>Septiembre 2023</option>
        </select>
        <select className="bg-panel border border-border text-text text-sm rounded-btn px-4 py-2 focus:outline-none focus:border-magenta">
          <option>Todas las redes</option>
          <option>Instagram</option>
          <option>Facebook</option>
          <option>TikTok</option>
          <option>LinkedIn</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Mock Card Evidencia */}
        <div className="bg-panel border border-border rounded-card overflow-hidden group cursor-pointer hover:border-magenta transition-colors relative">
          <div className="aspect-square bg-panel-2 flex items-center justify-center relative">
            <span className="text-text-dim/30">Imagen / Captura</span>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <span className="bg-black/80 text-text text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">Ver Ampliado</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-magenta bg-magenta/10 px-2 py-0.5 rounded">Instagram</span>
              <span className="text-xs text-text-dim">12 Oct</span>
            </div>
            <a href="#" className="text-sm font-bold hover:text-magenta transition-colors flex items-center gap-1 mt-2">
              Ver Publicación <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
