'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, Eye, Users, MousePointerClick, Heart } from 'lucide-react';

export function MetricasModule({ clienteId, initialData, rol }: { clienteId: string, initialData: any[], rol: string }) {
  const [data, setData] = useState(initialData);
  const [isAdding, setIsAdding] = useState(false);
  const supabase = createClient();

  const [mes, setMes] = useState('');
  const [visualizaciones, setVisualizaciones] = useState(0);
  const [seguidoresNetos, setSeguidoresNetos] = useState(0);
  const [interacciones, setInteracciones] = useState(0);
  const [visitasPerfil, setVisitasPerfil] = useState(0);
  const [clicsEnlace, setClicsEnlace] = useState(0);

  const handleSave = async () => {
    if (!mes) return alert('El mes es obligatorio');

    const newMetrica = {
      cliente_id: clienteId,
      mes: mes,
      visualizaciones,
      seguidores_nuevos: seguidoresNetos,
      interacciones,
      visitas_perfil: visitasPerfil,
      clics_enlace: clicsEnlace
    };

    const { data: inserted, error } = await supabase
      .from('metricas_mensuales')
      .insert([newMetrica])
      .select().single();

    if (error) {
      alert('Error guardando métricas: ' + error.message);
    } else {
      // Sort por fecha descendente
      const newData = [inserted, ...data].sort((a, b) => new Date(b.mes).getTime() - new Date(a.mes).getTime());
      setData(newData);
      setIsAdding(false);
      setMes(''); setVisualizaciones(0); setSeguidoresNetos(0); setInteracciones(0); setVisitasPerfil(0); setClicsEnlace(0);
    }
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (!previous) return { val: 0, text: '0%', up: true };
    const change = ((current - previous) / previous) * 100;
    return {
      val: change,
      text: `${Math.abs(change).toFixed(1)}%`,
      up: change >= 0
    };
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-syne font-bold text-text">Métricas Mensuales</h1>
          <p className="text-text-dim text-sm mt-1">Comparativa y crecimiento de la cuenta.</p>
        </div>
        
        {rol === 'administrador' && (
          <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-magenta text-black text-sm font-bold rounded-btn hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus className="w-4 h-4" /> Registrar Mes
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-panel border border-border rounded-card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-syne font-bold text-magenta">Nuevas Métricas</h3>
            <button onClick={() => setIsAdding(false)} className="text-text-dim hover:text-text"><X className="w-4 h-4"/></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs text-text-dim block mb-1">Mes / Fecha</label>
              <input type="date" className="w-full bg-black border border-border rounded p-2 text-white" value={mes} onChange={e => setMes(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-text-dim block mb-1">Visualizaciones</label>
              <input type="number" className="w-full bg-black border border-border rounded p-2 text-white" value={visualizaciones} onChange={e => setVisualizaciones(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-text-dim block mb-1">Seguidores Netos (+)</label>
              <input type="number" className="w-full bg-black border border-border rounded p-2 text-white" value={seguidoresNetos} onChange={e => setSeguidoresNetos(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-text-dim block mb-1">Interacciones</label>
              <input type="number" className="w-full bg-black border border-border rounded p-2 text-white" value={interacciones} onChange={e => setInteracciones(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-text-dim block mb-1">Visitas al Perfil</label>
              <input type="number" className="w-full bg-black border border-border rounded p-2 text-white" value={visitasPerfil} onChange={e => setVisitasPerfil(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-text-dim block mb-1">Clics en Enlace</label>
              <input type="number" className="w-full bg-black border border-border rounded p-2 text-white" value={clicsEnlace} onChange={e => setClicsEnlace(Number(e.target.value))} />
            </div>
          </div>
          <button onClick={handleSave} className="w-full py-2 bg-lime text-black font-bold rounded-btn hover:opacity-90">Guardar Métricas</button>
        </div>
      )}

      <div className="space-y-8 overflow-y-auto pb-8">
        {data.map((metrica, index) => {
          const previousMonth = data[index + 1]; // Al estar ordenados descendentemente
          const visChange = getPercentageChange(metrica.visualizaciones, previousMonth?.visualizaciones);
          const segChange = getPercentageChange(metrica.seguidores_nuevos, previousMonth?.seguidores_nuevos);
          const intChange = getPercentageChange(metrica.interacciones, previousMonth?.interacciones);

          return (
            <div key={metrica.id} className="bg-panel border border-border rounded-card p-6">
              <h3 className="font-syne font-bold text-xl text-text mb-6 pb-2 border-b border-border/50">
                Reporte: {new Date(metrica.mes).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-panel-2/30 rounded p-4 border border-border">
                  <div className="flex items-center gap-2 text-text-dim mb-2"><Eye className="w-4 h-4" /> Visualizaciones</div>
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-syne font-bold text-text">{metrica.visualizaciones?.toLocaleString()}</span>
                    {previousMonth && (
                      <span className={`text-sm font-bold pb-1 ${visChange.up ? 'text-lime' : 'text-alert'}`}>
                        {visChange.up ? '↑' : '↓'} {visChange.text}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-panel-2/30 rounded p-4 border border-border">
                  <div className="flex items-center gap-2 text-text-dim mb-2"><Users className="w-4 h-4" /> Seguidores Netos</div>
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-syne font-bold text-text">+{metrica.seguidores_nuevos?.toLocaleString()}</span>
                    {previousMonth && (
                      <span className={`text-sm font-bold pb-1 ${segChange.up ? 'text-lime' : 'text-alert'}`}>
                        {segChange.up ? '↑' : '↓'} {segChange.text}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-panel-2/30 rounded p-4 border border-border">
                  <div className="flex items-center gap-2 text-text-dim mb-2"><Heart className="w-4 h-4" /> Interacciones</div>
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-syne font-bold text-text">{metrica.interacciones?.toLocaleString()}</span>
                    {previousMonth && (
                      <span className={`text-sm font-bold pb-1 ${intChange.up ? 'text-lime' : 'text-alert'}`}>
                        {intChange.up ? '↑' : '↓'} {intChange.text}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-border rounded p-4 flex justify-between items-center bg-black/20">
                  <span className="text-text-dim font-bold uppercase text-xs tracking-wider">Visitas al Perfil</span>
                  <span className="text-xl font-syne font-bold text-magenta">{metrica.visitas_perfil?.toLocaleString()}</span>
                </div>
                <div className="border border-border rounded p-4 flex justify-between items-center bg-black/20">
                  <div className="flex items-center gap-2">
                    <MousePointerClick className="w-4 h-4 text-text-dim" />
                    <span className="text-text-dim font-bold uppercase text-xs tracking-wider">Toques en el enlace</span>
                  </div>
                  <span className="text-xl font-syne font-bold text-magenta">{metrica.clics_enlace?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}

        {data.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center text-text-dim border border-dashed border-border rounded-card">
            No hay métricas registradas para este cliente.
          </div>
        )}
      </div>
    </div>
  );
}
