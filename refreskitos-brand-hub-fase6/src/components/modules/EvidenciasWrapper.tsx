'use client';

import { useState } from 'react';
import { BrandKitModule } from '@/components/modules/BrandKitModule';
import { EvidenciasModule } from '@/components/modules/EvidenciasModule';
import { LayoutTemplate, Image as ImageIcon } from 'lucide-react';

export default function EvidenciasPageWrapper({ clienteId, rol, evidenciasData }: { clienteId: string, rol: string, evidenciasData: any[] }) {
  const [activeTab, setActiveTab] = useState<'brandkit' | 'captures'>('brandkit');

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      
      {/* Tabs */}
      <div className="flex bg-panel border border-border rounded-xl p-1 shrink-0 w-fit">
        <button
          onClick={() => setActiveTab('brandkit')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'brandkit' 
              ? 'bg-magenta text-white shadow-lg' 
              : 'text-text-dim hover:text-text hover:bg-panel-2'
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          Caja Fuerte (Brand Kit)
        </button>
        <button
          onClick={() => setActiveTab('captures')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'captures' 
              ? 'bg-lime text-black shadow-lg' 
              : 'text-text-dim hover:text-text hover:bg-panel-2'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Muro de Evidencias (Posts)
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'brandkit' ? (
          <BrandKitModule clienteId={clienteId} rol={rol} />
        ) : (
          <div className="bg-panel border border-border rounded-2xl h-full overflow-hidden">
            <EvidenciasModule clienteId={clienteId} initialData={evidenciasData} rol={rol} />
          </div>
        )}
      </div>
    </div>
  );
}
