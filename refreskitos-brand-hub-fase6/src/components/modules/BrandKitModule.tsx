'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Upload, Trash2, Plus } from 'lucide-react';

export function BrandKitModule({ clienteId, rol }: { clienteId: string, rol: string }) {
  const [data, setData] = useState<any>({ logos: [], colores: [], tipografias: [] });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [clienteId]);

  const fetchData = async () => {
    setLoading(true);
    let { data: kit } = await supabase.from('brand_kits').select('*').eq('cliente_id', clienteId).single();
    
    // Si no existe, inicializarlo (solo admin)
    if (!kit && rol === 'administrador') {
      const { data: newKit } = await supabase.from('brand_kits').insert([{ cliente_id: clienteId }]).select().single();
      kit = newKit;
    }
    
    if (kit) setData(kit);
    setLoading(false);
  };

  const addColor = async () => {
    const hex = prompt('Ingresa el código HEX del color (Ej: #FF0055):');
    if (!hex) return;
    
    const newColors = [...(data.colores || []), hex];
    await supabase.from('brand_kits').update({ colores: newColors }).eq('id', data.id);
    setData({ ...data, colores: newColors });
  };

  const deleteColor = async (idx: number) => {
    const newColors = data.colores.filter((_: any, i: number) => i !== idx);
    await supabase.from('brand_kits').update({ colores: newColors }).eq('id', data.id);
    setData({ ...data, colores: newColors });
  };

  if (loading) return <div className="p-8 text-white">Cargando Caja Fuerte...</div>;

  return (
    <div className="flex flex-col h-full bg-white text-black p-6 rounded-2xl overflow-y-auto shadow-2xl">
      <div className="mb-10 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-black font-syne text-gray-900">Caja Fuerte / Brand Kit</h1>
        <p className="text-gray-500 mt-2">Recursos oficiales de la marca en alta resolución.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* COLORES */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-syne font-bold text-xl text-gray-800">Paleta de Colores</h2>
            {rol === 'administrador' && (
              <button onClick={addColor} className="text-xs bg-black text-white px-3 py-1 rounded font-bold hover:bg-gray-800"><Plus className="w-4 h-4 inline" /> Añadir</button>
            )}
          </div>
          <div className="flex gap-4 flex-wrap">
            {(!data.colores || data.colores.length === 0) && <span className="text-gray-400 text-sm">No hay colores definidos.</span>}
            {data.colores?.map((c: string, i: number) => (
              <div key={i} className="group relative w-20 h-24 rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="flex-1 w-full" style={{ backgroundColor: c }}></div>
                <div className="h-8 bg-white flex items-center justify-center text-xs font-bold text-gray-600">{c}</div>
                {rol === 'administrador' && (
                  <button onClick={() => deleteColor(i)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* LOGOS Y ARCHIVOS (Boceto visual) */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-syne font-bold text-xl text-gray-800">Logotipos y Recursos</h2>
            {rol === 'administrador' && (
              <button className="text-xs bg-black text-white px-3 py-1 rounded font-bold hover:bg-gray-800 flex items-center gap-1">
                <Upload className="w-4 h-4" /> Subir Archivo
              </button>
            )}
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <Upload className="w-10 h-10 mb-3 text-gray-300" />
            <p className="text-sm font-medium">El almacenamiento Cloud de Supabase Storage se integrará aquí.</p>
            <p className="text-xs mt-1 text-center">Podrás arrastrar archivos PNG/SVG sin compresión para que el cliente los descargue.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
