'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, FileText, Download, CheckCircle2 } from 'lucide-react';

export function PresupuestoModule({ clienteId, initialData, rol }: { clienteId: string, initialData: any[], rol: string }) {
  const [data, setData] = useState(initialData);
  const [isAdding, setIsAdding] = useState(false);
  const supabase = createClient();

  // Form states
  const [numeroNota, setNumeroNota] = useState('');
  const [mes, setMes] = useState('');
  const [servicio, setServicio] = useState('');
  const [monto, setMonto] = useState('');

  const handleSave = async () => {
    if (!numeroNota || !mes || !servicio || !monto) return alert('Llena todos los campos');

    // 1. Crear el presupuesto (Nota)
    const { data: newPresupuesto, error: err1 } = await supabase
      .from('presupuestos')
      .insert([{ cliente_id: clienteId, mes: mes, estado: 'pendiente', numero_nota: numeroNota }])
      .select().single();

    if (err1) return alert('Error al crear nota: ' + err1.message);

    // 2. Crear el item de servicio
    const { error: err2 } = await supabase
      .from('presupuesto_items')
      .insert([{ presupuesto_id: newPresupuesto.id, nombre: servicio, tipo: 'adicional', cantidad: 1, precio_unitario: Number(monto) }]);

    if (err2) return alert('Error al crear ítem: ' + err2.message);

    // Refresh data local
    const newItem = {
      ...newPresupuesto,
      presupuesto_items: [{ nombre: servicio, precio_unitario: Number(monto), cantidad: 1 }]
    };
    
    setData([newItem, ...data]);
    setIsAdding(false);
    setNumeroNota(''); setMes(''); setServicio(''); setMonto('');
  };

  const handlePagar = async (id: string) => {
    const { error } = await supabase.from('presupuestos').update({ estado: 'pagado' }).eq('id', id);
    if (!error) {
      setData(data.map(d => d.id === id ? { ...d, estado: 'pagado' } : d));
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-syne font-bold text-text">Presupuestos y Notas de Entrega</h1>
          <p className="text-text-dim text-sm mt-1">Historial de facturación y pagos pendientes.</p>
        </div>
        
        {rol === 'administrador' && (
          <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-magenta text-black text-sm font-bold rounded-btn hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus className="w-4 h-4" /> Generar Nota de Entrega
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-panel border border-border rounded-card p-6 mb-6">
          <h3 className="font-syne font-bold mb-4 text-magenta">Nueva Nota de Entrega</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-xs text-text-dim block mb-1">N° de Nota (Ej: 001)</label>
              <input type="text" className="w-full bg-black border border-border rounded p-2" value={numeroNota} onChange={e => setNumeroNota(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-text-dim block mb-1">Fecha / Mes</label>
              <input type="date" className="w-full bg-black border border-border rounded p-2 text-white" value={mes} onChange={e => setMes(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-text-dim block mb-1">Servicio Realizado</label>
              <input type="text" placeholder="Ej: Campaña Ads" className="w-full bg-black border border-border rounded p-2" value={servicio} onChange={e => setServicio(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-text-dim block mb-1">Monto ($)</label>
              <input type="number" className="w-full bg-black border border-border rounded p-2" value={monto} onChange={e => setMonto(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-transparent text-text border border-border rounded">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 bg-lime text-black font-bold rounded">Guardar y Enviar Alerta</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((nota) => {
          const items = nota.presupuesto_items || [];
          const total = items.reduce((acc: number, item: any) => acc + (Number(item.precio_unitario) * Number(item.cantidad)), 0);
          
          return (
            <div key={nota.id} className={`bg-panel border rounded-card p-6 relative overflow-hidden transition-all ${nota.estado === 'pendiente' ? 'border-alert/50 shadow-[0_0_15px_rgba(230,0,0,0.1)]' : 'border-border'}`}>
              
              {nota.estado === 'pendiente' ? (
                <div className="absolute top-4 right-4 bg-alert/10 text-alert px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
                  Pendiente de Pago
                </div>
              ) : (
                <div className="absolute top-4 right-4 bg-lime/10 text-lime px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Pagado
                </div>
              )}

              <div className="flex items-center gap-3 mb-6 mt-2">
                <div className="w-10 h-10 rounded bg-panel-2 flex items-center justify-center text-text-dim">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-syne font-bold text-lg text-text">Nota N° {nota.numero_nota || '000'}</h3>
                  <p className="text-xs text-text-dim">{new Date(nota.mes).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
                    <span className="text-text-dim">{item.nombre}</span>
                    <span className="font-bold text-text">${item.precio_unitario}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-end mt-auto pt-4">
                <div>
                  <span className="block text-xs text-text-dim font-bold uppercase mb-1">Total a Pagar</span>
                  <span className="font-syne font-bold text-3xl text-magenta">${total}</span>
                </div>
                
                {rol === 'administrador' && nota.estado === 'pendiente' && (
                  <button onClick={() => handlePagar(nota.id)} className="text-xs bg-lime text-black font-bold px-3 py-2 rounded hover:opacity-90">
                    Marcar Pagado
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {data.length === 0 && (
          <div className="col-span-full py-12 text-center text-text-dim border border-dashed border-border rounded-card">
            No hay notas de entrega generadas para este cliente.
          </div>
        )}
      </div>
    </div>
  );
}
