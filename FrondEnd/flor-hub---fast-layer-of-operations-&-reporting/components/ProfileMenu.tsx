
import React, { useState } from 'react';
import { PasswordChangeModal } from './PasswordChangeModalSimplificado';
import { getCurrentUserId, buildPasswordChangeUrl } from '../utils/userHelpers';

interface ProfileMenuProps {
  onClose: () => void;
  onOpenNomina: () => void;
  onLogout?: () => void;
}

type MenuState = 'MAIN' | 'UPDATE_SUBMENU' | 'CONFIG_SUBMENU';

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ onClose, onOpenNomina, onLogout }) => {
  const [view, setView] = useState<MenuState>('MAIN');
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleUpdateAction = (type: string) => {
    setIsSyncing(type);
    // Simulación de proceso técnico de actualización masiva/sincronización
    setTimeout(() => {
      setIsSyncing(null);
    }, 2000);
  };

  const renderMainMenu = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="px-3 pb-3 pt-1 space-y-2">
        <button 
          onClick={() => setView('UPDATE_SUBMENU')}
          className="w-full group relative overflow-hidden flex items-center justify-between gap-3 p-4 rounded-[24px] bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md group-hover:rotate-12 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </div>
            <div className="text-left">
              <p className="text-[11px] font-black uppercase tracking-widest leading-none">Acciones Globales</p>
              <p className="text-[9px] font-bold text-indigo-200 mt-1 uppercase opacity-80">Actualizar registros</p>
            </div>
          </div>
          <svg className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); onOpenNomina(); onClose(); }}
          className="w-full group relative overflow-hidden flex items-center justify-between gap-3 p-4 rounded-[24px] bg-white border border-slate-200 text-slate-900 shadow-sm hover:border-emerald-200 hover:bg-emerald-50 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:rotate-6 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div className="text-left">
              <p className="text-[11px] font-black uppercase tracking-widest leading-none">Nómina Vendedores</p>
              <p className="text-[9px] font-bold text-emerald-600 mt-1 uppercase opacity-80">Gestión de Legajos</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-emerald-300 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>

      <div className="h-px bg-slate-200/60 mx-4 mb-3"></div>

      <div className="px-2 space-y-1">
        <p className="px-4 py-1 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-60">Configuración</p>
        
        <button className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-white transition-all group border border-transparent hover:border-slate-100 hover:shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 011-8 4 4 0 011 8zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Mi Perfil Técnico</span>
          </div>
        </button>

        <button 
          onClick={() => setView('CONFIG_SUBMENU')}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-white transition-all group border border-transparent hover:border-slate-100 hover:shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
            </div>
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Preferencias</span>
          </div>
        </button>
      </div>

      <div className="h-px bg-slate-200/60 mx-4 my-3"></div>

      <div className="px-4 pb-4">
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onLogout?.(); 
            onClose(); 
          }}
          className="w-full flex items-center gap-4 p-4 rounded-[24px] bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all group border border-rose-100/50 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );

  const renderUpdateSubmenu = () => (
    <div className="animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="px-4 py-2 mb-2 flex items-center gap-3">
        <button 
          onClick={() => setView('MAIN')}
          className="p-2 bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 rounded-xl transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Sincronización Global</h5>
      </div>

      <div className="px-4 pb-6 space-y-3">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Selecciona el módulo a actualizar:</p>
        
        {[
          { id: 'status', label: 'Actualizar Status', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'indigo' },
          { id: 'offers', label: 'Actualizar Ofertas', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'emerald' },
          { id: 'correo', label: 'Actualizar Correo', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'purple' },
          { id: 'linea', label: 'Seguimiento de Línea', icon: 'M8.111 16.404a5.5 5.5 0 117.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0', color: 'fuchsia' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handleUpdateAction(item.id)}
            disabled={isSyncing !== null}
            className={`w-full group relative overflow-hidden flex items-center gap-4 p-4 rounded-[24px] border border-slate-100 bg-white hover:border-${item.color}-200 hover:bg-${item.color}-50/30 transition-all active:scale-[0.98] disabled:opacity-50`}
          >
            <div className={`w-12 h-12 rounded-2xl bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center transition-colors`}>
              {isSyncing === item.id ? (
                <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon}></path></svg>
              )}
            </div>
            <div className="text-left">
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{item.label}</span>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Sincronización en masa</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderConfigSubmenu = () => {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="px-6 py-4 pb-8 space-y-4 max-w-md bg-white rounded-[28px] shadow-2xl">
          {/* Header del menú de configuración */}
          <div className="px-4 py-2 mb-4 flex items-center gap-3">
            <button 
              onClick={() => setView('MAIN')}
              className="p-3 bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 rounded-xl transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path>
              </svg>
              <span className="text-[11px] font-medium text-slate-700">Volver</span>
            </button>
            <h5 className="text-[13px] font-bold text-slate-800 uppercase tracking-wider">Configuración</h5>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-6 font-medium">Ajustes de cuenta y seguridad</p>
            
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="w-full group relative overflow-hidden flex items-center justify-between gap-4 p-5 rounded-[24px] bg-white border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all active:scale-[0.98] shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-600 group-hover:from-indigo-100 group-hover:to-indigo-200 transition-all shadow-inner">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a4 4 0 11-8 0 4 4 0 011-8 4 4 0 011 8zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7h4v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-bold text-slate-800 uppercase tracking-wide leading-tight">Actualizar Contraseña</p>
                  <p className="text-[10px] font-medium text-indigo-600 mt-2 uppercase tracking-wider">Seguridad y Privacidad</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </button>

            {/* Placeholder para futuras opciones */}
            <div className="pt-6 border-t border-slate-100/50">
              <div className="flex items-center justify-center py-4">
                <div className="w-8 h-px bg-slate-200 rounded-full"></div>
              </div>
              <p className="text-[9px] text-slate-400 text-center font-medium">Más opciones próximamente</p>
            </div>
          </div>
        </div>

        {/* Modal de cambio de contraseña - separado del menú */}
        {showPasswordModal && (
          <PasswordChangeModal 
            onClose={() => setShowPasswordModal(false)}
            onSuccess={() => {
              setShowPasswordModal(false);
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div 
      className="absolute top-14 right-0 w-96 glass-panel rounded-[36px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.25)] z-[100] overflow-hidden border border-white/70 animate-in fade-in slide-in-from-top-4 duration-500"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 text-white relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative">
            <div className="w-20 h-20 rounded-[28px] border-2 border-indigo-400/40 p-1 bg-white/5 backdrop-blur-xl shadow-2xl">
              <img src="https://picsum.photos/100/100?random=1" alt="Avatar" className="w-full h-full object-cover rounded-[22px]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full animate-pulse"></div></div>
          </div>
          <div>
            <div className="flex items-center gap-2"><h4 className="text-base font-black uppercase tracking-tighter leading-none">OPERADOR_ADMIN</h4><span className="px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-400/30 text-[8px] font-black text-indigo-300 uppercase tracking-widest">PRO</span></div>
            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em] mt-2 opacity-80">Administrador Senior</p>
          </div>
        </div>
      </div>
      <div className="bg-slate-50/80 backdrop-blur-md">
        {view === 'MAIN' && renderMainMenu()}
        {view === 'UPDATE_SUBMENU' && renderUpdateSubmenu()}
        {view === 'CONFIG_SUBMENU' && renderConfigSubmenu()}
      </div>
      <div className="p-5 bg-white border-t border-slate-100 flex items-center justify-between">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">FLOR HUB STABLE v4.2</p>
        <div className="flex gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div><div className="w-1.5 h-1.5 rounded-full bg-indigo-200"></div></div>
      </div>
    </div>
  );
};
