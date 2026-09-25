'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';

export function ConfiguracionModule() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLimpiar = async () => {
    if (!confirm('¿Estás seguro de que quieres limpiar toda la información (facturas, calendarios, parrillas, métricas)? Esto dejará todo en CERO. Se guardará una copia de seguridad automática.')) {
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.rpc('limpiar_sistema');
    setLoading(false);
    
    if (error) {
      alert('Error limpiando sistema: ' + error.message);
    } else {
      alert('✅ Sistema limpiado exitosamente. Todo está en cero.');
      window.location.reload();
    }
  };

  const handleRestaurar = async () => {
    if (!confirm('¿Estás seguro de que quieres restaurar la copia de seguridad anterior? Esto sobreescribirá los datos actuales con los datos borrados previamente.')) {
      return;
    }

    setLoading(true);
    const { error } = await supabase.rpc('restaurar_sistema');
    setLoading(false);
    
    if (error) {
      alert('Error restaurando sistema: ' + error.message);
    } else {
      alert('♻️ Sistema restaurado con éxito. Se recuperó la información.');
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-syne font-bold text-text">Configuración del Sistema</h1>
          <p className="text-text-dim text-sm mt-1">Ajustes avanzados y gestión de base de datos.</p>
        </div>
      </div>

      <div className="bg-panel border border-alert/30 rounded-card p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-alert/10 text-alert rounded-lg">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-syne font-bold text-lg text-text">Zona de Peligro: Reseteo de Datos</h3>
            <p className="text-sm text-text-dim mt-1">
              Aquí puedes dejar todas las métricas, facturas, calendarios y parrillas en <b>cero</b> para empezar a usar la matemática real en limpio. Las cuentas de los clientes y sus contraseñas no se borrarán.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={handleLimpiar} 
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 bg-black border border-alert/30 rounded-lg hover:bg-alert/5 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-8 h-8 text-alert mb-3" />
            <span className="font-bold text-alert">Empezar de Cero</span>
            <span className="text-xs text-text-dim mt-2 text-center">Borra todo y crea un respaldo de seguridad.</span>
          </button>

          <button 
            onClick={handleRestaurar} 
            disabled={loading}
            className="flex flex-col items-center justify-center p-6 bg-black border border-lime/30 rounded-lg hover:bg-lime/5 transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-8 h-8 text-lime mb-3" />
            <span className="font-bold text-lime">Restaurar Información</span>
            <span className="text-xs text-text-dim mt-2 text-center">Recupera los datos de la última limpieza.</span>
          </button>
        </div>
      </div>
    </div>
  );
}
