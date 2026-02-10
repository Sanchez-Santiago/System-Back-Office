
import React, { useState, useMemo } from 'react';
import { ProductType, Sale } from '../types';

const PlanDetailModal = ({ plan, onClose, companyColor }: { plan: any, onClose: () => void, companyColor: string }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
    <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
      <div className={`p-8 ${companyColor} text-white flex justify-between items-start`}>
        <div>
          <h3 className="text-3xl font-black italic tracking-tighter uppercase">{plan.name}</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mt-1">Ficha Técnica de Ventas • {plan.companyName}</p>
        </div>
        <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/40 rounded-2xl transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <div className="p-10 grid grid-cols-2 gap-8 bg-slate-50/50">
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Roaming Incluido</p>
            <p className="text-sm font-bold text-slate-700">{plan.fullDetails.roaming}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Mensajería (SMS)</p>
            <p className="text-sm font-bold text-slate-700">{plan.fullDetails.sms}</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Servicios Digitales</p>
            <div className="flex flex-wrap gap-2">
              {plan.fullDetails.services.map((s: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-600 uppercase">{s}</span>
              ))}
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Argumentario</p>
            <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">"{plan.fullDetails.finePrint}"</p>
          </div>
        </div>
      </div>
      <div className="p-8 bg-white border-t border-slate-100 flex justify-end">
        <button onClick={onClose} className="px-10 py-4 bg-slate-900 text-white rounded-[24px] text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
          Cerrar Expediente
        </button>
      </div>
    </div>
  </div>
);

interface OfertasPageProps {
  onSell: (sale: Partial<Sale>) => void;
}

