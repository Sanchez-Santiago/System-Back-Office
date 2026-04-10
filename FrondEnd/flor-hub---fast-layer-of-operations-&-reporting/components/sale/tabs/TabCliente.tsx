
import React, { memo } from 'react';
import { SaleDetail } from '../../../types';
import { EditableField, SectionHeader } from '../SaleModalHelpers';

export const TabCliente = memo(({ editedData, isEditing, onEdit }: { 
  editedData: SaleDetail | null,
  isEditing?: boolean,
  onEdit?: (f: string, v: any) => void
}) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    <div>
      <SectionHeader title="Información del Cliente" icon="👤" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <EditableField label="Nombre" value={editedData?.cliente?.nombre || ''} field="cliente.nombre" readonly />
        <EditableField label="Apellido" value={editedData?.cliente?.apellido || ''} field="cliente.apellido" readonly />
        <EditableField label="DNI/CUIT" value={editedData?.cliente?.documento || ''} field="cliente.documento" readonly />
        <EditableField label="Email" value={editedData?.cliente?.email || ''} field="cliente.email" readonly />
        <EditableField label="Teléfono" value={editedData?.cliente?.telefono || ''} field="cliente.telefono" readonly />
        <EditableField label="Género" value={editedData?.cliente?.genero || ''} field="cliente.genero" readonly />
        <EditableField label="F. Nacimiento" value={editedData?.cliente?.fechaNacimiento || ''} field="cliente.fechaNacimiento" readonly />
        <EditableField label="Nacionalidad" value={editedData?.cliente?.nacionalidad || ''} field="cliente.nacionalidad" readonly />
      </div>
    </div>

    {/* Estado de Documentación (Solo para Portabilidades) */}
    {editedData?.tipoVenta === 'PORTABILIDAD' && (
      <div className="mt-8">
        <SectionHeader title="Estado de Documentación" icon="📄" />
        <div className="max-w-md bg-white dark:bg-slate-800/40 p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className={`p-4 rounded-2xl flex items-center justify-between border-2 transition-all duration-500 ${
              editedData?.portabilidad?.documentacion 
                ? 'bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                : 'bg-rose-50/50 dark:bg-rose-500/10 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.1)]'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  editedData?.portabilidad?.documentacion ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                  {editedData?.portabilidad?.documentacion ? '✅' : '⏳'}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Estado Actual</p>
                  <p className={`text-xl font-black uppercase tracking-tight ${
                    editedData?.portabilidad?.documentacion ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {editedData?.portabilidad?.documentacion ? 'Documentación Ok' : 'Pendiente / Falta Docu'}
                  </p>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 mt-2">
                {[true, false].map(status => (
                  <button
                    key={String(status)}
                    onClick={() => onEdit?.('portabilidad.documentacion', status)}
                    className={`flex-1 py-4 rounded-xl font-black uppercase tracking-widest border-2 transition-all duration-300 transform active:scale-95 ${
                      editedData?.portabilidad?.documentacion === status
                        ? status 
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-500/40 translate-y-[-2px]' 
                          : 'bg-rose-600 border-rose-600 text-white shadow-xl shadow-rose-500/40 translate-y-[-2px]'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-600'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg">{status ? '✅' : '⏳'}</span>
                      <span className="text-[0.65rem]">{status ? 'Marcar OK' : 'Marcar PENDIENTE'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
));
