import React from 'react';
import { createPortal } from 'react-dom';
import { usePasswordChangeViewModel } from '../../viewmodels/modals/usePasswordChangeViewModel';

interface PasswordChangeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ onClose, onSuccess }) => {
  const { state, actions } = usePasswordChangeViewModel({ onClose, onSuccess });

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-[2vw]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* FLUID CONTAINER: Scale based on VP width/height */}
      <div className="relative bg-white dark:bg-slate-900 rounded-[clamp(1rem,3vh,2rem)] shadow-2xl w-[90vw] md:w-[50vw] lg:w-[40vw] xl:w-[35vw] overflow-hidden animate-in zoom-in-95 duration-300 border dark:border-white/5">
        
        {/* FLUID HEADER: Height based on VH */}
        <div className="absolute top-0 left-0 right-0 h-[10vh] bg-gradient-to-br from-indigo-600 to-purple-700 transition-all">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <button 
            onClick={onClose}
            className="absolute top-[2vh] right-[2vh] p-[1vh] bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
          >
            <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* FLUID CONTENT: Padding based on VP */}
        <div className="pt-[8vh] px-[5vw] pb-[4vh] relative z-10 transition-all">
          
          {/* FLUID ICON */}
          <div className="w-[8vh] h-[8vh] mx-auto bg-white dark:bg-slate-800 rounded-[2vh] shadow-xl p-[1vh] flex items-center justify-center mb-[3vh] transition-all border dark:border-white/5">
            <div className="w-full h-full bg-indigo-50 dark:bg-indigo-900/20 rounded-[1.5vh] flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <svg className="w-[4vh] h-[4vh] transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
          </div>

          <div className="text-center mb-[2vh]">
            <h3 className="font-black text-slate-800 dark:text-white mb-[0.5vh] text-[clamp(1.2rem,2.5vh,1.5rem)] leading-none">Actualizar Contraseña</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-[clamp(0.75rem,1.5vh,1rem)]">Mantén tu cuenta segura.</p>
          </div>

          <form onSubmit={actions.handleSubmit} className="space-y-[2vh]">
            {state.error && (
              <div className="p-[1.5vh] bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800/40 rounded-[1.5vh] flex items-start gap-[1vh] animate-in slide-in-from-top-2">
                <svg className="w-[2vh] h-[2vh] text-rose-500 dark:text-rose-400 shrink-0 mt-[0.2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <p className="font-semibold text-rose-600 dark:text-rose-400 text-[clamp(0.7rem,1.4vh,0.9rem)]">{state.error}</p>
              </div>
            )}

            <div className="space-y-[2vh]">
              {/* Contraseña Actual */}
              <div className="group">
                <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                  Contraseña Actual
                </label>
                <input
                  type="password"
                  value={state.formData.passwordActual}
                  onChange={(e) => actions.handleInputChange('passwordActual', e.target.value)}
                  className="w-full px-[2vh] h-[5vh] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[1.5vh] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                  placeholder="••••••••••••"
                  required
                />
              </div>

              {/* Nueva Contraseña */}
              <div className="group">
                <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={state.formData.passwordNueva}
                  onChange={(e) => actions.handleInputChange('passwordNueva', e.target.value)}
                  className="w-full px-[2vh] h-[5vh] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[1.5vh] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                  placeholder="••••••••••••"
                  required
                />
                
                {/* Lista de Requisitos */}
                <div className="mt-[1.5vh] bg-slate-50 dark:bg-slate-800/50 rounded-[1vh] p-[1.5vh] border border-slate-100 dark:border-slate-700/50">
                  <p className="text-[clamp(0.65rem,1.2vh,0.8rem)] font-semibold text-slate-600 dark:text-slate-400 mb-[1vh]">
                    La contraseña debe cumplir con:
                  </p>
                  <ul className="space-y-[0.5vh] text-[clamp(0.6rem,1.1vh,0.75rem)]">
                    <li className={`flex items-center gap-[1vh] transition-colors ${state.requirements.minLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      <span className="text-[clamp(0.7rem,1.3vh,0.9rem)]">{state.requirements.minLength ? '✓' : '○'}</span>
                      <span>Mínimo 8 caracteres</span>
                    </li>
                    <li className={`flex items-center gap-[1vh] transition-colors ${state.requirements.maxLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      <span className="text-[clamp(0.7rem,1.3vh,0.9rem)]">{state.requirements.maxLength ? '✓' : '○'}</span>
                      <span>Máximo 100 caracteres</span>
                    </li>
                    <li className={`flex items-center gap-[1vh] transition-colors ${state.requirements.hasUppercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      <span className="text-[clamp(0.7rem,1.3vh,0.9rem)]">{state.requirements.hasUppercase ? '✓' : '○'}</span>
                      <span>Al menos una mayúscula (A-Z)</span>
                    </li>
                    <li className={`flex items-center gap-[1vh] transition-colors ${state.requirements.hasLowercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      <span className="text-[clamp(0.7rem,1.3vh,0.9rem)]">{state.requirements.hasLowercase ? '✓' : '○'}</span>
                      <span>Al menos una minúscula (a-z)</span>
                    </li>
                    <li className={`flex items-center gap-[1vh] transition-colors ${state.requirements.hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      <span className="text-[clamp(0.7rem,1.3vh,0.9rem)]">{state.requirements.hasNumber ? '✓' : '○'}</span>
                      <span>Al menos un número (0-9)</span>
                    </li>
                    <li className={`flex items-center gap-[1vh] transition-colors ${state.requirements.hasSpecial ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      <span className="text-[clamp(0.7rem,1.3vh,0.9rem)]">{state.requirements.hasSpecial ? '✓' : '○'}</span>
                      <span>Al menos un carácter especial (!@#$...)</span>
                    </li>
                    <li className={`flex items-center gap-[1vh] transition-colors ${state.requirements.isDifferent ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                      <span className="text-[clamp(0.7rem,1.3vh,0.9rem)]">{state.requirements.isDifferent ? '✓' : '○'}</span>
                      <span>Debe ser diferente a la contraseña actual</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div className="group">
                <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={state.formData.passwordNuevaConfirmacion}
                    onChange={(e) => actions.handleInputChange('passwordNuevaConfirmacion', e.target.value)}
                    className="w-full px-[2vh] h-[5vh] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[1.5vh] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                    placeholder="••••••••••••"
                    required
                  />
                  {state.formData.passwordNuevaConfirmacion && state.passwordsMatch && (
                    <div className="absolute inset-y-0 right-[2vh] flex items-center text-emerald-500 animate-in zoom-in">
                      <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  )}
                </div>
                {state.formData.passwordNuevaConfirmacion && !state.passwordsMatch && (
                  <p className="mt-[0.5vh] text-[clamp(0.6rem,1.1vh,0.75rem)] text-rose-500 dark:text-rose-400">
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>
            </div>

            <div className="pt-[2vh] flex gap-[2vh]">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-[5vh] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-[1.5vh] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold uppercase tracking-wide text-[clamp(0.7rem,1.4vh,0.9rem)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={state.isLoading || !state.allRequirementsMet || !state.passwordsMatch || !state.formData.passwordActual}
                className="flex-[2] h-[5vh] bg-indigo-600 text-white rounded-[1.5vh] hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold uppercase tracking-wide shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 text-[clamp(0.7rem,1.4vh,0.9rem)]"
              >
                {state.isLoading ? (
                  <span className="flex items-center justify-center gap-[1vh]">
                    <svg className="animate-spin h-[2vh] w-[2vh]" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Procesando
                  </span>
                ) : (
                  'Actualizar Contraseña'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};
