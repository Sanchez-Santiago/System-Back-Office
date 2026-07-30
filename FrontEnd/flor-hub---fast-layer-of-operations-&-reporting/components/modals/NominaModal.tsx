
import React from 'react';
import { useNominaViewModel, Usuario } from '../../viewmodels/modals/useNominaViewModel';

interface NominaModalProps {
  onClose: () => void;
  user?: {
    permisos?: string[];
    id?: string;
    email?: string;
    nombre?: string;
    apellido?: string;
    rol?: string;
  } | null;
  onOpenUserForm?: (celulas: any[], editingUser?: Usuario | null) => void;
  refreshKey?: number;
}

function getPaisCodigo(pais: string | null | undefined): string {
  if (!pais) return '🌐';
  const paisLower = pais.toLowerCase();
  if (paisLower.includes('argentina')) return 'AR';
  if (paisLower.includes('uruguay')) return 'UY';
  if (paisLower.includes('paraguay')) return 'PY';
  return '🌐';
}

function getPaisColor(pais: string | null | undefined): string {
  if (!pais) return 'bg-slate-400';
  const paisLower = pais.toLowerCase();
  if (paisLower.includes('argentina')) return 'bg-blue-500';
  if (paisLower.includes('uruguay')) return 'bg-green-500';
  if (paisLower.includes('paraguay')) return 'bg-red-500';
  return 'bg-slate-400';
}

