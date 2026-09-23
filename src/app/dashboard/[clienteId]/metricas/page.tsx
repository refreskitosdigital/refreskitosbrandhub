import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { TrendingUp, BarChart3, Plus } from 'lucide-react';

export default async function MetricasPage({ params }: { params: { clienteId: string } }) {
  const supabase = createClient();
  const { data: cliente } = await supabase.from('clientes').select('nombre').eq('id', params.clienteId).single();
  if (!cliente) notFound();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-syne font-bold text-text">Métricas y ADS</h1>
          <p className="text-text-dim text-sm mt-1">Rendimiento mensual e inversión publicitaria.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-magenta text-black text-sm font-bold rounded-btn hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus className="w-4 h-4" /> Registrar Métricas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-panel border border-border rounded-card p-5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-dim text-xs font-bold uppercase tracking-wider">Alcance Total</span>
            <span className="p-1.5 bg-panel-2 rounded-md"><BarChart3 className="w-4 h-4" /></span>
          </div>
          <div className="text-3xl font-syne font-bold mt-2 text-text">45.2K</div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-lime text-xs font-bold flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> 12.5%</span>
            <span className="text-xs text-text-dim">vs anterior</span>
          </div>
        </div>

        <div className="bg-panel border border-border rounded-card p-5">
          <div className="flex justify-between items-start mb-2">
            <span className="text-text-dim text-xs font-bold uppercase tracking-wider">Engagement</span>
            <span className="p-1.5 bg-panel-2 rounded-md"><BarChart3 className="w-4 h-4" /></span>
          </div>
          <div className="text-3xl font-syne font-bold mt-2 text-text">4.8%</div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-alert text-xs font-bold flex items-center">↓ 0.5%</span>
            <span className="text-xs text-text-dim">vs anterior</span>
          </div>
        </div>
      </div>

      <div className="bg-panel border border-border rounded-card p-6">
        <h3 className="font-syne font-bold text-lg mb-6 text-text">Ficha Técnica de ADS</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text">
            <thead className="bg-panel-2/50 text-xs text-text-dim uppercase font-bold border-b border-border">
              <tr>
                <th className="px-6 py-4">Nombre de Campaña</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fechas</th>
                <th className="px-6 py-4 text-right">Monto Diario</th>
                <th className="px-6 py-4 text-right">Inversión Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-panel-2/30 transition-colors">
                <td className="px-6 py-4 font-bold">Promo Keratina Octubre</td>
                <td className="px-6 py-4"><span className="text-xs px-2 py-1 bg-lime/10 text-lime rounded-full font-bold">Activo</span></td>
                <td className="px-6 py-4 text-text-dim text-xs">01 Oct - 31 Oct</td>
                <td className="px-6 py-4 text-right">$10.00</td>
                <td className="px-6 py-4 text-right font-bold">$150.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
