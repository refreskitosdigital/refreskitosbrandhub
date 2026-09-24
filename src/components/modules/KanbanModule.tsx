'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, GripVertical, Calendar, User, Tag, MessageCircle } from 'lucide-react';

interface Column {
  id: string;
  nombre: string;
  orden: number;
}

interface Card {
  id: string;
  columna_id: string;
  titulo: string;
  descripcion: string;
  tipo_formato: string;
  fecha_publicacion: string;
  responsable: string;
  estado_cliente: string;
  feedback_cliente: string;
  etiquetas: string[];
  orden: number;
}

export function KanbanModule({ clienteId, rol }: { clienteId: string, rol: string }) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [clienteId]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch Columns
    const { data: cols } = await supabase
      .from('kanban_columns')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('orden');
    
    // Fetch Cards
    const { data: c } = await supabase
      .from('kanban_cards')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('orden');

    if (cols) setColumns(cols);
    if (c) setCards(c);
    setLoading(false);
  };

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData('cardId', cardId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    if (!cardId) return;

    // Actualizar UI optimísticamente
    const updatedCards = cards.map(c => 
      c.id === cardId ? { ...c, columna_id: colId } : c
    );
    setCards(updatedCards);

    // Guardar en BD
    await supabase.from('kanban_cards').update({ columna_id: colId }).eq('id', cardId);
  };

  const addCard = async (colId: string) => {
    const titulo = prompt('Título de la nueva tarea (Ej: Reel Navidad):');
    if (!titulo) return;

    const newCard = {
      cliente_id: clienteId,
      columna_id: colId,
      titulo,
      estado_cliente: 'interno'
    };

    const { data, error } = await supabase.from('kanban_cards').insert([newCard]).select().single();
    if (data) {
      setCards([...cards, data]);
    } else {
      alert('Error: ' + error?.message);
    }
  };

  const addColumn = async () => {
    const nombre = prompt('Nombre de la nueva columna:');
    if (!nombre) return;

    const newCol = {
      cliente_id: clienteId,
      nombre,
      orden: columns.length + 1
    };

    const { data } = await supabase.from('kanban_columns').insert([newCol]).select().single();
    if (data) {
      setColumns([...columns, data]);
    }
  };

  const deleteColumn = async (colId: string) => {
    if (!confirm('¿Borrar columna y todas sus tareas?')) return;
    await supabase.from('kanban_columns').delete().eq('id', colId);
    setColumns(columns.filter(c => c.id !== colId));
    setCards(cards.filter(c => c.columna_id !== colId));
  };

  if (loading) return <div className="text-white">Cargando tablero...</div>;

  return (
    <div className="flex flex-col h-full bg-white text-black p-6 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-black font-syne text-gray-900">Parrilla / Flujo de Trabajo</h1>
          <p className="text-gray-500 text-sm">Gestiona el progreso de los contenidos moviendo las tarjetas.</p>
        </div>
        
        {rol === 'administrador' && (
          <button onClick={addColumn} className="px-4 py-2 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nueva Columna
          </button>
        )}
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1 items-start snap-x">
        {columns.map(col => (
          <div 
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className="flex-shrink-0 w-80 bg-gray-50 border border-gray-200 rounded-xl flex flex-col max-h-full snap-center"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-100/50 rounded-t-xl">
              <h3 className="font-bold text-gray-800 font-syne">{col.nombre}</h3>
              {rol === 'administrador' && (
                <button onClick={() => deleteColumn(col.id)} className="text-gray-400 hover:text-red-500 text-xs">Borrar</button>
              )}
            </div>
            
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
              {cards.filter(c => c.columna_id === col.id).map(card => (
                <div 
                  key={card.id}
                  draggable={rol === 'administrador'}
                  onDragStart={(e) => handleDragStart(e, card.id)}
                  className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group relative"
                >
                  {/* Etiquetas */}
                  {card.etiquetas && card.etiquetas.length > 0 && (
                    <div className="flex gap-1 mb-2 flex-wrap">
                      {card.etiquetas.map((t, i) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase">{t}</span>
                      ))}
                    </div>
                  )}

                  <h4 className="font-bold text-gray-900 text-sm mb-1">{card.titulo}</h4>
                  
                  {/* Metadata Icons */}
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                    {card.fecha_publicacion && (
                      <div className="flex items-center gap-1 text-orange-600 font-medium">
                        <Calendar className="w-3 h-3" /> {new Date(card.fecha_publicacion).toLocaleDateString()}
                      </div>
                    )}
                    {card.responsable && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {card.responsable}
                      </div>
                    )}
                    {card.feedback_cliente && (
                      <div className="flex items-center gap-1 text-red-500 ml-auto" title="Con Feedback">
                        <MessageCircle className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {rol === 'administrador' && (
              <div className="p-3 border-t border-gray-200">
                <button 
                  onClick={() => addCard(col.id)}
                  className="w-full py-2 text-sm text-gray-500 font-medium hover:bg-gray-100 rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Agregar Tarea
                </button>
              </div>
            )}
          </div>
        ))}

        {columns.length === 0 && (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <p>No hay columnas en el tablero.</p>
          </div>
        )}
      </div>
    </div>
  );
}
