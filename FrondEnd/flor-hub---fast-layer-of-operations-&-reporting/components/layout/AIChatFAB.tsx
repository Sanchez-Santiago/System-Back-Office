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
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
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
