import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  percentage?: string | number;
  color: string;
  icon: React.ReactElement;
  suffix?: string;
  subtitle?: string;
}

export const StatCard = ({ title, value, percentage, color, icon, suffix = '', subtitle = '' }: StatCardProps) => (
  <div className="bento-card p-[3vh] rounded-[3.5vh] flex flex-col justify-between group transition-all duration-500 overflow-hidden relative min-h-[18vh] dark:bg-slate-900/40 dark:border-white/5">
    <div className="flex justify-between items-start mb-[1.5vh] relative z-10">
      <div className={`w-[7vh] h-[7vh] rounded-[2vh] ${color} text-white flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6`}>
        {React.cloneElement(icon, { className: "w-[3.5vh] h-[3.5vh]" })}
      </div>
      {percentage !== undefined && (
        <span className={`text-[clamp(0.85rem,1.4vh,1.6rem)] font-black px-[1.8vh] py-[1vh] rounded-full ${color} bg-opacity-10 dark:bg-opacity-20 uppercase tracking-widest border border-white/50 dark:border-white/10`}>
          {percentage}%
        </span>
      )}
    </div>
    <div className="relative z-10">
      <h4 className="text-[clamp(0.75rem,1.3vh,1.5rem)] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-[1vh]">{title}</h4>
      <p className="text-[clamp(2.5rem,5.5vh,6rem)] font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">{value}{suffix}</p>
      {subtitle && <p className="text-[clamp(0.65rem,1.2vh,1.4rem)] font-bold text-slate-400 dark:text-slate-500 mt-[1vh] uppercase">{subtitle}</p>}
    </div>
    <div className="absolute -right-[2vh] -bottom-[2vh] w-[16vh] h-[16vh] opacity-[0.03] dark:opacity-[0.05] group-hover:scale-125 transition-transform duration-700 pointer-events-none text-slate-900 dark:text-white">
        {icon}
    </div>
  </div>
);
