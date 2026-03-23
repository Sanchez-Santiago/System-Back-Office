import React from 'react';

// Esqueleto para KPI Card Individual
export const KPISkeleton = () => {
  return (
    <div className="bento-card rounded-[2.5vh] p-[2vh] h-[14vh] flex flex-col justify-between overflow-hidden relative skeleton">
      <div className="flex justify-between items-start">
        <div className="w-[10vh] h-[2vh] bg-slate-200 dark:bg-slate-700/50 rounded-full"></div>
        <div className="w-[4vh] h-[4vh] bg-slate-200 dark:bg-slate-700/50 rounded-xl"></div>
      </div>
      <div>
        <div className="w-[15vh] h-[4vh] bg-slate-200 dark:bg-slate-700/50 rounded-xl mb-[1vh]"></div>
        <div className="w-[8vh] h-[1.5vh] bg-slate-200 dark:bg-slate-700/50 rounded-full"></div>
      </div>
    </div>
  );
};

// Contenedor de Skeletons para los KPIs
export const KPICardsSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-[2vh]">
      <KPISkeleton />
      <KPISkeleton />
      <KPISkeleton />
      <KPISkeleton />
    </div>
  );
};

// Esqueleto para Fila de Ventas Registradas
export const SaleRowSkeleton = () => {
  return (
    <div className="w-full flex block glass-panel p-[1.5vh] rounded-[2vh] mb-[1vh] skeleton">
      <div className="flex-1 flex gap-[2vh] items-center">
        <div className="w-[6vh] h-[6vh] bg-slate-200 dark:bg-slate-700/50 rounded-[1.5vh]"></div>
        <div className="flex-1 space-y-[1vh]">
          <div className="w-1/3 h-[2vh] bg-slate-200 dark:bg-slate-700/50 rounded"></div>
          <div className="w-1/4 h-[1.5vh] bg-slate-200 dark:bg-slate-700/50 rounded"></div>
        </div>
        <div className="w-[10vh] h-[3vh] bg-slate-200 dark:bg-slate-700/50 rounded-full"></div>
        <div className="w-[10vh] h-[3vh] bg-slate-200 dark:bg-slate-700/50 rounded-full"></div>
        <div className="w-[8vh] h-[2vh] bg-slate-200 dark:bg-slate-700/50 rounded"></div>
      </div>
    </div>
  );
};

// Agrupación de filas para mostrar en la tabla de Gestión
export const SalesListSkeleton = () => {
  return (
    <div className="w-full">
      <SaleRowSkeleton />
      <SaleRowSkeleton />
      <SaleRowSkeleton />
      <SaleRowSkeleton />
      <SaleRowSkeleton />
    </div>
  );
};

// Esqueleto para tarjeta de Ofertas
export const OfferCardSkeleton = () => {
  return (
    <div className="bento-card rounded-[3vh] p-[2.5vh] skeleton flex flex-col gap-[2vh] h-[30vh]">
      <div className="w-[12vh] h-[3vh] bg-slate-200 dark:bg-slate-700/50 rounded-full"></div>
      <div className="w-3/4 h-[2.5vh] bg-slate-200 dark:bg-slate-700/50 rounded mt-[1vh]"></div>
      <div className="w-1/2 h-[2vh] bg-slate-200 dark:bg-slate-700/50 rounded"></div>
      <div className="mt-auto flex justify-between">
        <div className="w-[8vh] h-[4vh] bg-slate-200 dark:bg-slate-700/50 rounded-[1.5vh]"></div>
        <div className="w-[10vh] h-[4vh] bg-slate-200 dark:bg-slate-700/50 rounded-full"></div>
      </div>
    </div>
  );
};

// Lista de Ofertas
export const OffersGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[2.5vh]">
      <OfferCardSkeleton />
      <OfferCardSkeleton />
      <OfferCardSkeleton />
      <OfferCardSkeleton />
      <OfferCardSkeleton />
      <OfferCardSkeleton />
    </div>
  );
};

export const CommentSkeleton = () => (
  <div className="group relative animate-in slide-in-from-top-4 duration-500 skeleton mb-[2vh]">
    <div className="flex gap-3 lg:gap-[3vh]">
      <div className="flex flex-col items-center shrink-0">
        <div className="w-10 h-10 lg:w-[6vh] lg:h-[6vh] rounded-xl lg:rounded-[2.2vh] bg-slate-200 dark:bg-slate-700/50"></div>
      </div>
      <div className="flex-1 space-y-2 lg:space-y-[1.5vh] pb-4 lg:pb-[1vh]">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="w-[15vh] h-[2vh] bg-slate-200 dark:bg-slate-700/50 rounded-full"></div>
          <div className="w-[10vh] h-[2vh] bg-slate-200 dark:bg-slate-700/50 rounded-full"></div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 p-4 lg:p-[3vh] rounded-xl lg:rounded-[3.5vh] rounded-tl-none h-[10vh] border border-slate-200 dark:border-slate-700"></div>
      </div>
    </div>
  </div>
);

export const CommentsListSkeleton = () => (
  <div className="space-y-4 lg:space-y-6">
    <CommentSkeleton />
    <CommentSkeleton />
    <CommentSkeleton />
  </div>
);

export const SaleDetailSkeleton = () => (
  <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl lg:rounded-[2vh] overflow-hidden">
    <div className="px-8 py-5 h-[12vh] bg-slate-200 dark:bg-slate-800 flex items-center gap-6 skeleton">
      <div className="w-12 h-12 rounded-2xl bg-white/20"></div>
      <div>
        <div className="w-[30vh] h-[3vh] bg-white/20 rounded-full mb-[1vh]"></div>
        <div className="w-[20vh] h-[2vh] bg-white/20 rounded-full"></div>
      </div>
    </div>
    
    <div className="px-10 py-5 flex gap-4 border-b border-slate-200/50 skeleton">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="w-[15vh] h-[6vh] rounded-[2vh] bg-slate-200 dark:bg-slate-800"></div>
      ))}
    </div>

    <div className="flex-1 p-8 skeleton">
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="w-full h-[4vh] bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="w-full h-[8vh] bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="w-full h-[8vh] bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
        <div className="space-y-4">
          <div className="w-full h-[4vh] bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="w-full h-[12vh] bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    </div>
  </div>
);
