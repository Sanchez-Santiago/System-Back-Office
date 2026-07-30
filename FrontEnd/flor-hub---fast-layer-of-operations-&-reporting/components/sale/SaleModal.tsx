import React from 'react';
import { Sale, SaleStatus, LogisticStatus } from '../../types';
import { useSaleDetailViewModel } from '../../viewmodels/sale/useSaleDetailViewModel';

// Internal components
import { TabVenta } from './tabs/TabVenta';
import { TabCliente } from './tabs/TabCliente';
import { TabPlan } from './tabs/TabPlan';
import { TabCorreo } from './tabs/TabCorreo';
import { TabEstados } from './tabs/TabEstados';
import { getStatusColor } from './SaleModalHelpers';
import { SaleDetailSkeleton } from '../common/Skeletons';

type TabType = 'venta' | 'cliente' | 'plan' | 'correo' | 'estados';

interface SaleModalProps {
  sale: Sale;
  onClose: () => void;
  onUpdate: (updatedSale: any) => Promise<void>;
  onUpdateStatus?: (status: SaleStatus, comment: string) => Promise<void>;
  onUpdateLogistic?: (status: LogisticStatus, comment: string) => Promise<void>;
}

export const SaleModal = ({ sale, onClose, onUpdate, onUpdateStatus, onUpdateLogistic }: SaleModalProps) => {
  const { state: vm, actions } = useSaleDetailViewModel(sale?.id.replace('V-', '') || null);
  const { editedData, isLoadingDetalle, activeTab, isEditing, hasChanges } = vm;

  const handleSave = () => actions.handleSave(onUpdate);

  const renderTabButton = (id: TabType, icon: string, label: string) => (
    <button
      onClick={() => actions.setActiveTab(id)}
      className={`flex items-center gap-[1.5vh] px-[3vh] py-[1.8vh] rounded-[2vh] transition-all duration-500 whitespace-nowrap ${
        activeTab === id 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none scale-105' 
          : 'bg-white dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'
      }`}
    >
      <span className="text-[2vh]">{icon}</span>
      <span className="font-black uppercase tracking-widest text-[clamp(0.6rem,1.1vh,1.3rem)]">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-[2vw] bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose}>
      <div className="w-full max-w-[95vw] h-[92vh] bg-[#f8fafc] dark:bg-slate-900 rounded-2xl lg:rounded-[2vh] shadow-2xl flex flex-col overflow-hidden border border-white/20 relative group/modal" onClick={(e) => e.stopPropagation()}>
        <React.Fragment>
          {isLoadingDetalle || !editedData ? (
            <SaleDetailSkeleton />
          ) : (
            <>
              {/* Header */}
              <div className="px-8 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:via-slate-900 dark:to-black text-white flex justify-between items-center shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/10 backdrop-blur-sm">
                    📂
                  </div>
                  <div>
                    <h3 className="font-black text-2xl uppercase italic leading-none tracking-tighter">VENTA {editedData.id}</h3>
                    <p className="text-xs font-bold uppercase opacity-80 mt-1 tracking-widest">{editedData.cliente.nombre} {editedData.cliente.apellido} | DNI: {editedData.cliente.documento}</p>
                  </div>
                </div>
                <button onClick={onClose} className="relative z-10 p-2 bg-white/10 hover:bg-rose-500 rounded-xl transition-all border border-white/10 hover:border-white/20">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              {/* Navigation */}
              <div className="px-10 py-5 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-b border-slate-200/50 flex gap-4 overflow-x-auto shrink-0 scrollbar-hide">
                {renderTabButton('venta', '📋', 'Información General')}
                {renderTabButton('cliente', '👤', 'Cliente')}
                {renderTabButton('plan', '📱', 'Plan')}
                {editedData.chip !== 'ESIM' && renderTabButton('correo', '📮', 'Logística')}
                {renderTabButton('estados', '📊', 'Estados')}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 bg-white/50 dark:bg-slate-900/50 no-scrollbar pb-24">
                {activeTab === 'venta' && <TabVenta editedData={editedData} isEditing={isEditing} onEdit={actions.handleEdit} />}
                {activeTab === 'cliente' && <TabCliente editedData={editedData} />}
                {activeTab === 'plan' && <TabPlan editedData={editedData} isEditing={isEditing} onEdit={actions.handleEdit} />}
                {activeTab === 'correo' && <TabCorreo editedData={editedData} isEditing={isEditing} onEdit={actions.handleEdit} onUpdateLogistic={onUpdateLogistic} />}
                {activeTab === 'estados' && (
                  <TabEstados 
                    editedData={editedData} 
                    onUpdateStatus={onUpdateStatus}
                    onUpdateLogistic={onUpdateLogistic}
                  />
                )}
              </div>

              {/* Floating Action Buttons */}
              <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-50">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleSave} 
                      disabled={!hasChanges}
                      className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 ${hasChanges ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                      title="Guardar Cambios"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                    </button>
                    <button 
                      onClick={actions.cancelEdit} 
                      className="w-14 h-14 bg-white dark:bg-slate-800 text-rose-500 rounded-full flex items-center justify-center shadow-lg hover:bg-rose-50 dark:hover:bg-slate-700 transition-all hover:scale-110"
                      title="Cancelar Edición"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => actions.setIsEditing(true)} 
                    className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all hover:scale-110 hover:rotate-90"
                    title="Editar Venta"
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                )}
              </div>
            </>
          )}
        </React.Fragment>
      </div>
    </div>
  );
};



