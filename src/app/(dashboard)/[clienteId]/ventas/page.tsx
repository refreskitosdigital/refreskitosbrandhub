import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Target, Users, Filter } from 'lucide-react';

export default async function VentasPage({ params }: { params: { clienteId: string } }) {
  const supabase = createClient();
  const { data: cliente } = await supabase.from('clientes').select('nombre').eq('id', params.clienteId).single();
  if (!cliente) notFound();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-syne font-bold text-text">Ventas y Leads</h1>
          <p className="text-text-dim text-sm mt-1">Embudo de conversión y servicios vendidos.</p>
        </div>
      </div>

      {/* Funnel / KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-panel border border-border rounded-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-panel-2"></div>
          <span className="text-text-dim text-xs font-bold uppercase tracking-wider mb-2">Leads ADS</span>
          <span className="text-4xl font-syne font-bold text-text">120</span>
        </div>
        
        <div className="bg-panel border border-border rounded-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-magenta/50"></div>
          <span className="text-text-dim text-xs font-bold uppercase tracking-wider mb-2">Leads WhatsApp</span>
          <span className="text-4xl font-syne font-bold text-text">45</span>
          <span className="text-[10px] text-text-dim mt-2 bg-panel-2 px-2 py-1 rounded">37.5% pasaron</span>
        </div>

        <div className="bg-panel border border-border rounded-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-lime"></div>
          <span className="text-text-dim text-xs font-bold uppercase tracking-wider mb-2">Cerrados</span>
          <span className="text-4xl font-syne font-bold text-lime">15</span>
          <span className="text-[10px] text-text-dim mt-2 bg-panel-2 px-2 py-1 rounded">33.3% conversión final</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-panel border border-border rounded-card p-6">
          <h3 className="font-syne font-bold text-lg mb-6 text-text flex items-center gap-2">
            <Filter className="w-5 h-5 text-magenta" /> Servicios Vendidos
          </h3>
          <ul className="space-y-4">
            <li className="flex items-center justify-between p-3 bg-panel-2/50 rounded-lg border border-border">
              <span className="font-bold text-sm text-text">Balayage Completo</span>
              <span className="bg-panel text-text-dim text-xs px-3 py-1 rounded-full border border-border">8 vendidos</span>
            </li>
            <li className="flex items-center justify-between p-3 bg-panel-2/50 rounded-lg border border-border">
              <span className="font-bold text-sm text-text">Keratina</span>
              <span className="bg-panel text-text-dim text-xs px-3 py-1 rounded-full border border-border">7 vendidos</span>
            </li>
          </ul>
        </div>

        <div className="bg-panel border border-border rounded-card p-6">
          <h3 className="font-syne font-bold text-lg mb-6 text-text flex items-center gap-2">
            <Users className="w-5 h-5 text-lime" /> Tipos de Cliente
          </h3>
          <div className="flex gap-4 h-32 items-end justify-center pt-8">
            {/* Gráfico de barras simple CSS */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 bg-magenta/80 rounded-t-sm" style={{ height: '80%' }}></div>
              <span className="text-xs text-text-dim font-bold">Nuevos (10)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 bg-lime/80 rounded-t-sm" style={{ height: '40%' }}></div>
              <span className="text-xs text-text-dim font-bold">Recurrentes (5)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