export const OfertasPage: React.FC<OfertasPageProps> = ({ onSell }) => {
  const [offerType, setOfferType] = useState<'PORTA' | 'LN'>('PORTA');
  const [selectedOperator, setSelectedOperator] = useState('MOV');
  const [detailedPlan, setDetailedPlan] = useState<any | null>(null);

  const COMPANIES = [
    { id: 'MOV', name: 'Movistar', logo: 'M', color: 'bg-sky-500', text: 'text-sky-500' },
    { id: 'VOD', name: 'Vodafone', logo: 'V', color: 'bg-rose-600', text: 'text-rose-600' },
    { id: 'ORA', name: 'Orange', logo: 'O', color: 'bg-orange-500', text: 'text-orange-500' },
    { id: 'YOI', name: 'Yoigo', logo: 'Y', color: 'bg-purple-600', text: 'text-purple-600' }
  ];

  const OFFERS_DATA: Record<string, { PORTA: any[], LN: any[] }> = {
    'MOV': {
      PORTA: [
        { name: 'Ilimitada Plus 5G+', gb: 'Ilimitados', calls: 'Ilimitadas', whatsapp: true, price: '31.95€', oldPrice: '45.00€', discount: '30%', promo: '50% Dto x 12 meses', companyName: 'Movistar', companyId: 'MOV', amount: 31.95, fullDetails: { roaming: 'EU, UK, Islandia', sms: 'Ilimitados', services: ['MultiSIM', 'Seguro'], finePrint: 'Tarifa líder para portabilidades premium.' } },
        { name: 'Plan Avanzado 30GB', gb: '30 GB', calls: 'Ilimitadas', whatsapp: true, price: '19.95€', oldPrice: '25.95€', discount: '23%', promo: 'Segunda línea 50% dto', companyName: 'Movistar', companyId: 'MOV', amount: 19.95, fullDetails: { roaming: 'EU', sms: '50 SMS/mes', services: ['Antivirus'], finePrint: 'Ideal para ahorro.' } }
      ],
      LN: [{ name: 'LN Ilimitada 5G', gb: 'Ilimitados', calls: 'Ilimitadas', whatsapp: true, price: '39.95€', oldPrice: '45.00€', discount: '11%', promo: 'Sin permanencia', companyName: 'Movistar', companyId: 'MOV', amount: 39.95, fullDetails: { roaming: 'EU', sms: 'Ilimitados', services: ['SIM VIP'], finePrint: 'Para altas nuevas.' } }]
    },
    'VOD': {
      PORTA: [
        { name: 'Vodafone Ilimitada Max', gb: 'Ilimitados', calls: 'Ilimitadas', whatsapp: true, price: '35.60€', oldPrice: '42.00€', discount: '15%', promo: 'Súper descuento x 24 meses', companyName: 'Vodafone', companyId: 'VOD', amount: 35.60, fullDetails: { roaming: 'EU, USA', sms: 'Ilimitados', services: ['OneNumber'], finePrint: 'Velocidad 5G real.' } }
      ],
      LN: []
    },
    'ORA': {
      PORTA: [
        { name: 'Go Max Cine y Series', gb: 'Ilimitados', calls: 'Ilimitadas', whatsapp: true, price: '37.00€', oldPrice: '40.00€', discount: '8%', promo: 'Bono TV Gratis', companyName: 'Orange', companyId: 'ORA', amount: 37.00, fullDetails: { roaming: 'EU', sms: 'Ilimitados', services: ['Orange TV'], finePrint: 'Entretenimiento total.' } }
      ],
      LN: []
    },
    'YOI': {
      PORTA: [
        { name: 'La Sinfín Ilimitada', gb: 'Ilimitados', calls: 'Ilimitadas', whatsapp: true, price: '25.00€', oldPrice: '32.00€', discount: '22%', promo: 'Precio para siempre', companyName: 'Yoigo', companyId: 'YOI', amount: 25.00, fullDetails: { roaming: 'EU', sms: 'Ilimitados', services: ['Agile TV'], finePrint: 'Transparencia total.' } }
      ],
      LN: []
    }
  };

  const currentPlans = useMemo(() => {
    if (offerType === 'PORTA') {
      return OFFERS_DATA[selectedOperator]?.PORTA || [];
    } else {
      return Object.values(OFFERS_DATA).flatMap(comp => comp.LN || []);
    }
  }, [offerType, selectedOperator]);

  const activeCompany = COMPANIES.find(c => c.id === selectedOperator);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 glass-panel p-8 rounded-[40px] border border-white/60">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 italic uppercase">Catálogo Operativo</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Ofertas Vigentes & Promociones</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-[24px] shadow-2xl">
          <button onClick={() => setOfferType('PORTA')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${offerType === 'PORTA' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Portabilidad</button>
          <button onClick={() => setOfferType('LN')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${offerType === 'LN' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Línea Nueva</button>
        </div>
      </div>

      {offerType === 'PORTA' && (
        <div className="flex flex-wrap gap-2 bg-white/40 p-2 rounded-[28px] border border-white/60 shadow-sm">
          {COMPANIES.map((company) => (
            <button
              key={company.id}
              onClick={() => setSelectedOperator(company.id)}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${selectedOperator === company.id ? 'bg-white shadow-xl ring-2 ring-slate-100 scale-[1.02]' : 'hover:bg-white/40 opacity-60 grayscale'}`}
            >
              <div className={`w-8 h-8 rounded-lg ${company.color} flex items-center justify-center text-white font-black text-sm italic shadow-md`}>
                {company.logo}
              </div>
              <span className={`text-[11px] font-black uppercase tracking-widest ${selectedOperator === company.id ? 'text-slate-900' : 'text-slate-500'}`}>
                {company.name}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentPlans.map((plan, idx) => {
            const planComp = COMPANIES.find(c => c.id === plan.companyId);
            return (
                <div key={idx} className="bento-card rounded-[40px] p-10 flex flex-col hover:shadow-2xl hover:scale-[1.02] group relative overflow-hidden transition-all duration-500">
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg animate-pulse z-20">-{plan.discount} DTO</div>
                    <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex-1">
                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black text-white uppercase ${planComp?.color || (offerType === 'PORTA' ? activeCompany?.color : 'bg-purple-600')}`}>{plan.companyName}</span>
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none italic mt-2">{plan.name}</h4>
                    </div>
                    <div className="text-right">
                        <p className={`text-3xl font-black ${planComp?.text || (offerType === 'PORTA' ? activeCompany?.text : 'text-purple-600')} italic tracking-tighter`}>{plan.price}</p>
                    </div>
                    </div>
                    <div className={`p-5 rounded-[28px] ${planComp?.color || (offerType === 'PORTA' ? activeCompany?.color : 'bg-purple-600')} text-white shadow-xl relative overflow-hidden mb-6`}>
                    <p className="text-[12px] font-black leading-tight">{plan.promo}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-auto relative z-10">
                    <button onClick={() => setDetailedPlan(plan)} className="py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">Ficha</button>
                    <button 
                        onClick={() => onSell({ plan: plan.name, amount: plan.amount, promotion: plan.promo, productType: offerType === 'PORTA' ? ProductType.PORTABILITY : ProductType.NEW_LINE, originCompany: plan.companyName })}
                        className="py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95"
                    >
                        Vender
                    </button>
                    </div>
                </div>
            );
        })}
        {currentPlans.length === 0 && (
          <div className="col-span-full p-20 text-center glass-panel rounded-[40px]">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No hay ofertas configuradas para esta categoría.</p>
          </div>
        )}
      </div>
      {detailedPlan && <PlanDetailModal plan={detailedPlan} onClose={() => setDetailedPlan(null)} companyColor={COMPANIES.find(c => c.id === detailedPlan.companyId)?.color || "bg-slate-900"} />}
    </div>
  );
};
