import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Building2, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardRoot() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/');

  const { data: userData } = await supabase
    .from('usuarios_clientes')
    .select('rol, cliente_id')
    .eq('usuario_id', user.id)
    .single();

  if (userData?.rol === 'cliente') {
    redirect(`/dashboard/${userData.cliente_id}`);
  }

  // VISTA GLOBAL DE AGENCIA (REFRESKITOS)
  const { data: clientes } = await supabase.from('clientes').select('*').order('nombre');
  
  // En el futuro: sumar presupuestos_items de todos los clientes
  // Por ahora mock de sumatoria global
  const totalFacturadoMes = 4500;
  const tareasCompletadas = 85;
  const tareasPendientes = 15;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-syne font-bold text-text">Dashboard Global de Agencia</h1>
          <p className="text-text-dim text-sm mt-1">Visión general de todos los clientes y facturación.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-panel border border-border rounded-card p-6 flex flex-col justify-center relative overflow-hidden">
          <span className="text-text-dim text-xs font-bold uppercase tracking-wider mb-2">Total Facturado (Mes)</span>
          <span className="text-4xl font-syne font-bold text-lime">${totalFacturadoMes} <span className="text-lg text-text-dim">USD</span></span>
        </div>
        
        <div className="bg-panel border border-border rounded-card p-6 flex flex-col justify-center relative overflow-hidden">
          <span className="text-text-dim text-xs font-bold uppercase tracking-wider mb-2">Rendimiento de Tareas</span>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-lime w-5 h-5" />
              <span className="text-2xl font-syne font-bold text-text">{tareasCompletadas}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="text-alert w-5 h-5" />
              <span className="text-2xl font-syne font-bold text-text">{tareasPendientes}</span>
            </div>
          </div>
          <div className="w-full bg-panel-2 h-2 rounded-full mt-4 overflow-hidden flex">
            <div className="bg-lime h-full" style={{ width: '85%' }}></div>
            <div className="bg-alert h-full" style={{ width: '15%' }}></div>
          </div>
        </div>

        <div className="bg-panel border border-border rounded-card p-6 flex flex-col justify-center relative overflow-hidden">
          <span className="text-text-dim text-xs font-bold uppercase tracking-wider mb-2">Workspaces Activos</span>
          <span className="text-4xl font-syne font-bold text-magenta">{clientes?.filter(c => c.activo).length || 0}</span>
        </div>
      </div>

      <div className="bg-panel border border-border rounded-card overflow-hidden flex-1 flex flex-col">
        <div className="p-6 border-b border-border bg-panel-2/30">
          <h3 className="font-syne font-bold text-lg text-text">Directorio de Clientes</h3>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-text">
            <thead className="bg-panel-2/50 text-xs text-text-dim uppercase font-bold border-b border-border">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Estado de Pago</th>
                <th className="px-6 py-4">Acceso</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clientes?.map(c => {
                // @ts-ignore (propiedad dinámica que agregaremos luego al SQL)
                const estaBloqueado = c.bloqueado === true; 
                return (
                <tr key={c.id} className="hover:bg-panel-2/30 transition-colors">
                  <td className="px-6 py-4 font-bold flex items-center gap-3">
                    <div className="w-8 h-8 rounded border border-border bg-black flex items-center justify-center font-syne text-magenta">{c.nombre.charAt(0)}</div>
                    {c.nombre}
                  </td>
                  <td className="px-6 py-4">
                    {estaBloqueado ? (
                      <span className="text-xs px-2 py-1 bg-alert/10 text-alert rounded font-bold uppercase tracking-widest">Deuda / Bloqueado</span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-lime/10 text-lime rounded font-bold uppercase tracking-widest">Al Día</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                     {c.activo ? 'Habilitado' : 'Deshabilitado'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/dashboard/${c.id}`} className="px-3 py-1.5 bg-panel border border-border rounded hover:border-magenta transition-colors text-xs font-bold">
                      Ir al Workspace
                    </Link>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
