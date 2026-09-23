'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, X, Upload } from 'lucide-react';

export function EvidenciasModule({ clienteId, initialData, rol }: { clienteId: string, initialData: any[], rol: string }) {
  const [data, setData] = useState(initialData);
  const [isAdding, setIsAdding] = useState(false);
  const supabase = createClient();

  const [fecha, setFecha] = useState('');
  const [redSocial, setRedSocial] = useState('instagram');
  const [linkPublicacion, setLinkPublicacion] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    if (!fecha || !file) return alert('Fecha e Imagen son obligatorias');

    setUploading(true);
    
    // 1. Subir imagen a Supabase Storage (Bucket "evidencias")
    const fileExt = file.name.split('.').pop();
    const fileName = `${clienteId}/${Math.random()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('evidencias')
      .upload(fileName, file);

    if (uploadError) {
      setUploading(false);
      return alert('Error subiendo imagen. ¿Creaste el bucket "evidencias" y lo hiciste público en Supabase? Error: ' + uploadError.message);
    }

    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage.from('evidencias').getPublicUrl(fileName);
    const imageUrl = publicUrlData.publicUrl;

    // 2. Guardar en base de datos
    const newEvidencia = {
      cliente_id: clienteId,
      fecha: fecha,
      red_social: redSocial,
      link_publicacion: linkPublicacion,
      captura_url: imageUrl
    };

    const { data: inserted, error: dbError } = await supabase
      .from('evidencias')
      .insert([newEvidencia])
      .select().single();

    setUploading(false);

    if (dbError) {
      alert('Error guardando registro: ' + dbError.message);
    } else {
      setData([inserted, ...data]);
      setIsAdding(false);
      setFile(null); setFecha(''); setLinkPublicacion('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-syne font-bold text-text">Evidencias y Captures</h1>
          <p className="text-text-dim text-sm mt-1">Historial gráfico de las publicaciones realizadas.</p>
        </div>
        
        {rol === 'administrador' && (
          <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-magenta text-black text-sm font-bold rounded-btn hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus className="w-4 h-4" /> Agregar Evidencia
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-panel border border-border rounded-card p-6 mb-6 w-full max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-syne font-bold text-magenta">Nueva Evidencia</h3>
            <button onClick={() => setIsAdding(false)} className="text-text-dim hover:text-text"><X className="w-4 h-4"/></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-text-dim block mb-1">Fecha</label>
              <input type="date" className="w-full bg-black border border-border rounded p-2 text-white text-sm" value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-text-dim block mb-1">Red Social</label>
              <select className="w-full bg-black border border-border rounded p-2 text-sm" value={redSocial} onChange={e => setRedSocial(e.target.value)}>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="tiktok">TikTok</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-text-dim block mb-1">Enlace a la publicación original (Link)</label>
              <input type="url" placeholder="https://instagram.com/p/..." className="w-full bg-black border border-border rounded p-2 text-sm" value={linkPublicacion} onChange={e => setLinkPublicacion(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-text-dim block mb-1">Captura de Pantalla (JPG/PNG)</label>
              <div className="border-2 border-dashed border-border rounded p-6 text-center hover:border-magenta transition-colors">
                <input type="file" accept="image/*" className="w-full text-sm text-text-dim" onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
            </div>
          </div>
          <button onClick={handleSave} disabled={uploading} className="w-full py-2 bg-lime text-black font-bold rounded-btn hover:opacity-90 disabled:opacity-50">
            {uploading ? 'Subiendo...' : 'Guardar Evidencia'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto">
        {data.map((item) => (
          <div key={item.id} className="bg-panel border border-border rounded-card overflow-hidden group">
            <div className="aspect-[4/5] bg-black relative overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.captura_url} alt="Evidencia" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                {item.red_social}
              </div>
            </div>
            <div className="p-4 border-t border-border bg-panel-2/30">
              <div className="flex justify-between items-center mb-3">
                <span className="text-text font-bold font-syne">{new Date(item.fecha).toLocaleDateString()}</span>
              </div>
              {item.link_publicacion && (
                <a href={item.link_publicacion} target="_blank" rel="noopener noreferrer" className="block w-full py-2 bg-panel border border-border hover:border-magenta hover:text-magenta transition-colors rounded text-center text-xs font-bold">
                  Ver Publicación
                </a>
              )}
            </div>
          </div>
        ))}
        {data.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center text-text-dim border border-dashed border-border rounded-card">
            No hay evidencias subidas para este cliente.
          </div>
        )}
      </div>
    </div>
  );
}
