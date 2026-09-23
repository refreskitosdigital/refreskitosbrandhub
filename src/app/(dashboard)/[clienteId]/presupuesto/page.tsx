import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { FileDown, Plus } from 'lucide-react';

export default async function PresupuestoPage({ params }: { params: { clienteId: string } }) {
  const supabase = createClient();
  const { data: cliente } = await supabase.from('clientes').select('nombre').eq('id', params.clienteId).single();
  if (!cliente) notFound();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-syne font-bold text-text">Presupuesto y Facturación</h1>
          <p className="text-text-dim text-sm mt-1">Control de pagos mensuales.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-panel-2 text-text text-sm font-medium rounded-btn border border-border hover:border-text-dim transition-colors flex items-center gap-2">
            <FileDown className="w-4 h-4" /> Descargar PDF
          </button>
          <button className="px-4 py-2 bg-magenta text-black text-sm font-bold rounded-btn hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus className="w-4 h-4" /> Agregar Ítem
          </button>
        </div>
      </div>

      <div className="bg-panel border border-border rounded-card overflow-hidden">
        {/* Header Resumen */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-panel-2/30">
          <div>
            <div className="text-sm font-bold text-text-dim uppercase tracking-wider mb-1">Total Mes Actual</div>
            <div className="text-3xl font-syne font-bold text-text">$850.00 <span className="text-sm text-text-dim font-sans ml-2">USD</span></div>
          </div>
          <div className="text-right">
            <span className="bg-lime/15 text-lime border border-lime/30 px-3 py-1 rounded-badge text-xs font-bold uppercase tracking-widest inline-block mb-2">Pagado</span>
            <div className="text-xs text-text-dim flex items-center gap-2 justify-end">
              <span>Tasa BCV:</span>
              <input type="text" placeholder="36.50" className="w-16 bg-black border border-border rounded px-2 py-1 text-right focus:border-magenta focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text">
            <thead className="bg-panel-2/50 text-xs text-text-dim uppercase font-bold border-b border-border">
              <tr>
                <th className="px-6 py-4">Descripción del Servicio</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 text-center">Cant.</th>
                <th className="px-6 py-4 text-right">Precio Unit.</th>
                <th className="px-6 py-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-panel-2/30 transition-colors">
                <td className="px-6 py-4 font-medium">Gestión de Redes Sociales (Plan Pro)</td>
                <td className="px-6 py-4"><span className="text-xs px-2 py-1 bg-magenta/10 text-magenta rounded">Recurrente</span></td>
                <td className="px-6 py-4 text-center">1</td>
                <td className="px-6 py-4 text-right">$500.00</td>
                <td className="px-6 py-4 text-right font-bold">$500.00</td>
              </tr>
              <tr className="hover:bg-panel-2/30 transition-colors">
                <td className="px-6 py-4 font-medium">Campaña ADS Facebook/IG</td>
                <td className="px-6 py-4"><span className="text-xs px-2 py-1 bg-panel-2 text-text-dim border border-border rounded">Adicional</span></td>
                <td className="px-6 py-4 text-center">1</td>
                <td className="px-6 py-4 text-right">$350.00</td>
                <td className="px-6 py-4 text-right font-bold">$350.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
