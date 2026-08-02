import React from 'react';
import { ProductType, Sale } from '../types';
import { OfferCardSkeleton } from '../components/sale/OfferCardSkeleton';
import { useOfertasPageViewModel, OfertaPlan } from '../viewmodels/pages/useOfertasPageViewModel';

const PlanDetailModal = ({ plan, onClose, companyColor }: { plan: OfertaPlan, onClose: () => void, companyColor: string }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-[2vh] bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
    <div className="w-[90vw] max-w-[900px] bg-white dark:bg-slate-900 rounded-[3vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-white/5">
      <div className={`p-[3vh] ${companyColor} text-white flex justify-between items-start`}>
        <div>
          <h3 className="font-black italic tracking-tighter uppercase text-[clamp(1.5rem,3vh,3.5rem)]">{plan.name}</h3>
          <p className="font-black uppercase tracking-[0.3em] opacity-80 mt-[0.5vh] text-[clamp(0.6rem,1.1vh,1.2rem)]">Ficha Técnica de Ventas • {plan.companyName}</p>
        </div>
        <button onClick={onClose} className="p-[1vh] bg-white/20 hover:bg-white/40 rounded-[1.5vh] transition-all">
          <svg className="w-[3vh] h-[3vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <div className="p-[4vh] grid grid-cols-2 gap-[3vh] bg-slate-50/50 dark:bg-white/5">
        <div className="space-y-[2vh]">
          <div className="bg-white dark:bg-slate-800 p-[2vh] rounded-[2vh] border border-slate-100 dark:border-white/5 shadow-sm">
            <p className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-[1vh] text-[clamp(0.6rem,1vh,1.2rem)]">Roaming Incluido</p>
            <p className="font-bold text-slate-700 dark:text-slate-200 text-[clamp(0.9rem,1.6vh,1.8rem)]">{plan.fullDetails.roaming}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-[2vh] rounded-[2vh] border border-slate-100 dark:border-white/5 shadow-sm">
            <p className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-[1vh] text-[clamp(0.6rem,1vh,1.2rem)]">Mensajería (SMS)</p>
            <p className="font-bold text-slate-700 dark:text-slate-200 text-[clamp(0.9rem,1.6vh,1.8rem)]">{plan.fullDetails.sms}</p>
          </div>
        </div>
        <div className="space-y-[2vh]">
          <div className="bg-white dark:bg-slate-800 p-[2vh] rounded-[2vh] border border-slate-100 dark:border-white/5 shadow-sm">
            <p className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-[1vh] text-[clamp(0.6rem,1vh,1.2rem)]">Servicios Digitales</p>
            <div className="flex flex-wrap gap-[0.5vh]">
              {plan.fullDetails.services.map((s: string, i: number) => (
                <span key={i} className="px-[1vh] py-[0.5vh] bg-slate-100 dark:bg-white/10 rounded-full font-black text-slate-600 dark:text-slate-300 uppercase text-[clamp(0.65rem,1.1vh,1.3rem)]">{s}</span>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-[2vh] rounded-[2vh] border border-slate-100 dark:border-white/5 shadow-sm">
            <p className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-[1vh] text-[clamp(0.6rem,1vh,1.2rem)]">Argumentario</p>
            <p className="font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic text-[clamp(0.8rem,1.4vh,1.6rem)]">"{plan.fullDetails.finePrint}"</p>
          </div>
        </div>
      </div>
      <div className="p-[3vh] bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5 flex justify-end">
        <button onClick={onClose} className="px-[4vh] py-[2vh] bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-[2vh] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all text-[clamp(0.8rem,1.4vh,1.6rem)]">
          Cerrar Expediente
        </button>
      </div>
    </div>
  </div>
);

interface OfertasPageProps {
  onSell: (sale: Partial<Sale>) => void;
}

const COMPANY_COLORS: Record<string, { color: string; text: string; baseColor: string }> = {
  'Movistar': { color: 'bg-sky-500', text: 'text-sky-500', baseColor: 'sky' },
  'MOVISTAR': { color: 'bg-sky-500', text: 'text-sky-500', baseColor: 'sky' },
  'Vodafone': { color: 'bg-rose-600', text: 'text-rose-600', baseColor: 'rose' },
  'Orange': { color: 'bg-orange-500', text: 'text-orange-500', baseColor: 'orange' },
  'Yoigo': { color: 'bg-purple-600', text: 'text-purple-600', baseColor: 'purple' },
  'Personal': { color: 'bg-blue-600', text: 'text-blue-600', baseColor: 'blue' },
  'Tuenti': { color: 'bg-pink-500', text: 'text-pink-500', baseColor: 'pink' },
  'Claro': { color: 'bg-red-600', text: 'text-red-600', baseColor: 'red' },
};

const COLOR_VARIATIONS = [
  { bg: 'bg-white', border: 'border-slate-200', labelBg: 'bg-slate-100', labelText: 'text-slate-700' },
  { bg: 'bg-slate-50', border: 'border-slate-300', labelBg: 'bg-slate-200', labelText: 'text-slate-800' },
  { bg: 'bg-blue-50', border: 'border-blue-200', labelBg: 'bg-blue-100', labelText: 'text-blue-800' },
  { bg: 'bg-indigo-50', border: 'border-indigo-200', labelBg: 'bg-indigo-100', labelText: 'text-indigo-800' },
];

export const OfertasPage: React.FC<OfertasPageProps> = ({ onSell }) => {
  const { state, actions } = useOfertasPageViewModel();

  const getCompanyColor = (nombreEmpresa: string) => {
    for (const [, colors] of Object.entries(COMPANY_COLORS)) {
      if (nombreEmpresa.toLowerCase().includes(colors.baseColor)) {
        return colors;
      }
    }
    for (const [key, colors] of Object.entries(COMPANY_COLORS)) {
      if (nombreEmpresa.toLowerCase().includes(key.toLowerCase())) {
        return colors;
      }
    }
    return { color: 'bg-slate-900', text: 'text-slate-900', baseColor: 'slate' };
  };

  if (state.isLoading && state.empresasFiltradas.length === 0) {
    return (
      <div className="p-[4vh] space-y-[4vh] animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-[2vh]">
          <div className="h-10 w-64 bg-slate-200/40 rounded-xl animate-pulse"></div>
          <div className="h-14 w-80 bg-slate-200/40 rounded-2xl animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[2.5vh]">
          {[1, 2, 3, 4].map(i => <OfferCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-[4vh] space-y-[3vh] animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-[2vh]">
        <div>
          <h2 className="font-black italic text-slate-900 dark:text-white uppercase tracking-tighter text-[clamp(1.8rem,3.5vh,3.5rem)]">Ofertas Activas</h2>
          <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] text-[clamp(0.7rem,1.2vh,1rem)]">Planes y Promociones Comerciales</p>
        </div>
        <div className="flex gap-[1vh] bg-white dark:bg-slate-800 p-[0.8vh] rounded-[2vh] border border-slate-200 dark:border-white/5 shadow-lg">
          <button 
            onClick={() => { actions.setOfferType('PORTA'); }}
            className={`px-[3vh] py-[1.5vh] rounded-[1.5vh] font-black uppercase tracking-widest text-[clamp(0.7rem,1.3vh,1.1rem)] transition-all ${state.offerType === 'PORTA' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'}`}
          >
            🔄 Portabilidad
          </button>
          <button 
            onClick={() => { actions.setOfferType('LN'); }}
            className={`px-[3vh] py-[1.5vh] rounded-[1.5vh] font-black uppercase tracking-widest text-[clamp(0.7rem,1.3vh,1.1rem)] transition-all ${state.offerType === 'LN' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-purple-600'}`}
          >
            📱 Línea Nueva
          </button>
        </div>
      </div>

      {/* Tabs de Empresas */}
      {state.empresasFiltradas.length > 0 && (
        <div className="flex gap-[1vh] overflow-x-auto pb-[1vh]">
          {state.empresasFiltradas.map(empresa => {
            const colors = getCompanyColor(empresa.nombre_empresa);
            const isSelected = state.selectedOperator === empresa.nombre_empresa;
            return (
              <button
                key={empresa.empresa_origen_id}
                onClick={() => actions.handleEmpresaChange(empresa)}
                className={`flex-shrink-0 px-[2.5vh] py-[1.2vh] rounded-[1.5vh] font-black uppercase tracking-widest text-[clamp(0.65rem,1.1vh,1rem)] transition-all ${
                  isSelected
                    ? `${colors.color} text-white shadow-lg` 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 hover:border-indigo-300'
                }`}
              >
                {empresa.nombre_empresa}
              </button>
            );
          })}
        </div>
      )}

      {/* Grupos de Promociones */}
      <div className="space-y-[4vh]">
        {state.isLoading && state.planes.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[2.5vh]">
            {[1, 2, 3, 4].map(i => <OfferCardSkeleton key={i} />)}
          </div>
        ) : (
          state.gruposPorPromocion.map((grupo, grupoIndex) => {
            const colorVar = COLOR_VARIATIONS[grupoIndex % COLOR_VARIATIONS.length];
            return (
              <div 
                key={grupo.promocionId} 
                className={`rounded-[3vh] p-[3vh] border-2 ${colorVar.border} ${colorVar.bg} dark:bg-slate-800/50 dark:border-slate-700`}
              >
                {/* Header del grupo de promoción */}
                <div className="flex items-center justify-between mb-[3vh]">
                  <div className={`px-[3vh] py-[1.5vh] rounded-[2vh] ${colorVar.labelBg} ${colorVar.labelText} dark:bg-slate-700 dark:text-white`}>
                    <span className="font-black uppercase tracking-widest text-[clamp(0.8rem,1.4vh,1.2rem)]">
                      {grupo.descuento > 0 ? `${grupo.promocionNombre} (-${grupo.descuento}%)` : grupo.promocionNombre}
                    </span>
                  </div>
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[clamp(0.7rem,1.2vh,1rem)]">
                    {grupo.planes.length} {grupo.planes.length === 1 ? 'plan' : 'planes'}
                  </span>
                </div>

                {/* Grid de Planes dentro del grupo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2.5vh]">
                  {grupo.planes.map((plan, idx) => {
                    const colors = getCompanyColor(plan.companyName);
                    return (
                      <div 
                        key={`${plan.id}-${idx}`} 
                        className="bg-white dark:bg-slate-900 rounded-[3vh] p-[3.5vh] flex flex-col hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] hover:scale-[1.02] group relative overflow-hidden transition-all duration-300 border border-slate-200 dark:border-white/10"
                      >
                        {/* Badge de descuento */}
                        {plan.discount !== '0%' && (
                          <div className="absolute top-[2vh] right-[2vh] bg-emerald-500 text-white px-[2vh] py-[1vh] rounded-full font-black uppercase tracking-widest shadow-lg z-20 text-[clamp(0.65rem,1.1vh,1.2rem)]">
                            -{plan.discount}
                          </div>
                        )}
                        
                        {/* Header de la tarjeta */}
                        <div className="flex justify-between items-start mb-[2.5vh] relative z-10">
                          <div className="flex-1">
                            <span className={`px-[1.5vh] py-[0.6vh] rounded-[1vh] font-black text-white uppercase text-[clamp(0.6rem,1vh,1.2rem)] ${colors.color}`}>
                              {plan.companyName}
                            </span>
                            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight italic mt-[1.5vh] text-[clamp(1.3rem,2.8vh,2.5rem)]">
                              {plan.name}
                            </h4>
                          </div>
                          <div className="text-right">
                            <p className={`font-black ${colors.text} dark:text-white italic tracking-tighter leading-none text-[clamp(1.8rem,4vh,4rem)]`}>
                              {plan.price}
                            </p>
                            {plan.oldPrice && (
                              <p className="text-slate-400 line-through font-bold text-[clamp(0.85rem,1.5vh,1.6rem)]">
                                {plan.oldPrice}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Detalles del plan */}
                        <div className={`p-[2.5vh] rounded-[2vh] ${colors.color} text-white shadow-lg relative overflow-hidden mb-[2.5vh]`}>
                          <p className="font-black leading-snug text-[clamp(0.85rem,1.5vh,1.6rem)]">{plan.promo}</p>
                          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rotate-45 translate-x-8 -translate-y-8 group-hover:translate-x-full transition-transform duration-1000"></div>
                        </div>

                        {/* GB y llamadas */}
                        <div className="flex gap-[2vh] mb-[2.5vh]">
                          <div className="flex-1 text-center p-[1.5vh] bg-slate-100 dark:bg-slate-800 rounded-[1.5vh]">
                            <p className="font-black text-slate-900 dark:text-white text-[clamp(1.2rem,2.5vh,2rem)]">{plan.gb}</p>
                            <p className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.6rem,1vh,0.9rem)]">Datos</p>
                          </div>
                          <div className="flex-1 text-center p-[1.5vh] bg-slate-100 dark:bg-slate-800 rounded-[1.5vh]">
                            <p className="font-black text-slate-900 dark:text-white text-[clamp(1rem,2vh,1.5rem)]">{plan.calls}</p>
                            <p className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.6rem,1vh,0.9rem)]">Llamadas</p>
                          </div>
                        </div>

                        {/* Botones */}
                        <div className="grid grid-cols-2 gap-[2vh] mt-auto relative z-10">
                          <button 
                            onClick={() => actions.setDetailedPlan(plan)} 
                            className="py-[2vh] rounded-[2vh] bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 hover:border-indigo-200 transition-all active:scale-95 text-[clamp(0.75rem,1.3vh,1.4rem)] shadow-sm"
                          >
                            Ficha
                          </button>
                          <button
                            onClick={() => onSell({
                              plan: plan.name,
                              amount: plan.amount,
                              promotion: plan.promo,
                              promocion_id: plan.promoId,
                              productType: state.offerType === 'PORTA' ? ProductType.PORTABILITY : ProductType.NEW_LINE,
                              originCompany: plan.companyName,
                              plan_id: plan.id,
                              empresa_origen_id: plan.companyId
                            })}
                            className="py-[2vh] rounded-[2vh] bg-slate-900 dark:bg-indigo-600 text-white font-black uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all active:scale-95 text-[clamp(0.75rem,1.3vh,1.4rem)] shadow-xl"
                          >
                            Vender
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
        
        {!state.isLoading && state.gruposPorPromocion.length === 0 && (
          <div className="p-[6vh] text-center glass-panel rounded-[3vh] dark:bg-slate-900/40 dark:border-white/5">
            <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[clamp(0.8rem,1.5vh,1rem)]">
              {state.selectedEmpresaId 
                ? 'No hay ofertas configuradas para esta empresa.' 
                : 'Seleccione una empresa para ver las ofertas.'}
            </p>
          </div>
        )}
      </div>
      
      {state.detailedPlan && (
        <PlanDetailModal 
          plan={state.detailedPlan} 
          onClose={() => actions.setDetailedPlan(null)} 
          companyColor={getCompanyColor(state.detailedPlan.companyName).color} 
        />
      )}
    </div>
  );
};
