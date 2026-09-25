'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Calendar, User, MessageCircle, MoreVertical, X, CheckSquare, Trash2, Mail } from 'lucide-react';

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
  etiquetas: string[]; // Colores/Tags
  checklist?: { text: string, done: boolean }[];
  orden: number;
}

const COLORES_TAGS = [
  { nombre: 'TikTok', color: 'bg-black text-white' },
  { nombre: 'Reel', color: 'bg-fuchsia-600 text-white' },
  { nombre: 'Pauta (Ads)', color: 'bg-blue-600 text-white' },
  { nombre: 'Urgente', color: 'bg-red-500 text-white' },
  { nombre: 'Historia', color: 'bg-yellow-500 text-black' },
];

export function KanbanModule({ clienteId, rol }: { clienteId: string, rol: string }) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el modal de edición
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [clienteId]);

  const fetchData = async () => {
    setLoading(true);
    const { data: cols } = await supabase.from('kanban_columns').select('*').eq('cliente_id', clienteId).order('orden');
    const { data: c } = await supabase.from('kanban_cards').select('*').eq('cliente_id', clienteId).order('orden');

    if (cols) setColumns(cols);
    if (c) setCards(c);
    setLoading(false);
  };

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData('cardId', cardId);
  };

  const handleDrop = async (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    if (!cardId) return;

    setCards(cards.map(c => c.id === cardId ? { ...c, columna_id: colId } : c));
    await supabase.from('kanban_cards').update({ columna_id: colId }).eq('id', cardId);
  };

  const addCard = async (colId: string) => {
    const titulo = prompt('Título de la nueva tarea (Ej: Reel Navidad):');
    if (!titulo) return;

    const newCard = {
      cliente_id: clienteId,
      columna_id: colId,
      titulo,
      estado_cliente: 'interno',
      etiquetas: [],
      checklist: []
    };

    const { data, error } = await supabase.from('kanban_cards').insert([newCard]).select().single();
    if (data) setCards([...cards, data]);
  };

  const addColumn = async () => {
    const nombre = prompt('Nombre de la nueva columna:');
    if (!nombre) return;
    const newCol = { cliente_id: clienteId, nombre, orden: columns.length + 1 };
    const { data } = await supabase.from('kanban_columns').insert([newCol]).select().single();
    if (data) setColumns([...columns, data]);
  };

  const deleteCard = async (id: string) => {
    if(!confirm('¿Eliminar esta tarea definitivamente?')) return;
    setCards(cards.filter(c => c.id !== id));
    setEditingCard(null);
    await supabase.from('kanban_cards').delete().eq('id', id);
  };

  const saveCardDetails = async () => {
    if (!editingCard) return;
    
    // Si hay un responsable y se acaba de asignar, simulamos el aviso
    if(editingCard.responsable) {
      console.log(`Simulando envío de correo a: ${editingCard.responsable}`);
    }

    setCards(cards.map(c => c.id === editingCard.id ? editingCard : c));
    await supabase.from('kanban_cards').update({
      titulo: editingCard.titulo,
      descripcion: editingCard.descripcion,
      fecha_publicacion: editingCard.fecha_publicacion,
      responsable: editingCard.responsable,
      etiquetas: editingCard.etiquetas,
      checklist: editingCard.checklist
    }).eq('id', editingCard.id);
    
    setEditingCard(null);
  };

  const toggleChecklistItem = (idx: number) => {
    if(!editingCard || !editingCard.checklist) return;
    const newCheck = [...editingCard.checklist];
    newCheck[idx].done = !newCheck[idx].done;
    setEditingCard({ ...editingCard, checklist: newCheck });
  };

  const addChecklistItem = () => {
    if(!editingCard) return;
    const text = prompt('Nueva subtarea:');
    if(!text) return;
    const newCheck = [...(editingCard.checklist || []), { text, done: false }];
    setEditingCard({ ...editingCard, checklist: newCheck });
  };

  const toggleTag = (tag: string) => {
    if(!editingCard) return;
    const tags = editingCard.etiquetas || [];
    if(tags.includes(tag)) {
      setEditingCard({ ...editingCard, etiquetas: tags.filter(t => t !== tag) });
    } else {
      setEditingCard({ ...editingCard, etiquetas: [...tags, tag] });
    }
  };

  if (loading) return <div className="text-white">Cargando tablero...</div>;

  return (
    <div className="flex flex-col h-full bg-white text-black p-6 rounded-2xl overflow-hidden shadow-2xl relative">
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
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col.id)}
            className="flex-shrink-0 w-80 bg-gray-50 border border-gray-200 rounded-xl flex flex-col max-h-full snap-center"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-100/50 rounded-t-xl">
              <h3 className="font-bold text-gray-800 font-syne">{col.nombre}</h3>
            </div>
            
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
              {cards.filter(c => c.columna_id === col.id).map(card => {
                const checkedCount = card.checklist?.filter(i => i.done).length || 0;
                const totalCheck = card.checklist?.length || 0;

                return (
                  <div 
                    key={card.id}
                    draggable={rol === 'administrador'}
                    onDragStart={(e) => handleDragStart(e, card.id)}
                    className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group relative"
                  >
                    {rol === 'administrador' && (
                      <button onClick={() => setEditingCard(card)} className="absolute top-2 right-2 text-gray-400 hover:text-magenta opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    )}

                    {/* Etiquetas Visuales (Colores) */}
                    {card.etiquetas && card.etiquetas.length > 0 && (
                      <div className="flex gap-1 mb-2 flex-wrap">
                        {card.etiquetas.map((t, i) => {
                          const c = COLORES_TAGS.find(ct => ct.nombre === t);
                          return (
                            <span key={i} className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${c ? c.color : 'bg-gray-200 text-gray-700'}`}>
                              {t}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <h4 className="font-bold text-gray-900 text-sm mb-1 pr-6">{card.titulo}</h4>
                    
                    {/* Checklist Progress */}
                    {totalCheck > 0 && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 mt-2">
                        <CheckSquare className="w-3 h-3 text-magenta" /> {checkedCount}/{totalCheck} completadas
                      </div>
                    )}
                    
                    {/* Metadata Icons */}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                      {card.fecha_publicacion && (
                        <div className="flex items-center gap-1 text-orange-600 font-medium">
                          <Calendar className="w-3 h-3" /> {new Date(card.fecha_publicacion).toLocaleDateString()}
                        </div>
                      )}
                      {card.responsable && (
                        <div className="flex items-center gap-1 truncate max-w-[100px]">
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
                );
              })}
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
      </div>

      {/* MODAL DE EDICIÓN DE TARJETA */}
      {editingCard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-gray-200 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h2 className="font-syne font-bold text-lg text-gray-900 flex items-center gap-2">
                Editar Tarea
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={() => deleteCard(editingCard.id)} className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setEditingCard(null)} className="p-2 text-gray-400 hover:bg-gray-200 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Título y Desc */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">Título</label>
                <input 
                  type="text" 
                  value={editingCard.titulo} 
                  onChange={e => setEditingCard({...editingCard, titulo: e.target.value})}
                  className="w-full font-syne font-bold text-xl bg-transparent border-b border-gray-300 focus:border-magenta outline-none py-1"
                />
              </div>

              {/* Colores/Etiquetas */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Etiquetas Visuales</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORES_TAGS.map(t => (
                    <button 
                      key={t.nombre}
                      onClick={() => toggleTag(t.nombre)}
                      className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${
                        editingCard.etiquetas?.includes(t.nombre) ? t.color + ' border-transparent scale-105' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {t.nombre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 uppercase flex items-center gap-1"><User className="w-3 h-3"/> Responsable (Email)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="correo@equipo.com"
                      value={editingCard.responsable || ''} 
                      onChange={e => setEditingCard({...editingCard, responsable: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-2.5 rounded-lg outline-none focus:border-magenta text-sm pl-9"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Se enviará notificación al guardar.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 uppercase flex items-center gap-1"><Calendar className="w-3 h-3"/> Fecha de Entrega</label>
                  <input 
                    type="date" 
                    value={editingCard.fecha_publicacion || ''} 
                    onChange={e => setEditingCard({...editingCard, fecha_publicacion: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-2.5 rounded-lg outline-none focus:border-magenta text-sm"
                  />
                </div>
              </div>

              {/* Checklist */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase flex items-center gap-1"><CheckSquare className="w-3 h-3"/> Checklist de Subtareas</label>
                  <button onClick={addChecklistItem} className="text-[10px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded">
                    + Añadir ítem
                  </button>
                </div>
                <div className="space-y-2">
                  {(!editingCard.checklist || editingCard.checklist.length === 0) && (
                    <p className="text-xs text-gray-400 italic">No hay subtareas definidas.</p>
                  )}
                  {editingCard.checklist?.map((chk, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={chk.done} 
                        onChange={() => toggleChecklistItem(i)}
                        className="w-4 h-4 text-magenta rounded focus:ring-magenta cursor-pointer"
                      />
                      <span className={`text-sm flex-1 ${chk.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{chk.text}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
              <button 
                onClick={saveCardDetails}
                className="bg-magenta text-white font-bold py-2.5 px-6 rounded-xl hover:bg-fuchsia-600 transition-colors"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
