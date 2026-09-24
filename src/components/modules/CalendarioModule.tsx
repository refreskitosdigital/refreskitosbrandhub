'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, X } from 'lucide-react';

export function CalendarioModule({ clienteId, initialData, rol, clientesGlobales }: { clienteId?: string, initialData: any[], rol: string, clientesGlobales?: any[] }) {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();

  const [fecha, setFecha] = useState('');
  const [titulo, setTitulo] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [tipoEvento, setTipoEvento] = useState('Publicación');
  const [selectedCliente, setSelectedCliente] = useState(clienteId || '');

  const handleSave = async () => {
    if (!fecha || !titulo) return alert('Fecha y Título son requeridos');
    if (!selectedCliente) return alert('Debe seleccionar a qué cliente pertenece la tarea');

    const newTask = {
      cliente_id: selectedCliente,
      fecha_publicacion: fecha,
      titulo: `[${tipoEvento}] ${titulo}`,
      etiquetas: [prioridad],
      estado_cliente: 'interno'
    };

    const { data: inserted, error } = await supabase
      .from('kanban_cards')
      .insert([newTask])
      .select('id, titulo, fecha_publicacion as fecha, estado_cliente as estado, etiquetas as prioridad').single();

    if (error) {
      alert('Error: ' + error.message);
    } else {
      setData([...data, inserted]);
      setIsModalOpen(false);
      setTitulo(''); setFecha('');
    }
  };

  const getDays = () => {
    return Array.from({ length: 35 }).map((_, i) => {
      const dayNum = (i % 31) + 1;
      const tasksForDay = data.filter(t => {
        const d = new Date(t.fecha);
        return (d.getDate() + 1) === dayNum;
      });
      return { dayNum, tasks: tasksForDay, index: i };
    });
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-syne font-bold text-text">Calendario Global de Agencia</h1>
          <p className="text-text-dim text-sm mt-1">Todas las tareas de los clientes en un solo lugar.</p>
        </div>
        
        {rol === 'administrador' && (
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-magenta text-black text-sm font-bold rounded-btn hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nueva Tarea
          </button>
        )}
      </div>

      <div className="flex-1 bg-panel border border-border rounded-card p-6 flex flex-col overflow-y-auto">
        <div className="grid grid-cols-7 gap-4 mb-4 text-center">
          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(dia => (
            <div key={dia} className="text-xs font-bold text-text-dim uppercase tracking-wider">{dia}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-4 flex-1">
          {getDays().map((dia) => (
            <div key={dia.index} className="border border-border bg-panel-2/50 rounded-lg p-2 flex flex-col gap-2 min-h-[120px]">
              <div className="text-xs font-bold text-text-dim">{dia.dayNum}</div>
              <div className="flex-1 overflow-y-auto space-y-1">
                {dia.tasks.map((task: any) => (
                  <div key={task.id} className={`p-1.5 rounded text-[10px] font-bold border-l-2 flex flex-col gap-0.5 ${task.prioridad === 'alta' ? 'bg-alert/10 border-alert text-alert' : task.prioridad === 'baja' ? 'bg-panel-2 border-border text-text-dim' : 'bg-lime/10 border-lime text-lime'}`}>
                    {clientesGlobales && (
                      <span className="text-[8px] uppercase opacity-70 truncate">{task.clientes?.nombre || 'Cliente'}</span>
                    )}
                    <span className="truncate">{task.titulo}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-panel border border-border rounded-card p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-syne font-bold text-xl text-text">Registrar Tarea</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-dim hover:text-text"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="space-y-4">
              {clientesGlobales && (
                <div>
                  <label className="text-xs text-text-dim block mb-1">Cliente</label>
                  <select className="w-full bg-black border border-border rounded p-2 text-sm" value={selectedCliente} onChange={e => setSelectedCliente(e.target.value)}>
                    <option value="" disabled>Selecciona el cliente...</option>
                    {clientesGlobales.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="text-xs text-text-dim block mb-1">Tipo de Evento</label>
                <select className="w-full bg-black border border-border rounded p-2 text-sm" value={tipoEvento} onChange={e => setTipoEvento(e.target.value)}>
                  <option>Publicación</option>
                  <option>Fecha Importante Marca</option>
                  <option>Inicio de Pauta (Ads)</option>
                  <option>Entrega de Resultados</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-text-dim block mb-1">Título</label>
                <input type="text" className="w-full bg-black border border-border rounded p-2 text-sm" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej: Lanzamiento campaña" />
              </div>
              <div>
                <label className="text-xs text-text-dim block mb-1">Fecha</label>
                <input type="date" className="w-full bg-black border border-border rounded p-2 text-sm text-white" value={fecha} onChange={e => setFecha(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-text-dim block mb-1">Prioridad</label>
                <select className="w-full bg-black border border-border rounded p-2 text-sm" value={prioridad} onChange={e => setPrioridad(e.target.value)}>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
              <button onClick={handleSave} className="w-full py-3 mt-4 bg-magenta text-black font-bold rounded-btn hover:opacity-90">
                Guardar en Calendario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
