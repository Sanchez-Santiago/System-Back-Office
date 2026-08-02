import React, { useState } from 'react';

interface AIChatFABProps {
  onClick?: () => void;
}

export const AIChatFAB: React.FC<AIChatFABProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-[4vh] right-[3vw] z-50">
      <button
        onClick={onClick}
        className="group relative w-[7vh] h-[7vh] rounded-[2.2vh] bg-gradient-to-br from-violet-600 to-indigo-900 text-white shadow-[0_2vh_4vh_-1vh_rgba(139,92,246,0.5)] flex items-center justify-center transition-all duration-500 hover:scale-110 hover:shadow-violet-500/50"
        title="Chat con IA"
      >
        <svg 
          className="w-[3.5vh] h-[3.5vh]" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M7 8h10M7 12h6m8 5a3 3 0 01-3 3h-6l-3 3v-3H6a3 3 0 01-3-3V7a3 3 0 013-3h12a3 3 0 013 3v10z" 
          />
        </svg>
        
        {/* Tooltip */}
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Chat con IA
        </span>
      </button>
    </div>
  );
};
