'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Download, Plus, Save, X } from 'lucide-react';

interface ParrillaRow {
  id: string;
  mes: string;
  fecha?: string;
  canal?: string;
  pilar?: string;
  objetivo?: string;
  rrss?: string;
  texto?: string;
  caption?: string;
  formato?: string;
  estado?: string;
  guion?: string;
  link_referencia?: string;
}

export function ParrillaTable({ clienteId, initialData, rol }: { clienteId: string, initialData: ParrillaRow[], rol: string }) {
  const [data, setData] = useState<ParrillaRow[]>(initialData);
  const [isAdding, setIsAdding] = useState(false);
  const supabase = createClient();

  const handleDownload = () => {
    // Generar CSV
    const headers = ['FECHA', 'CANAL', 'PILAR', 'OBJETIVO', 'RRSS', 'TEXTO', 'CAPTION', 'FORMATO', 'ESTATUS DISEÑO', 'GUION', 'REFERENCIA'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        `"${row.fecha || ''}"`,
        `"${row.canal || ''}"`,
        `"${row.pilar || ''}"`,
        `"${row.objetivo || ''}"`,
        `"${row.rrss || ''}"`,
        `"${row.texto || ''}"`,
        `"${row.caption || ''}"`,
        `"${row.formato || ''}"`,
        `"${row.estado || ''}"`,
        `"${row.guion?.replace(/\n/g, ' ') || ''}"`,
        `"${row.link_referencia || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Parrilla_Contenidos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Estado para la nueva fila
  const [newRow, setNewRow] = useState<Partial<ParrillaRow>>({});

  const handleSaveNew = async () => {
    if (!newRow.fecha || !newRow.objetivo) return alert('Fecha y Objetivo son requeridos');
    
    const insertData = {
      cliente_id: clienteId,
      mes: newRow.fecha, // Simplificado, idealmente extraído
      fecha_publicacion: newRow.fecha, // Si creamos la columna fecha_publicacion, por ahora usamos mes
      canal: newRow.canal,
      pilar: newRow.pilar,
      objetivo: newRow.objetivo,
      texto: newRow.texto,
      caption: newRow.caption,
      formato: newRow.formato,
      estado: newRow.estado || 'idea',
      guion: newRow.guion,
      link_referencia: newRow.link_referencia,
      informacion: newRow.texto || 'Info', // Columna obligatoria en DB actual
      tipo: newRow.formato === 'reel' ? 'reel' : 'post' // Columna obligatoria en DB
    };

    // Insertar (simulando en UI si falla RLS temporalmente)
    const { data: inserted, error } = await supabase.from('parrilla_contenido').insert([insertData]).select().single();
    
    if (error) {
      console.error(error);
      alert('Error guardando en BD. Revisa permisos.');
    } else if (inserted) {
      setData([...data, inserted as unknown as ParrillaRow]);
      setIsAdding(false);
      setNewRow({});
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-syne font-bold text-text">Parrilla de Contenidos</h1>
          <p className="text-text-dim text-sm mt-1">Planificación detallada tipo Excel.</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={handleDownload} className="px-4 py-2 bg-panel-2 text-text text-sm font-medium rounded-btn border border-border hover:border-text-dim transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Exportar Excel (CSV)
          </button>
          {rol === 'administrador' && (
            <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-magenta text-black text-sm font-bold rounded-btn hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nuevo Contenido
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-panel border border-border rounded-card overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-text whitespace-nowrap">
            <thead className="bg-[#E60000] text-white text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 border-r border-white/20">FECHA</th>
                <th className="px-4 py-3 border-r border-white/20">CANAL</th>
                <th className="px-4 py-3 border-r border-white/20">PILAR</th>
                <th className="px-4 py-3 border-r border-white/20">OBJETIVO</th>
                <th className="px-4 py-3 border-r border-white/20">RRSS</th>
                <th className="px-4 py-3 border-r border-white/20 min-w-[200px]">TEXTO</th>
                <th className="px-4 py-3 border-r border-white/20 min-w-[300px]">CAPTION</th>
                <th className="px-4 py-3 border-r border-white/20">FORMATO</th>
                <th className="px-4 py-3 border-r border-white/20">ESTATUS DISEÑO</th>
                <th className="px-4 py-3 border-r border-white/20 min-w-[250px]">GUION PARA EL REELS</th>
                <th className="px-4 py-3">REFERENCIA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isAdding && (
                <tr className="bg-panel-2/50">
                  <td className="p-2 border-r border-border"><input type="date" className="w-full bg-black border border-border rounded p-1 text-xs" onChange={e => setNewRow({...newRow, fecha: e.target.value})} /></td>
                  <td className="p-2 border-r border-border">
                    <select className="w-full bg-black border border-border rounded p-1 text-xs" onChange={e => setNewRow({...newRow, canal: e.target.value})}>
                      <option>FEED</option>
                      <option>HISTORIA</option>
                      <option>WEB</option>
                      <option>PAUTA</option>
                    </select>
                  </td>
                  <td className="p-2 border-r border-border">
                    <select className="w-full bg-black border border-border rounded p-1 text-xs" onChange={e => setNewRow({...newRow, pilar: e.target.value})}>
                      <option>Branding</option>
                      <option>Interacción</option>
                      <option>Ventas</option>
                      <option>Valor / Educación</option>
                    </select>
                  </td>
                  <td className="p-2 border-r border-border"><input type="text" placeholder="Objetivo..." className="w-full bg-black border border-border rounded p-1 text-xs" onChange={e => setNewRow({...newRow, objetivo: e.target.value})} /></td>
                  <td className="p-2 border-r border-border"><input type="text" placeholder="IG-FB-TIKTOK" className="w-full bg-black border border-border rounded p-1 text-xs" onChange={e => setNewRow({...newRow, rrss: e.target.value})} /></td>
                  <td className="p-2 border-r border-border"><input type="text" placeholder="Texto en diseño..." className="w-full bg-black border border-border rounded p-1 text-xs" onChange={e => setNewRow({...newRow, texto: e.target.value})} /></td>
                  <td className="p-2 border-r border-border"><textarea placeholder="Caption..." className="w-full bg-black border border-border rounded p-1 text-xs h-8" onChange={e => setNewRow({...newRow, caption: e.target.value})} /></td>
                  <td className="p-2 border-r border-border">
                    <select className="w-full bg-black border border-border rounded p-1 text-xs" onChange={e => setNewRow({...newRow, formato: e.target.value})}>
                      <option>Reel</option>
                      <option>Carrusel</option>
                      <option>Post</option>
                    </select>
                  </td>
                  <td className="p-2 border-r border-border">
                    <select className="w-full bg-black border border-border rounded p-1 text-xs" onChange={e => setNewRow({...newRow, estado: e.target.value})}>
                      <option>Listo</option>
                      <option>En Proceso</option>
                      <option>Pendiente</option>
                    </select>
                  </td>
                  <td className="p-2 border-r border-border"><textarea placeholder="Guion del video..." className="w-full bg-black border border-border rounded p-1 text-xs h-8" onChange={e => setNewRow({...newRow, guion: e.target.value})} /></td>
                  <td className="p-2 flex gap-2">
                    <input type="text" placeholder="Link URL" className="w-full bg-black border border-border rounded p-1 text-xs" onChange={e => setNewRow({...newRow, link_referencia: e.target.value})} />
                    <button onClick={handleSaveNew} className="p-1 bg-lime text-black rounded hover:opacity-90"><Save className="w-4 h-4"/></button>
                    <button onClick={() => setIsAdding(false)} className="p-1 bg-alert text-white rounded hover:opacity-90"><X className="w-4 h-4"/></button>
                  </td>
                </tr>
              )}
              
              {data.map(row => (
                <tr key={row.id} className="hover:bg-panel-2/30 transition-colors group">
                  <td className="px-4 py-3 border-r border-border font-medium">{row.fecha || row.mes}</td>
                  <td className="px-4 py-3 border-r border-border">{row.canal}</td>
                  <td className="px-4 py-3 border-r border-border">{row.pilar}</td>
                  <td className="px-4 py-3 border-r border-border whitespace-normal min-w-[150px]">{row.objetivo}</td>
                  <td className="px-4 py-3 border-r border-border">{row.rrss}</td>
                  <td className="px-4 py-3 border-r border-border whitespace-normal min-w-[200px]">{row.texto}</td>
                  <td className="px-4 py-3 border-r border-border whitespace-normal min-w-[300px] text-xs leading-relaxed text-text-dim">{row.caption}</td>
                  <td className="px-4 py-3 border-r border-border">
                    <span className="bg-panel-2 px-2 py-1 rounded text-xs">{row.formato}</span>
                  </td>
                  <td className="px-4 py-3 border-r border-border">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${row.estado === 'Listo' ? 'bg-lime/10 text-lime' : row.estado === 'En Proceso' ? 'bg-magenta/10 text-magenta' : 'bg-panel-2 text-text-dim'}`}>
                      {row.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-r border-border whitespace-normal min-w-[250px] text-xs text-text-dim italic">{row.guion}</td>
                  <td className="px-4 py-3">
                    {row.link_referencia && <a href={row.link_referencia} target="_blank" className="text-magenta hover:underline text-xs">Ver Enlace</a>}
                  </td>
                </tr>
              ))}
              
              {data.length === 0 && !isAdding && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-text-dim text-sm italic">
                    No hay contenidos en la parrilla aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
