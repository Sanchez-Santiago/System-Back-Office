
import React from 'react';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (val: boolean) => void;
  rowsPerPage: number | 'TODOS';
  setRowsPerPage: (val: number | 'TODOS') => void;
  onExport: () => void;
  totalRecords: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery, setSearchQuery,
  startDate, setStartDate,
  endDate, setEndDate,
  showAdvancedFilters, setShowAdvancedFilters,
  rowsPerPage, setRowsPerPage,
  onExport, totalRecords
}) => {
  return (
    <div className={`flex flex-col lg:flex-row items-center gap-4 bg-white/80 border border-white p-5 rounded-[28px] shadow-sm backdrop-blur-lg mb-8 relative transition-all ${showAdvancedFilters ? 'z-[70]' : 'z-20'}`}>
      <div className="flex-[2] relative w-full">
        <input 
          type="text" 
          placeholder="DNI, Nombre o V-XXXX..." 
          value={searchQuery} 
          className="w-full bg-white/50 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-[12px] font-bold outline-none uppercase" 
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      {/* Filtros de Fecha Rápidos */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 bg-white/40 border border-slate-200 p-2 rounded-2xl">
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Desde</span>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="bg-transparent text-[10px] font-bold text-slate-700 outline-none cursor-pointer" 
            />
          </div>
          <div className="w-px h-6 bg-slate-200"></div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Hasta</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="bg-transparent text-[10px] font-bold text-slate-700 outline-none cursor-pointer" 
            />
          </div>
          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(''); setEndDate(''); }} className="p-1 hover:text-rose-500 text-slate-300 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button 
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} 
          className={`px-6 py-3.5 rounded-2xl text-[11px] font-black border transition-all ${showAdvancedFilters ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-900 border-slate-200'}`}
        >
          Filtros
        </button>
        <button onClick={onExport} className="px-6 py-3.5 rounded-2xl text-[11px] font-black bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition-all">
          Exportar
        </button>
        <select 
          className="bg-white/50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-black text-slate-600 cursor-pointer" 
          value={rowsPerPage} 
          onChange={(e) => setRowsPerPage(e.target.value === 'TODOS' ? 'TODOS' : Number(e.target.value))}
        >
          <option value={50}>50 REGISTROS</option>
          <option value={100}>100 REGISTROS</option>
          <option value="TODOS">TODOS</option>
        </select>
      </div>
      
      <div className="ml-auto text-right min-w-[80px]">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Resultados</p>
        <p className="text-2xl font-black text-indigo-600 mt-1">{totalRecords}</p>
      </div>
    </div>
  );
};
