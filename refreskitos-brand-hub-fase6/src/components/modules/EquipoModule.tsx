'use client';

import { useState } from 'react';
import { Users, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export function EquipoModule({ initialTasks }: { initialTasks: any[] }) {
  const [filter, setFilter] = useState<'dia' | 'semana' | 'mes'>('mes');
  
  // Procesar tareas para KPIs
  const hoy = new Date();
  
  const processedTasks = initialTasks.map(t => {
    let status = 'A tiempo';
    let isLate = false;
    
    if (t.fecha_publicacion) {
      const fecha = new Date(t.fecha_publicacion);
      if (fecha < hoy) {
        status = 'Atrasada';
        isLate = true;
      }
    }
    
    return {
      ...t,
      status,
      isLate,
      responsable: t.responsable || 'Sin asignar'
    };
  });

  // Agrupar por responsable
  const kpis: Record<string, { total: number, atrasadas: number, cliente: string }> = {};
  
  processedTasks.forEach(t => {
    if (!kpis[t.responsable]) {
      kpis[t.responsable] = { total: 0, atrasadas: 0, cliente: t.clientes?.nombre || 'Varios' };
    }
    kpis[t.responsable].total += 1;
    if (t.isLate) kpis[t.responsable].atrasadas += 1;
  });

  return (
    <div className="flex flex-col h-full bg-white text-black p-6 rounded-2xl overflow-y-auto shadow-2xl">
      <div className="mb-8 border-b border-gray-200 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black font-syne text-gray-900">Rendimiento de Equipo</h1>
          <p className="text-gray-500 mt-2">Monitorea los KPIs y tareas pendientes de los colaboradores.</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {['dia', 'semana', 'mes'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 text-sm font-bold rounded-md capitalize transition-colors ${
                filter === f ? 'bg-magenta text-white shadow' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Por {f}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas de KPI por Responsable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {Object.entries(kpis).map(([resp, metrics]) => (
          <div key={resp} className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-magenta transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                {resp.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{resp}</h3>
                <span className="text-xs text-gray-500">{metrics.total} tareas activas</span>
              </div>
            </div>
            
            {metrics.atrasadas > 0 ? (
              <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2 font-medium">
                <AlertCircle className="w-5 h-5" />
                <span>Tiene {metrics.atrasadas} tareas atrasadas</span>
              </div>
            ) : (
              <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-5 h-5" />
                <span>Todo al día</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-xl font-syne font-bold text-gray-900 mb-4">Detalle de Tareas Pendientes</h2>
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-4 font-bold">Tarea</th>
              <th className="p-4 font-bold">Cliente</th>
              <th className="p-4 font-bold">Responsable</th>
              <th className="p-4 font-bold">Entrega</th>
              <th className="p-4 font-bold">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {processedTasks.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-gray-500">No hay tareas pendientes.</td></tr>
            )}
            {processedTasks.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{t.titulo}</td>
                <td className="p-4 text-gray-600">{t.clientes?.nombre}</td>
                <td className="p-4 text-gray-600 flex items-center gap-2">
                  <Users className="w-3 h-3" /> {t.responsable}
                </td>
                <td className="p-4 text-gray-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 
                  {t.fecha_publicacion ? new Date(t.fecha_publicacion).toLocaleDateString() : 'Sin fecha'}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    t.isLate ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
