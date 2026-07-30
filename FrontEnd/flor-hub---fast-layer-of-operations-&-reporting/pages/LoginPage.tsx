import React from 'react';
import { Logo } from '../components/common/Logo';
import { useLoginViewModel } from '../viewmodels/pages/useLoginViewModel';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  error?: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error }) => {
  const { state, actions } = useLoginViewModel(onLogin, error);

  return (
    <div className="h-screen w-full flex items-center justify-center p-[5vh] relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <div className="absolute top-[-20%] left-[-10%] w-[100vmin] h-[100vmin] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[15vmin] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[100vmin] h-[100vmin] bg-fuchsia-600/10 dark:bg-fuchsia-600/20 rounded-full blur-[15vmin] animate-pulse delay-700"></div>

      <div className="w-[clamp(450px,80vmin,1600px)] max-h-[85vh] glass-panel rounded-[4vmin] p-[clamp(1.5rem,4vmin,8rem)] border border-slate-200 dark:border-white/20 shadow-[0_4vmin_15vmin_-2vmin_var(--shadow-color)] animate-in fade-in zoom-in-95 duration-700 relative z-10 text-center flex flex-col justify-center gap-[clamp(1rem,2.8vmin,6rem)] transition-all">
        
        <header className="flex flex-col items-center flex-shrink-0">
          <div className="w-[clamp(3.5rem,15vmin,16rem)] h-[clamp(3.5rem,15vmin,16rem)] relative mb-[1.5vmin]">
            <Logo size="md" className="!w-full !h-full" />
          </div>
          <div className="flex items-baseline gap-[1vw] justify-center">
            <h1 className="text-[clamp(1.5rem,6vmin,10rem)] font-black tracking-tighter text-slate-900 dark:text-white uppercase italic leading-none">FLOR</h1>
            <h1 className="text-[clamp(1.5rem,6vmin,10rem)] font-black tracking-tighter text-indigo-600 uppercase italic leading-none">HUB</h1>
          </div>
          <p className="text-[clamp(8px,1.3vmin,20px)] font-black text-slate-600 dark:text-slate-500 uppercase tracking-[0.4em] mt-[0.5vmin] opacity-90 dark:opacity-80">
            SISTEMA INTEGRADO DE CAPAS OPERATIVAS
          </p>
        </header>

        {(state.localError || error) && (
          <div className="bg-red-50/80 border border-red-200 rounded-[2vmin] p-[1.5vmin] text-center flex-shrink-0 relative">
            <button type="button" onClick={actions.dismissError} className="absolute top-[0.5vmin] right-[0.5vmin] text-red-400 hover:text-red-600 transition-colors">
              <svg className="w-[2vmin] h-[2vmin]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center justify-center gap-[1vmin] text-red-600">
              <svg className="w-[2.5vmin] h-[2.5vmin] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-[clamp(10px,1.5vmin,18px)] font-bold">
                {state.localError || error || 'Error de autenticación'}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={actions.handleSubmit} className="space-y-[clamp(1rem,3vmin,4rem)] text-left flex-shrink flex flex-col justify-center" noValidate>
          <div className="space-y-[0.8vmin]">
            <label className="text-[clamp(8px,1.2vmin,14px)] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-[2vmin]">Operador Autorizado</label>
            <div className="relative group">
              <input 
                ref={state.emailRef}
                required
                type="email" 
                name="email"
                placeholder="OPERADOR@SISTEMA"
                autoComplete="username"
                onChange={e => actions.handleInputChange('email', e.target.value)}
                className={`w-full bg-slate-100/60 dark:bg-slate-800/60 border ${state.getInputBorder('email')} rounded-[2vmin] px-[3vmin] py-[clamp(0.6rem,1.8vmin,2rem)] text-[clamp(12px,2vmin,24px)] font-bold text-slate-900 dark:text-white outline-none focus:ring-[0.5vmin] focus:ring-indigo-500/10 focus:border-indigo-500 transition-all uppercase placeholder:text-slate-300 dark:placeholder:text-slate-600`}
              />
              <svg className={`absolute right-[3vmin] top-1/2 -translate-y-1/2 w-[2.2vmin] h-[2.2vmin] ${state.fieldErrors.email ? 'text-red-400' : 'text-slate-300 group-focus-within:text-indigo-500'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            {state.fieldErrors.email && (
              <p className="text-red-500 text-[clamp(8px,1.2vmin,14px)] font-bold ml-[2vmin] mt-[0.3vmin]">{state.fieldErrors.email}</p>
            )}
          </div>

          <div className="space-y-[0.8vmin]">
            <label className="text-[clamp(8px,1.2vmin,14px)] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest ml-[2vmin]">Protocolo de Seguridad</label>
            <div className="relative group">
              <input 
                required
                type={state.showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••••••"
                autoComplete="current-password"
                onChange={e => actions.handleInputChange('password', e.target.value)}
                className={`w-full bg-slate-100/60 dark:bg-slate-800/60 border ${state.getInputBorder('password')} rounded-[2vmin] px-[3vmin] py-[clamp(0.6rem,1.8vmin,2rem)] text-[clamp(12px,2vmin,24px)] font-bold text-slate-900 dark:text-white outline-none focus:ring-[0.5vmin] focus:ring-indigo-500/10 focus:border-indigo-500 transition-all uppercase placeholder:text-slate-300 dark:placeholder:text-slate-600`}
              />
              <button type="button" onClick={() => actions.setShowPassword(!state.showPassword)} className="absolute right-[3vmin] top-1/2 -translate-y-1/2 w-[2.2vmin] h-[2.2vmin] text-slate-300 group-focus-within:text-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center" tabIndex={-1}>
                {state.showPassword ? (
                  <svg className="w-[2.2vmin] h-[2.2vmin]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-[2.2vmin] h-[2.2vmin]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.059 10.059 0 013.999-5.123m3.999-2.123a9.96 9.96 0 013.542-.75M15 12a3 3 0 11-6 0 3 3 0 016 0z M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
            {state.fieldErrors.password && (
              <p className="text-red-500 text-[clamp(8px,1.2vmin,14px)] font-bold ml-[2vmin] mt-[0.3vmin]">{state.fieldErrors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between px-[1vmin]">
            <label className="flex items-center gap-[1vmin] cursor-pointer group">
              <input 
                type="checkbox" 
checked={state.keepSession}
              onChange={e => actions.setKeepSession(e.target.checked)}
                className="w-[1.8vmin] h-[1.8vmin] rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all" 
              />
              <span className="text-[clamp(8px,1.5vmin,16px)] font-black text-slate-700 dark:text-slate-400 uppercase tracking-tight group-hover:text-slate-900 dark:group-hover:text-white">Mantener Sesión</span>
            </label>
          </div>

          <button 
            type="submit"
            disabled={state.loading}
            className="w-full bg-slate-900 text-white rounded-[2.5vmin] py-[clamp(0.8rem,2.5vmin,2.5rem)] text-[clamp(10px,2vmin,22px)] font-black uppercase tracking-[0.3em] shadow-[0_1vmin_3vmin_rgba(0,0,0,0.2)] hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {state.loading ? "Sincronizando..." : "Autenticar en el HUB"}
          </button>

          {(import.meta.env.VITE_INSPECTION_MODE === 'true' || localStorage.getItem('inspectionMode') === 'true') && (
            <div className="mt-4 p-4 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3 text-center">
                Usuarios de Inspección Disponibles
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {state.inspectionUsers.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => actions.fillInspectionUser(u.email)}
                    className="flex flex-col p-2 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-indigo-50 dark:border-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all text-left cursor-pointer active:scale-[0.97]"
                  >
                    <span className="text-[9px] font-black text-slate-900 dark:text-white truncate">{u.email}</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[8px] font-bold text-slate-500 dark:text-slate-500 uppercase">{u.rol} • {u.pais_venta || 'GLOBAL'}</span>
                      <span className="text-[7px] font-black text-indigo-500 uppercase">Usar</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>

        <footer className="flex-shrink-0">
          <div className="flex items-center justify-center gap-[2vmin] flex-wrap">
            <div className="inline-flex items-center gap-[1vmin] bg-white/40 text-slate-900 px-[3vmin] py-[0.8vmin] rounded-full border border-white/60">
            <div className="w-[1vmin] h-[1vmin] bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[clamp(8px,1.3vmin,14px)] font-black uppercase tracking-widest whitespace-nowrap">Conexión Segura SSL v4</span>
          </div>
          <div className="inline-flex items-center gap-[1vmin] bg-slate-100/40 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 px-[2vmin] py-[0.6vmin] rounded-full border border-slate-200/60 dark:border-slate-700/60">
            <kbd className="text-[clamp(6px,1vmin,11px)] font-black bg-slate-200/60 dark:bg-slate-700/60 px-[0.8vmin] py-[0.2vmin] rounded">Ctrl+K</kbd>
            <span className="text-[clamp(7px,1.1vmin,12px)] font-bold uppercase tracking-wider">Búsqueda Rápida</span>
          </div>
          </div>
          <p className="text-[clamp(8px,1.3vmin,20px)] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-[0.3em] mt-[1vmin]">
            © 2024 FLOR TELECOM INFRASTRUCTURE
          </p>
        </footer>
      </div>

      <div className="fixed bottom-[-5vmin] left-1/2 -translate-x-1/2 text-[20vmin] font-black text-white/[0.03] pointer-events-none select-none italic uppercase leading-none whitespace-nowrap">
        LAYER
      </div>
    </div>
  );
};
