
import React from 'react';
import { Sale } from '../types';

interface SaleModalProps {
  sale: Sale;
  onClose: () => void;
}

export const SaleModal: React.FC<SaleModalProps> = ({ sale, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row h-[85vh]">
        
        {/* Left Side: Detail & Form */}
        <div className="w-full md:w-3/5 p-8 overflow-y-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest">{sale.id}</span>
                <span className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span> Prioridad {sale.priority}
                </span>
              </div>
              <h2 className="text-3xl font-black tracking-tighter text-slate-900 mt-3">{sale.customerName}</h2>
              <p className="text-slate-400 font-medium text-sm mt-1">DNI: {sale.dni} • Creado el {sale.date}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-2xl transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="col-span-2 bg-slate-50/50 rounded-[24px] p-6 border border-slate-100">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Información del Producto</h4>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Servicio</p>
                   <p className="text-sm font-black text-slate-900">{sale.productType}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ciclo</p>
                   <p className="text-sm font-black text-slate-900">MENSUAL</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Cuota</p>
                   <p className="text-sm font-black text-indigo-600">{sale.amount}€/mes</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Permanencia</p>
                   <p className="text-sm font-black text-slate-900">12 MESES</p>
                 </div>
               </div>
             </div>

             <div className="bg-emerald-50/50 rounded-[24px] p-6 border border-emerald-100">
               <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Estado Actual</h4>
               <p className="text-xl font-black text-emerald-700 uppercase">{sale.status}</p>
               <button className="mt-4 px-4 py-2 bg-white text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all">Cambiar Estado</button>
             </div>

             <div className="bg-indigo-50/50 rounded-[24px] p-6 border border-indigo-100">
               <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Logística Real-Time</h4>
               <p className="text-xl font-black text-indigo-700 uppercase">{sale.logisticStatus}</p>
               <p className="text-[10px] font-medium text-indigo-500 mt-1 italic">Última actualización: Hoy, 09:42h</p>
             </div>
          </div>
        </div>

        {/* Right Side: Event Log (Bitácora) */}
        <div className="w-full md:w-2/5 bg-slate-50 p-8 border-l border-slate-100 overflow-y-auto">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Bitácora de Eventos
          </h3>
          
          <div className="space-y-6 relative before:absolute before:left-2.5 before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-200">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="relative pl-8">
                <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-indigo-400 z-10"></div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-indigo-600 uppercase">EVENTO TÉCNICO #{i}</span>
                    <span className="text-[9px] font-bold text-slate-400 italic">2024-05-1{i} 14:3{i}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">Validación de scoring aprobada automáticamente.</p>
                  <p className="text-xs text-slate-500 mt-1">El sistema verificó el riesgo crediticio sin incidencias.</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <textarea 
              placeholder="Añadir nota técnica..." 
              className="w-full border-none bg-transparent text-xs focus:ring-0 resize-none h-20 placeholder:text-slate-300 font-semibold"
            ></textarea>
            <div className="flex justify-end mt-2">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors">Guardar Nota</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
