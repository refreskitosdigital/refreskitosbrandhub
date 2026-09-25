'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Heart, MessageCircle, Send, Bookmark, CheckCircle2, XCircle } from 'lucide-react';

interface Card {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_publicacion: string;
  estado_cliente: string;
  feedback_cliente: string;
}

export function MockupApprovalModule({ clienteId }: { clienteId: string }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [clienteNombre, setClienteNombre] = useState('Marca');
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [clienteId]);

  const fetchData = async () => {
    setLoading(true);
    const { data: cliente } = await supabase.from('clientes').select('nombre').eq('id', clienteId).single();
    if (cliente) setClienteNombre(cliente.nombre);

    const { data } = await supabase
      .from('kanban_cards')
      .select('*')
      .eq('cliente_id', clienteId)
      .neq('estado_cliente', 'interno') // Solo ver lo que sale del taller
      .order('fecha_publicacion', { ascending: true });
    
    if (data) setCards(data);
    setLoading(false);
  };

  const handleAction = async (id: string, action: 'aprobado' | 'rechazado') => {
    let feedback = '';
    if (action === 'rechazado') {
      const msg = prompt('¿Por qué rechazas este contenido? Deja un comentario para la agencia:');
      if (!msg) return; // canceló
      feedback = msg;
    }

    await supabase.from('kanban_cards').update({ 
      estado_cliente: action,
      feedback_cliente: feedback
    }).eq('id', id);

    setCards(cards.map(c => c.id === id ? { ...c, estado_cliente: action, feedback_cliente: feedback } : c));
  };

  if (loading) return <div className="text-white p-8">Cargando revisión de contenidos...</div>;

  return (
    <div className="flex flex-col h-full bg-black text-white p-6 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black font-syne text-white">Revisión de Contenidos</h1>
        <p className="text-gray-400 text-sm">Previsualiza cómo se verán tus posts y apruébalos con un clic.</p>
      </div>

      {cards.length === 0 ? (
        <div className="text-center text-gray-500 py-12 border border-gray-800 rounded-2xl">
          No hay contenidos pendientes de revisión en este momento.
        </div>
      ) : (
        <div className="flex gap-8 overflow-x-auto pb-8 snap-x">
          {cards.map(card => (
            <div key={card.id} className="flex-shrink-0 w-[350px] snap-center flex flex-col gap-4">
              
              {/* Instagram Mockup */}
              <div className="bg-white text-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-gray-900 relative">
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-0.5">
                    <div className="w-full h-full bg-white rounded-full border border-white flex items-center justify-center font-bold text-xs">
                      {clienteNombre.charAt(0)}
                    </div>
                  </div>
                  <span className="font-bold text-sm tracking-tight">{clienteNombre}</span>
                </div>
                
                {/* Image Placeholder (Diseño real iría aquí si suben la imagen) */}
                <div className="w-full aspect-square bg-gray-100 flex items-center justify-center relative group">
                  <span className="text-gray-300 font-syne font-bold text-xl px-8 text-center">{card.titulo}</span>
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold bg-black/80 px-3 py-1 rounded-full">Marcador de Diseño</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 pb-2 flex justify-between">
                  <div className="flex gap-4">
                    <Heart className="w-6 h-6 stroke-[1.5]" />
                    <MessageCircle className="w-6 h-6 stroke-[1.5]" />
                    <Send className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <Bookmark className="w-6 h-6 stroke-[1.5]" />
                </div>

                {/* Caption */}
                <div className="px-4 pb-4 text-sm">
                  <p>
                    <span className="font-bold mr-2">{clienteNombre}</span>
                    {card.descripcion || 'Sin descripción (Caption).'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2 uppercase tracking-wide">
                    Pautado para: {card.fecha_publicacion ? new Date(card.fecha_publicacion).toLocaleDateString() : 'Sin fecha'}
                  </p>
                </div>
              </div>

              {/* Botones de Aprobación */}
              <div className="flex gap-3">
                {card.estado_cliente === 'aprobado' ? (
                  <div className="w-full py-3 bg-lime/20 text-lime font-bold rounded-xl text-center flex justify-center items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> ¡Post Aprobado!
                  </div>
                ) : card.estado_cliente === 'rechazado' ? (
                  <div className="w-full flex flex-col gap-2">
                    <div className="w-full py-3 bg-alert/20 text-alert font-bold rounded-xl text-center flex justify-center items-center gap-2">
                      <XCircle className="w-5 h-5" /> Cambios Solicitados
                    </div>
                    <p className="text-xs text-gray-400 text-center">"{card.feedback_cliente}"</p>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => handleAction(card.id, 'rechazado')}
                      className="flex-1 py-3 bg-black border border-alert text-alert font-bold rounded-xl hover:bg-alert/10 transition-colors"
                    >
                      Rechazar
                    </button>
                    <button 
                      onClick={() => handleAction(card.id, 'aprobado')}
                      className="flex-1 py-3 bg-lime text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Aprobar Post
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
