'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, FileText, CheckCircle2, X, Trash2 } from 'lucide-react';

export function PresupuestoModule({ clienteId, initialData, rol, clientesGlobales }: { clienteId?: string, initialData: any[], rol: string, clientesGlobales?: any[] }) {
  const [data, setData] = useState(initialData);
  const [isAdding, setIsAdding] = useState(false);
  const supabase = createClient();

  // Generar proximo numero de nota asumiendo longitud
  const nextNota = String(data.length + 1).padStart(3, '0');

  const [numeroNota, setNumeroNota] = useState(nextNota);
  const [fecha, setFecha] = useState('');
  const [selectedCliente, setSelectedCliente] = useState(clienteId || '');
  
  // Servicios dinámicos
  const [items, setItems] = useState([{ servicio: '', monto: '' }]);
  
  // Descuentos
  const [aplicarDescuento, setAplicarDescuento] = useState(false);
  const [descuentoMonto, setDescuentoMonto] = useState('');

  const calcularTotal = () => items.reduce((acc, it) => acc + Number(it.monto || 0), 0);
  const totalFacturado = calcularTotal();
  const totalFinal = aplicarDescuento ? totalFacturado - Number(descuentoMonto || 0) : totalFacturado;

  const handleAddItem = () => setItems([...items, { servicio: '', monto: '' }]);
  const handleRemoveItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: string, val: string) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: val };
    setItems(newItems);
  };

  const handleSave = async () => {
    if (!numeroNota || !fecha || !selectedCliente || items.some(i => !i.servicio || !i.monto)) {
      return alert('Completa todos los campos obligatorios y los servicios.');
    }

    // 1. Crear el presupuesto
    const { data: newPresupuesto, error: err1 } = await supabase
      .from('presupuestos')
      .insert([{ 
        cliente_id: selectedCliente, 
        mes: fecha, 
        estado: 'pendiente', 
        numero_nota: numeroNota,
        descuento: aplicarDescuento ? Number(descuentoMonto) : 0
      }])
      .select('*, clientes(nombre)').single();

    if (err1) return alert('Error al crear factura: ' + err1.message);

    // 2. Insertar todos los items
    const itemsToInsert = items.map(it => ({
      presupuesto_id: newPresupuesto.id,
      nombre: it.servicio,
      tipo: 'adicional',
      cantidad: 1,
      precio_unitario: Number(it.monto)
    }));

    const { error: err2 } = await supabase.from('presupuesto_items').insert(itemsToInsert);
    if (err2) return alert('Error al crear ítems: ' + err2.message);

    const newItemFull = { ...newPresupuesto, presupuesto_items: itemsToInsert };
    setData([newItemFull, ...data]);
    setIsAdding(false);
    
    // Reset
    setItems([{ servicio: '', monto: '' }]);
    setFecha('');
    setNumeroNota(String(data.length + 2).padStart(3, '0'));
    setAplicarDescuento(false); setDescuentoMonto('');
  };

  const handlePagar = async (id: string) => {
    const { error } = await supabase.from('presupuestos').update({ estado: 'pagado' }).eq('id', id);
    if (!error) setData(data.map(d => d.id === id ? { ...d, estado: 'pagado' } : d));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-syne font-bold text-text">Facturación de la Agencia</h1>
          <p className="text-text-dim text-sm mt-1">Generador de fichas técnicas y notas de entrega.</p>
        </div>
        
        {rol === 'administrador' && (
          <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-magenta text-black text-sm font-bold rounded-btn hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nueva Ficha Técnica
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-panel border border-border rounded-card p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-syne font-bold text-xl text-magenta">Ficha Técnica / Factura</h3>
            <button onClick={() => setIsAdding(false)} className="text-text-dim hover:text-text"><X className="w-5 h-5"/></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="text-xs text-text-dim block mb-1 font-bold uppercase">N° de Nota</label>
              <input type="text" className="w-full bg-black border border-border rounded p-2" value={numeroNota} onChange={e => setNumeroNota(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-text-dim block mb-1 font-bold uppercase">Fecha de Emisión</label>
              <input type="date" className="w-full bg-black border border-border rounded p-2 text-white" value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>
            {clientesGlobales && (
              <div>
                <label className="text-xs text-text-dim block mb-1 font-bold uppercase">Cliente</label>
                <select className="w-full bg-black border border-border rounded p-2 text-white" value={selectedCliente} onChange={e => setSelectedCliente(e.target.value)}>
                  <option value="" disabled>Selecciona el cliente...</option>
                  {clientesGlobales.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="mb-6 p-4 border border-border bg-panel-2/30 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-syne font-bold text-text">Servicios</h4>
              <button onClick={handleAddItem} className="text-xs bg-panel border border-border text-text px-3 py-1 rounded flex items-center gap-1 hover:border-magenta transition-colors">
                <Plus className="w-3 h-3" /> Agregar Ítem
              </button>
            </div>
            
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <input type="text" placeholder="Ej: Creación de contenidos" className="flex-1 bg-black border border-border rounded p-2 text-sm" value={item.servicio} onChange={e => updateItem(idx, 'servicio', e.target.value)} />
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-text-dim text-sm">$</span>
                    <input type="number" placeholder="0.00" className="w-32 bg-black border border-border rounded p-2 pl-7 text-sm" value={item.monto} onChange={e => updateItem(idx, 'monto', e.target.value)} />
                  </div>
                  {items.length > 1 && (
                    <button onClick={() => handleRemoveItem(idx)} className="p-2 text-text-dim hover:text-alert"><Trash2 className="w-4 h-4"/></button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
            <div className="bg-panel-2/50 p-4 rounded-lg border border-border flex-1">
              <label className="flex items-center gap-2 text-sm font-bold text-text mb-3 cursor-pointer">
                <input type="checkbox" checked={aplicarDescuento} onChange={e => setAplicarDescuento(e.target.checked)} className="rounded border-border bg-black text-magenta focus:ring-magenta" />
                Aplicar descuento de afiliado
              </label>
              {aplicarDescuento && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-dim uppercase font-bold">Monto a descontar:</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1.5 text-text-dim text-sm">$</span>
                    <input type="number" className="w-24 bg-black border border-border rounded py-1 px-2 pl-7 text-sm" value={descuentoMonto} onChange={e => setDescuentoMonto(e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            <div className="text-right flex-1 w-full md:w-auto">
              <div className="text-sm text-text-dim mb-1">Total Servicios: ${totalFacturado}</div>
              {aplicarDescuento && <div className="text-sm text-lime mb-1">Descuento: -${descuentoMonto || 0}</div>}
              <div className="font-syne font-bold text-3xl text-magenta border-t border-border/50 pt-2 mt-2">
                Total a Pagar: ${totalFinal}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 bg-transparent text-text border border-border rounded">Cancelar</button>
            <button onClick={handleSave} className="px-6 py-2 bg-lime text-black font-bold rounded">Generar Factura</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((nota) => {
          const items = nota.presupuesto_items || [];
          const subtotal = items.reduce((acc: number, item: any) => acc + (Number(item.precio_unitario) * Number(item.cantidad)), 0);
          const desc = Number(nota.descuento || 0);
          const final = subtotal - desc;
          const isPendiente = nota.estado === 'pendiente';
          
          return (
            <div key={nota.id} className={`bg-panel border rounded-card p-6 flex flex-col relative overflow-hidden transition-all ${isPendiente ? 'border-alert/50 shadow-[0_0_15px_rgba(230,0,0,0.1)]' : 'border-border'}`}>
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${isPendiente ? 'bg-alert/10 text-alert animate-pulse' : 'bg-lime/10 text-lime'}`}>
                {!isPendiente && <CheckCircle2 className="w-3 h-3" />} {isPendiente ? 'Pendiente' : 'Pagado'}
              </div>

              <div className="flex items-center gap-3 mb-6 mt-2">
                <div className="w-10 h-10 rounded bg-panel-2 flex items-center justify-center text-text-dim">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-syne font-bold text-lg text-text">Factura N° {nota.numero_nota || '000'}</h3>
                  <p className="text-xs text-text-dim font-bold">{nota.clientes?.nombre || 'Cliente'}</p>
                  <p className="text-xs text-text-dim/70">{new Date(nota.mes).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="text-[10px] font-bold text-text-dim uppercase tracking-widest border-b border-border/50 pb-1 mb-2">Servicios</div>
                {items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-text-dim">{item.nombre}</span>
                    <span className="font-bold text-text">${item.precio_unitario}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-border">
                {desc > 0 && (
                  <>
                    <div className="flex justify-between text-xs text-text-dim mb-1"><span>Subtotal:</span> <span>${subtotal}</span></div>
                    <div className="flex justify-between text-xs text-lime mb-2"><span>Descuento aplicado:</span> <span>-${desc}</span></div>
                  </>
                )}
                <div className="flex justify-between items-end">
                  <div>
                    <span className="block text-xs text-text-dim font-bold uppercase mb-1">Monto Total</span>
                    <span className="font-syne font-bold text-3xl text-magenta">${final}</span>
                  </div>
                  {rol === 'administrador' && isPendiente && (
                    <button onClick={() => handlePagar(nota.id)} className="text-xs bg-lime text-black font-bold px-3 py-2 rounded hover:opacity-90">Marcar Pagado</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
