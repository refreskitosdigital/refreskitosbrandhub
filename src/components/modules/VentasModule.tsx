'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, Phone, MessageSquare, Target } from 'lucide-react';

export function VentasModule({ clienteId, initialData, rol }: { clienteId: string, initialData: any[], rol: string }) {
  const [data, setData] = useState(initialData);
  const [isAdding, setIsAdding] = useState(false);
  const supabase = createClient();

  const [mes, setMes] = useState('');
  const [leadsAds, setLeadsAds] = useState(0);
  const [leadsWa, setLeadsWa] = useState(0);
  const [cerrados, setCerrados] = useState(0);

  const handleSave = async () => {
    if (!mes) return alert('El mes es obligatorio');

    const newVenta = {
      cliente_id: clienteId,
      mes: mes,
      leads_ads: leadsAds,
      leads_whatsapp: leadsWa,
      cerrados: cerrados,
      no_cerrados: (leadsAds + leadsWa) - cerrados
    };

    const { data: inserted, error } = await supabase
      .from('leads')
      .insert([newVenta])
      .select().single();

    if (error) {
      alert('Error guardando ventas: ' + error.message);
    } else {
      const newData = [inserted, ...data].sort((a, b) => new Date(b.mes).getTime() - new Date(a.mes).getTime());
      setData(newData);
      setIsAdding(false);
      setMes(''); setLeadsAds(0); setLeadsWa(0); setCerrados(0);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-syne font-bold text-text">Ventas y Leads</h1>
          <p className="text-text-dim text-sm mt-1">Embudo de conversión y oportunidades.</p>
        </div>
        
        {rol === 'administrador' && (
          <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-magenta text-black text-sm font-bold rounded-btn hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus className="w-4 h-4" /> Registrar Mes
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-panel border border-border rounded-card p-6 mb-6 w-full max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-syne font-bold text-magenta">Registro de Ventas</h3>
            <button onClick={() => setIsAdding(false)} className="text-text-dim hover:text-text"><X className="w-4 h-4"/></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-text-dim block mb-1">Mes / Fecha</label>
              <input type="date" className="w-full bg-black border border-border rounded p-2 text-white" value={mes} onChange={e => setMes(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-text-dim block mb-1">Leads (Instagram Ads)</label>
              <input type="number" className="w-full bg-black border border-border rounded p-2 text-white" value={leadsAds} onChange={e => setLeadsAds(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-text-dim block mb-1">Leads (WhatsApp Directo)</label>
              <input type="number" className="w-full bg-black border border-border rounded p-2 text-white" value={leadsWa} onChange={e => setLeadsWa(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-text-dim block mb-1">Clientes Cerrados (Ventas)</label>
              <input type="number" className="w-full bg-black border border-border rounded p-2 text-white" value={cerrados} onChange={e => setCerrados(Number(e.target.value))} />
            </div>
          </div>
          <button onClick={handleSave} className="w-full py-2 bg-lime text-black font-bold rounded-btn hover:opacity-90">Guardar Embudo</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-8">
        {data.map((lead) => {
          const totalLeads = lead.leads_ads + lead.leads_whatsapp;
          const conversion = totalLeads > 0 ? ((lead.cerrados / totalLeads) * 100).toFixed(1) : 0;

          return (
            <div key={lead.id} className="bg-panel border border-border rounded-card p-6 flex flex-col">
              <h3 className="font-syne font-bold text-lg text-text mb-4 pb-2 border-b border-border/50">
                {new Date(lead.mes).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </h3>

              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-dim text-sm">
                    <Phone className="w-4 h-4" /> WhatsApp
                  </div>
                  <span className="font-bold text-text">{lead.leads_whatsapp} leads</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-text-dim text-sm">
                    <MessageSquare className="w-4 h-4" /> Campaña Ads
                  </div>
                  <span className="font-bold text-text">{lead.leads_ads} leads</span>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-text text-sm font-bold">
                      <Target className="w-4 h-4 text-lime" /> Cerrados
                    </div>
                    <span className="font-syne font-bold text-2xl text-lime">{lead.cerrados}</span>
                  </div>
                  
                  <div className="w-full bg-panel-2 h-2 rounded-full overflow-hidden flex">
                    <div className="bg-lime h-full" style={{ width: `${conversion}%` }}></div>
                    <div className="bg-alert h-full" style={{ width: `${100 - Number(conversion)}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-text-dim mt-2">
                    <span>Tasa de Conversión: {conversion}%</span>
                    <span>No cerrados: {lead.no_cerrados}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {data.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center text-text-dim border border-dashed border-border rounded-card">
            No hay registros de ventas para este cliente.
          </div>
        )}
      </div>
    </div>
  );
}
