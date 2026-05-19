import React from 'react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full mt-auto py-[4vh] px-[2vw] relative border-t border-slate-200/50 dark:border-white/5 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-transparent dark:from-indigo-500/10 dark:via-purple-500/10 opacity-50 pointer-events-none"></div>
      
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-[3vh] relative z-10">
        <div className="flex items-center gap-[2vh]">
          <div className="w-[4.5vh] h-[4.5vh] rounded-[1.2vh] bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 flex items-center justify-center text-white font-black text-[clamp(0.9rem,1.8vh,1.8rem)] shadow-lg shadow-indigo-500/30">
            <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter italic text-[clamp(1rem,1.8vh,1.8rem)]">FLOR HUB</h4>
            <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] text-[clamp(0.55rem,1.1vh,1.1rem)]">Enterprise Operations System</p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-[2vh] md:gap-[3vh] text-[clamp(0.65rem,1.1vh,1.2rem)] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          <span className="flex items-center gap-[0.8vh]">
            <span className="w-[1vh] h-[1vh] bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
            Sistema 100% Operativo
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
          <span>v2.1.0 (Stable)</span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
          <span className="font-black text-slate-700 dark:text-slate-300">Creado: Santiago Javier Sanchez</span>
        </div>
      </div>
    </footer>
  );
};
