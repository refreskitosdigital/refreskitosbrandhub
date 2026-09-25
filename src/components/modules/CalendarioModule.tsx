'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';

const EFEMERIDES: Record<string, string[]> = {
  "09-01": ["Día del Árbol (Ambientales)"],
  "09-11": ["Día de la Virgen de Coromoto (Nacional)"],
  "09-24": ["Día de las Mercedes (Nacional)"],
  "10-24": ["Día de Rafael Urdaneta (Zulia)"],
  "10-26": ["Día del Médico (Médicos - Opcional)"],
  "11-18": ["Día de la Virgen de Chiquinquirá (Zulia/Nacional)"],
  "12-24": ["Nochebuena (Nacional)"],
  "12-25": ["Navidad (Nacional)"],
  "12-31": ["Fin de Año (Nacional)"]
};

export function CalendarioModule({ clienteId, initialData, rol, clientesGlobales }: { clienteId?: string, initialData: any[], rol: string, clientesGlobales?: any[] }) {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();

  const [currentDate, setCurrentDate] = useState(new Date()); // Fecha base actual
  const [fecha, setFecha] = useState('');
  const [titulo, setTitulo] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [tipoEvento, setTipoEvento] = useState('Publicación');
  const [selectedCliente, setSelectedCliente] = useState(clienteId || '');

  // Pestañas (Septiembre a Diciembre por defecto para 2026, pero dinámico)
  const availableMonths = [
    { label: 'Septiembre 2026', y: 2026, m: 8 },
    { label: 'Octubre 2026', y: 2026, m: 9 },
    { label: 'Noviembre 2026', y: 2026, m: 10 },
    { label: 'Diciembre 2026', y: 2026, m: 11 },
    { label: 'Enero 2027', y: 2027, m: 0 },
    { label: 'Febrero 2027', y: 2027, m: 1 },
  ];

  // Identificar qué pestaña marcar como activa
  const activeTabIdx = availableMonths.findIndex(m => m.y === currentDate.getFullYear() && m.m === currentDate.getMonth());

  useEffect(() => {
    // Si la fecha actual no está en nuestras pestañas (ej: estamos en Agosto 2026), igual lo mostramos, pero las tabs se manejan.
  }, []);

  const setMonthView = (y: number, m: number) => {
    setCurrentDate(new Date(y, m, 1));
  };

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

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Ajustar para que Lunes sea 0 y Domingo 6
  };

  const generateGrid = () => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(y, m);
    const firstDay = getFirstDayOfMonth(y, m); // 0 (Lunes) a 6 (Domingo)

    const grid = [];
    
    // Rellenar días del mes anterior
    for (let i = 0; i < firstDay; i++) {
      grid.push({ empty: true });
    }

    // Días del mes actual
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const efeKey = `${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      const tasksForDay = data.filter(t => {
        if (!t.fecha) return false;
        return t.fecha.startsWith(dateStr);
      });

      grid.push({
        dayNum: d,
        dateStr: dateStr,
        tasks: tasksForDay,
        efemerides: EFEMERIDES[efeKey] || []
      });
    }

    // Rellenar final de la cuadrícula (hasta 35 o 42 celdas)
    const totalCells = grid.length > 35 ? 42 : 35;
    while (grid.length < totalCells) {
      grid.push({ empty: true });
    }

    return grid;
  };

  const grid = generateGrid();
  const monthName = currentDate.toLocaleString('es-VE', { month: 'long' }).toUpperCase();
  const yearName = currentDate.getFullYear();

  return (
    <div className="flex flex-col h-full bg-white text-black p-6 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black font-syne text-gray-900">Calendario de Contenidos</h1>
          <p className="text-gray-500 text-sm">Organización cronológica (Parrilla sincronizada)</p>
        </div>
        
        {rol === 'administrador' && (
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-magenta text-white text-sm font-bold rounded-lg hover:bg-fuchsia-600 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nuevo Evento
          </button>
        )}
      </div>

      {/* TABS DE MESES */}
      <div className="flex overflow-x-auto gap-2 mb-6 shrink-0 border-b border-gray-200 pb-2">
        {availableMonths.map((tab, idx) => {
          const isActive = tab.y === currentDate.getFullYear() && tab.m === currentDate.getMonth();
          return (
            <button 
              key={idx}
              onClick={() => setMonthView(tab.y, tab.m)}
              className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors border-b-2 ${
                isActive 
                  ? 'bg-gray-100 text-magenta border-magenta' 
                  : 'text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              {tab.label.toUpperCase()}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200 shrink-0">
        <button 
          onClick={() => setMonthView(currentDate.getFullYear(), currentDate.getMonth() - 1)}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-black font-syne tracking-widest text-gray-800">
          {monthName} {yearName}
        </h2>
        <button 
          onClick={() => setMonthView(currentDate.getFullYear(), currentDate.getMonth() + 1)}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-y-auto border border-gray-200 flex-1">
        {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map(day => (
          <div key={day} className="bg-gray-100 p-2 text-center text-xs font-bold text-gray-500 tracking-wider">
            {day}
          </div>
        ))}

        {grid.map((cell, idx) => (
          <div key={idx} className={`min-h-[120px] bg-white p-2 flex flex-col gap-1 transition-colors ${!cell.empty ? 'hover:bg-gray-50 group' : 'bg-gray-50/50'}`}>
            {!cell.empty && (
              <>
                <span className="text-sm font-bold text-gray-400 group-hover:text-magenta transition-colors">{cell.dayNum}</span>
                
                {/* Efemérides */}
                {cell.efemerides && cell.efemerides.map((efe: string, eIdx: number) => (
                  <div key={eIdx} className="text-[9px] bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded font-medium truncate" title={efe}>
                    ★ {efe}
                  </div>
                ))}

                {/* Tareas */}
                <div className="flex-1 overflow-y-auto space-y-1 mt-1 pr-1 custom-scrollbar">
                  {cell.tasks?.map((t: any) => (
                    <div key={t.id} className="text-xs p-1.5 bg-gray-900 text-white rounded border-l-2 border-magenta truncate" title={t.titulo}>
                      {t.titulo}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-gray-200 shadow-2xl flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h2 className="font-syne font-bold text-lg text-gray-900">Programar Evento</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {!clienteId && clientesGlobales && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Cliente / Marca</label>
                  <select 
                    value={selectedCliente} 
                    onChange={e => setSelectedCliente(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 p-3 rounded-xl outline-none focus:border-magenta"
                  >
                    <option value="">Selecciona un cliente</option>
                    {clientesGlobales.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Título del Contenido</label>
                <input 
                  type="text" 
                  value={titulo} 
                  onChange={e => setTitulo(e.target.value)}
                  placeholder="Ej: Lanzamiento Producto"
                  className="w-full bg-white border border-gray-300 text-gray-900 p-3 rounded-xl outline-none focus:border-magenta"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Fecha de Publicación</label>
                  <input 
                    type="date" 
                    value={fecha} 
                    onChange={e => setFecha(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 p-3 rounded-xl outline-none focus:border-magenta"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Formato</label>
                  <select 
                    value={tipoEvento} 
                    onChange={e => setTipoEvento(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 p-3 rounded-xl outline-none focus:border-magenta"
                  >
                    <option value="Reel">Reel</option>
                    <option value="Carrusel">Carrusel</option>
                    <option value="Historia">Historia</option>
                    <option value="Pauta">Pauta (Ads)</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-magenta text-white font-bold py-3 rounded-xl hover:bg-fuchsia-600 transition-colors mt-2"
              >
                Guardar en Calendario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