export const NominaModal: React.FC<NominaModalProps> = ({ onClose, user, onOpenUserForm, refreshKey }) => {
  const { state, actions } = useNominaViewModel({ user, refreshKey, onOpenUserForm });

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center p-4 pt-[5vh]">
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-[95vw] max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-[4vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white dark:border-white/5 z-10">
        
        {/* Header Premium */}
        <div className="p-[4vh] bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:via-slate-900 dark:to-slate-900 text-white flex justify-between items-center relative flex-shrink-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
          <div className="relative z-10">
            <h3 className="font-black italic tracking-tighter uppercase text-[clamp(1.5rem,3.5vh,3.5rem)]">Nómina de Vendedores</h3>
            <p className="font-black uppercase tracking-[0.3em] opacity-80 mt-[0.5vh] text-[clamp(0.6rem,1.1vh,1.4rem)]">Gestión de Talento & Legajos • FLOR HUB</p>
          </div>
          <div className="flex items-center gap-[2.5vh] relative z-10">
            {state.isAdmin && (
              <button 
                onClick={() => onOpenUserForm?.(state.celulas)}
                className="px-[3.5vh] py-[2vh] bg-indigo-600 hover:bg-indigo-500 rounded-[2vh] font-black uppercase tracking-widest transition-all flex items-center gap-[1.5vh] text-[clamp(0.7rem,1.2vh,1.4rem)]"
              >
                <svg className="w-[2.2vh] h-[2.2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path>
                </svg>
                Agregar Usuario
              </button>
            )}
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Buscar vendedor..."
                className="bg-white/10 border border-white/20 rounded-[2vh] px-[2.5vh] py-[1.8vh] font-bold text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-indigo-400 w-[35vh] transition-all text-[clamp(0.8rem,1.3vh,1.6rem)]"
                value={state.search}
                onChange={e => actions.setSearch(e.target.value)}
              />
              <svg className="w-[2.5vh] h-[2.5vh] absolute right-[2vh] top-1/2 -translate-y-1/2 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <button onClick={onClose} className="p-[1.8vh] bg-white/10 hover:bg-rose-500 rounded-[1.8vh] transition-all duration-300">
              <svg className="w-[3.2vh] h-[3.2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        {/* Filtro por Célula */}
        <div className="px-[4vh] py-[2vh] bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-[2vh]">
            <span className="font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[clamp(0.7rem,1.2vh,1.3rem)]">Filtrar por Célula:</span>
            <select
              value={state.selectedCelula || ''}
              onChange={e => actions.setSelectedCelula(e.target.value ? Number(e.target.value) : null)}
              className="px-[2vh] py-[1.5vh] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-[1.5vh] font-bold text-slate-800 dark:text-white text-[clamp(0.8rem,1.2vh,1.4rem)]"
            >
              <option value="">Todas las células</option>
              {state.celulasDelSistema.map(celula => (
                <option key={celula.celula_id} value={celula.celula_id}>
                  Célula {celula.celula_id} - {celula.nombre} ({getPaisCodigo(celula.pais_venta)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {state.error && (
          <div className="mx-[4vh] mt-[2vh] bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-[2vh] p-[2vh] flex items-center gap-[2vh] animate-in slide-in-from-top-2">
            <svg className="w-[3vh] h-[3vh] text-rose-600 dark:text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p className="font-bold text-rose-700 dark:text-rose-400 text-[clamp(0.7rem,1.1vh,1.4rem)]">{state.error}</p>
          </div>
        )}

        {/* Content - Células con Vendedores */}
        <div className="flex-1 overflow-auto p-[4vh] bg-slate-50/50 dark:bg-slate-950/20 no-scrollbar">
          {state.loading && (
            <div className="space-y-[4vh]">
              {/* Celula Skeleton 1 */}
              <div className="bg-white dark:bg-slate-900 rounded-[3vh] border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
                <div className="h-[10vh] bg-slate-100 dark:bg-slate-800/50 flex items-center px-[4vh] gap-[3vh]">
                  <div className="w-[5vh] h-[5vh] rounded-[1.5vh] bg-slate-200 dark:bg-slate-700"></div>
                  <div className="h-[2.5vh] w-[40%] bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                </div>
                <div className="p-[3vh] space-y-[2vh]">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between p-[2vh] border-b border-slate-100 dark:border-slate-800/50">
                      <div className="flex items-center gap-[2vh]">
                        <div className="w-[4.5vh] h-[4.5vh] rounded-full bg-slate-100 dark:bg-slate-800"></div>
                        <div className="space-y-[1vh]">
                          <div className="h-[1.5vh] w-[15vh] bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                          <div className="h-[1vh] w-[10vh] bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                        </div>
                      </div>
                      <div className="h-[2vh] w-[8vh] bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Celula Skeleton 2 */}
              <div className="bg-white dark:bg-slate-900 rounded-[3vh] border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse opacity-60">
                <div className="h-[10vh] bg-slate-100 dark:bg-slate-800 px-[4vh] flex items-center">
                  <div className="h-[2.5vh] w-[30%] bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                </div>
              </div>
            </div>
          )}

          {!state.loading && Object.keys(state.usuariosByCelula).length === 0 && (
            <div className="py-[10vh] text-center glass-panel rounded-[4vh]">
              <p className="font-bold text-slate-400 uppercase tracking-widest text-[clamp(1rem,1.8vh,2.5rem)]">No se encontraron vendedores.</p>
            </div>
          )}

          {!state.loading && Object.entries(state.usuariosByCelula).map(([celulaId, usuariosList]) => {
            const usuariosArray = usuariosList as Usuario[];
            const celulaNum = Number(celulaId);
            const celulaInfo = actions.getCelulaInfo(celulaNum);
            const isExpanded = state.expandedCelulas.has(celulaNum);
            
            if (state.selectedCelula && state.selectedCelula !== celulaNum) return null;

            return (
              <div key={celulaId} className="mb-[3vh] bg-white dark:bg-slate-900 rounded-[3vh] border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Header de Célula */}
                <button
                  onClick={() => actions.toggleCelula(celulaNum)}
                  className="w-full flex items-center justify-between p-[2.5vh] bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/50 dark:hover:to-purple-900/50 transition-all"
                >
                  <div className="flex items-center gap-[2vh]">
                    <div className="w-[5vh] h-[5vh] rounded-[1.5vh] bg-indigo-600 text-white flex items-center justify-center font-black text-[clamp(0.8rem,1.3vh,1.5rem)]">
                      {celulaNum}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-800 dark:text-white uppercase tracking-wide text-[clamp(0.9rem,1.4vh,1.7rem)]">
                          {celulaInfo?.nombre || `Célula ${celulaNum}`}
                        </p>
                        {celulaInfo?.pais_venta && (
                          <span className={`${getPaisColor(celulaInfo.pais_venta)} px-2 py-0.5 rounded text-white text-xs font-bold`}>
                            {getPaisCodigo(celulaInfo.pais_venta)}
                          </span>
                        )}
                      </div>
                      {celulaInfo?.supervisor_nombre && (
                        <div className="flex items-center gap-[1vh] flex-wrap">
                          <span className="font-bold text-purple-600 dark:text-purple-400 text-[clamp(0.65rem,1vh,1.2rem)]">
                            Supervisor: {celulaInfo.supervisor_nombre}
                          </span>
                          {celulaInfo.supervisor_exa && (
                            <>
                              <span className="text-slate-400">|</span>
                              <span className="font-bold text-cyan-600 dark:text-cyan-400 text-[clamp(0.6rem,0.95vh,1.1rem)]">
                                {celulaInfo.supervisor_exa}
                              </span>
                            </>
                          )}
                          {celulaInfo.supervisor_legajo && (
                            <>
                              <span className="text-slate-400">|</span>
                              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[clamp(0.6rem,0.95vh,1.1rem)]">
                                {celulaInfo.supervisor_legajo}
                              </span>
                            </>
                          )}
                          {celulaInfo.supervisor_email && (
                            <>
                              <span className="text-slate-400">|</span>
                              <span className="font-bold text-slate-500 dark:text-slate-400 text-[clamp(0.6rem,0.95vh,1.1rem)]">
                                {celulaInfo.supervisor_email}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      <p className="font-bold text-slate-500 dark:text-slate-400 text-[clamp(0.7rem,1.1vh,1.3rem)]">
                        {usuariosArray.length} vendedor{usuariosArray.length !== 1 ? 'es' : ''}
                      </p>
                    </div>
                  </div>
                  <svg 
                    className={`w-[3vh] h-[3vh] text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {/* Lista de Vendedores */}
                {isExpanded && (
                  <div className="border-t border-slate-200 dark:border-slate-700">
                    {usuariosArray.map((usuario) => (
                      <div 
                        key={usuario.usuario_id} 
                        className="flex items-center justify-between p-[2vh] border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                      >
                        <div className="flex items-center gap-[2vh] flex-1">
                          <div className="w-[4vh] h-[4vh] rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-slate-600 dark:text-slate-300 text-[clamp(0.7rem,1.1vh,1.3rem)]">
                            {usuario.nombre[0]}{usuario.apellido[0]}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 dark:text-white uppercase text-[clamp(0.85rem,1.3vh,1.5rem)]">
                              {usuario.nombre} {usuario.apellido}
                            </p>
                            <div className="flex items-center gap-[1.5vh] mt-[0.3vh]">
                              <span className="font-bold text-cyan-600 dark:text-cyan-400 text-[clamp(0.65rem,1vh,1.2rem)]">
                                {usuario.exa}
                              </span>
                              <span className="text-slate-300 dark:text-slate-600">|</span>
                              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[clamp(0.65rem,1vh,1.2rem)]">
                                {usuario.legajo}
                              </span>
                              <span className="text-slate-300 dark:text-slate-600">|</span>
                              <span className="font-bold text-slate-500 dark:text-slate-400 text-[clamp(0.65rem,1vh,1.2rem)]">
                                {usuario.email}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-[1.5vh]">
                          <button
                            onClick={() => actions.handleToggleStatus(usuario)}
                            className={`px-[1.5vh] py-[0.8vh] rounded-full font-black uppercase tracking-wider text-[clamp(0.6rem,1vh,1.1rem)] transition-all ${
                              usuario.estado === 'ACTIVO' 
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 hover:bg-emerald-200' 
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {usuario.estado}
                          </button>
                          <button
                            onClick={() => actions.handleEdit(usuario)}
                            className="p-[1.2vh] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-[1vh] hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                          >
                            <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => actions.handleDelete(usuario.usuario_id)}
                            className="p-[1.2vh] bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-[1vh] hover:bg-rose-200 dark:hover:bg-rose-900/60 transition-colors"
                          >
                            <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Summary with Pagination */}
        <div className="p-[3vh] bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5 flex justify-between items-center shadow-[0_-1vh_3vh_-1vh_rgba(0,0,0,0.05)] flex-shrink-0">
          <div className="flex gap-[6vh]">
            <div className="flex flex-col">
              <span className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-[0.5vh] text-[clamp(0.6rem,1.1vh,1.3rem)]">Total Plantilla</span>
              <span className="font-black text-slate-900 dark:text-white text-[clamp(1.2rem,2.2vh,3rem)]">{state.totalVendedores}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-emerald-400 dark:text-emerald-500/80 uppercase tracking-widest mb-[0.5vh] text-[clamp(0.6rem,1.1vh,1.3rem)]">Vendedores Activos</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-[clamp(1.2rem,2.2vh,3rem)]">{state.activos}</span>
            </div>
          </div>

          {/* Controles de Paginación */}
          {state.totalPages > 1 && (
            <div className="flex items-center gap-[2vh]">
              <button
                onClick={actions.handlePrevPage}
                disabled={state.page <= 1}
                className="px-[2vh] py-[1.5vh] rounded-[1.5vh] font-black uppercase tracking-wider text-[clamp(0.7rem,1.1vh,1.3rem)] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-[1vh]"
              >
                <svg className="w-[1.8vh] h-[1.8vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Anterior
              </button>
              
              <div className="flex items-center gap-[1vh] px-[2vh]">
                <span className="font-black text-slate-600 dark:text-slate-400 text-[clamp(0.7rem,1.1vh,1.3rem)]">
                  Página
                </span>
                <span className="font-black text-indigo-600 dark:text-indigo-400 text-[clamp(0.8rem,1.2vh,1.5rem)]">
                  {state.page}
                </span>
                <span className="font-black text-slate-400 dark:text-slate-500 text-[clamp(0.7rem,1.1vh,1.3rem)]">
                  de
                </span>
                <span className="font-black text-indigo-600 dark:text-indigo-400 text-[clamp(0.8rem,1.2vh,1.5rem)]">
                  {state.totalPages}
                </span>
              </div>

              <button
                onClick={actions.handleNextPage}
                disabled={state.page >= state.totalPages}
                className="px-[2vh] py-[1.5vh] rounded-[1.5vh] font-black uppercase tracking-wider text-[clamp(0.7rem,1.1vh,1.3rem)] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-[1vh]"
              >
                Siguiente
                <svg className="w-[1.8vh] h-[1.8vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          )}

          {state.totalPages <= 1 && (
            <button className="px-[5vh] py-[2.2vh] bg-indigo-600 dark:bg-indigo-600 text-white rounded-[2vh] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-indigo-900/40 hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all active:scale-95 text-[clamp(0.7rem,1.2vh,1.5rem)]">
              Exportar Nómina CSV
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
