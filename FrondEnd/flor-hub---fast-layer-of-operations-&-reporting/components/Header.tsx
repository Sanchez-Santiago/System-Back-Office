
import React, { useState } from 'react';
import { AppTab } from '../types';
import { NotificationCenter } from './NotificationCenter';
import { ProfileMenu } from './ProfileMenu';
import { Logo } from './Logo';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenNomina: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenNomina }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    setShowProfileMenu(false);
  };

  const toggleProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowProfileMenu(!showProfileMenu);
    setShowNotifications(false);
  };

  const closeMenus = () => {
    setShowNotifications(false);
    setShowProfileMenu(false);
  };

  return (
    <>
      {(showNotifications || showProfileMenu) && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-sm transition-all duration-500 animate-in fade-in"
          onClick={closeMenus}
        ></div>
      )}

      <header className="sticky top-0 z-50 w-full px-4 py-3">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between glass-panel rounded-[28px] px-8 py-4 relative">
          
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-fuchsia-500/5 pointer-events-none rounded-[28px] overflow-hidden"></div>

          <div className="flex items-center gap-10 relative z-10">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActiveTab('GESTIÓN')}>
              <Logo size="md" />
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black tracking-tighter text-slate-900 leading-none uppercase">FLOR</span>
                  <span className="text-2xl font-black tracking-tighter text-indigo-600 leading-none uppercase">HUB</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[8px] font-black text-slate-400 tracking-[0.4em] uppercase opacity-80">FAST LAYER OPS</span>
                </div>
              </div>
            </div>

            <nav className="hidden lg:flex items-center bg-white/30 backdrop-blur-md p-1.5 rounded-[20px] border border-white/40">
              {(['GESTIÓN', 'SEGUIMIENTO', 'REPORTES', 'OFERTAS'] as AppTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-2xl text-[11px] font-black transition-all uppercase tracking-widest ${
                    activeTab === tab 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                      : 'text-indigo-900/60 hover:text-indigo-600 hover:bg-white/40'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-5 relative z-10">
            <div className="relative">
              <button 
                onClick={toggleNotifications}
                className={`relative w-11 h-11 flex items-center justify-center rounded-2xl transition-all border shadow-sm ${showNotifications ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white/40 text-indigo-900 border-white/60 hover:bg-indigo-50'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
              </button>
              {showNotifications && <NotificationCenter onClose={closeMenus} />}
            </div>
            
            <div className="h-8 w-px bg-indigo-900/10 mx-1"></div>

            <div className="relative">
              <div 
                className="flex items-center gap-4 cursor-pointer group"
                onClick={toggleProfile}
              >
                 <div className="text-right hidden sm:block">
                   <p className={`text-xs font-black leading-none transition-colors ${showProfileMenu ? 'text-indigo-600' : 'text-slate-900'}`}>OPERADOR_ADMIN</p>
                   <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">Online</p>
                 </div>
                 <div className={`w-11 h-11 rounded-2xl border-2 overflow-hidden shadow-lg transition-all ${showProfileMenu ? 'border-indigo-600 scale-110 ring-4 ring-indigo-50' : 'border-white/80 group-hover:scale-105'}`}>
                   <img src="https://picsum.photos/100/100?random=1" alt="Avatar" />
                 </div>
              </div>
              {showProfileMenu && <ProfileMenu onClose={closeMenus} onOpenNomina={onOpenNomina} />}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
