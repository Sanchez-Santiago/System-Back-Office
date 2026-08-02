import React from 'react';

interface MiniStatusBadgeProps {
  label: string;
  percentage: string;
  count: number;
  colorClass: string;
  icon: React.ReactElement;
}

export const MiniStatusBadge = ({ label, percentage, count, colorClass, icon }: MiniStatusBadgeProps) => (
  <div className="bg-white/60 dark:bg-slate-900/40 p-[2.2vh] rounded-[3vh] border border-white dark:border-white/5 shadow-sm flex flex-col group hover:shadow-md transition-all">
    <div className="flex justify-between items-center mb-[1.5vh]">
      <div className={`w-[4.5vh] h-[4.5vh] rounded-[1.2vh] ${colorClass} text-white flex items-center justify-center shadow-sm`}>
        {React.cloneElement(icon, { className: "w-[2.5vh] h-[2.5vh]" })}
      </div>
      <span className="text-[clamp(0.65rem,1.2vh,1.4rem)] font-black text-slate-400 dark:text-slate-500 uppercase">{count} UNID.</span>
    </div>
    <p className="text-[clamp(0.65rem,1.2vh,1.4rem)] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-[0.5vh]">{label}</p>
    <p className={`text-[clamp(1.5rem,3.5vh,3.5rem)] font-black italic tracking-tighter leading-none ${colorClass.replace('bg-', 'text-').replace('-500', '-600 dark:text-400')}`}>{percentage}%</p>
  </div>
);
