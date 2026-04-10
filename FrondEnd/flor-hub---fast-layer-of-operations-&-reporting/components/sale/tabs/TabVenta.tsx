
import React, { memo } from 'react';
import { SaleDetail } from '../../../types';
import { EditableField, SectionHeader } from '../SaleModalHelpers';

export const TabVenta = memo(({ editedData, isEditing, onEdit }: { 
  editedData: SaleDetail | null, 
  isEditing: boolean, 
  onEdit: (f: string, v: any) => void 
}) => (
  <div className="space-y-6 animate-in fade-in duration-300">
    {/* Timeline de Estado */}
    <div className="bg-white dark:bg-slate-800/40 p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
      <div className="flex items-center justify-between relative px-4">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-700 -translate-y-1/2 z-0" />
        {['INGRESADO', 'AGENDADO', 'APROBADO', 'ENTREGADO', 'ACTIVADO'].map((step, idx, arr) => {
          const isCompleted = editedData?.estadoVentaActual && arr.indexOf(editedData.estadoVentaActual) >= idx;
          const isCurrent = editedData?.estadoVentaActual === step;
          
          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                isCurrent 
                  ? 'bg-indigo-600 border-indigo-200 dark:border-indigo-900 scale-125' 
                  : isCompleted 
                    ? 'bg-emerald-500 border-emerald-100 dark:border-emerald-900/30' 
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
              }`}>
                {isCompleted && !isCurrent ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                ) : (
                  <span className={`text-[10px] font-black ${isCurrent ? 'text-white' : 'text-slate-400'}`}>{idx + 1}</span>
                )}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-tighter ${
                isCurrent ? 'text-indigo-600 dark:text-indigo-400' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>

    <div>
      <SectionHeader title="Datos de la Venta" icon="📋" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <EditableField label="ID Venta" value={editedData?.id || ''} field="id" readonly />
        <EditableField label="SAP" value={editedData?.sap || ''} field="sap" isEditing={isEditing} onEdit={onEdit} />
        <EditableField label="SDS" value={editedData?.sds || ''} field="sds" isEditing={isEditing} onEdit={onEdit} />
        <EditableField label="STL" value={editedData?.stl || ''} field="stl" isEditing={isEditing} onEdit={onEdit} />
        
        <div className="flex flex-col gap-[0.5vh]">
          <label className="font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-[1.5vh] text-[clamp(0.6rem,1vh,1.1rem)]">Tipo de Chip</label>
          <div className="flex gap-[1vh]">
            {['SIM', 'ESIM'].map(chip => (
              <button
                key={chip}
                onClick={() => isEditing && onEdit('chip', chip)}
                disabled={!isEditing}
                className={`flex-1 py-[1.8vh] rounded-[1.5vh] font-black uppercase tracking-widest border transition-all text-[clamp(0.65rem,1vh,1.2rem)] ${
                  editedData?.chip === chip ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[0.5vh]">
          <label className="font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-[1.5vh] text-[clamp(0.6rem,1vh,1.1rem)]">Tipo de Venta</label>
          <div className="flex gap-[1.2vh]">
            {['PORTABILIDAD', 'LINEA_NUEVA'].map(tipo => (
              <button
                key={tipo}
                onClick={() => isEditing && onEdit('tipoVenta', tipo)}
                disabled={!isEditing}
                className={`flex-1 py-[1.8vh] rounded-[1.5vh] font-black uppercase tracking-widest border transition-all text-[clamp(0.65rem,1vh,1.2rem)] ${
                  editedData?.tipoVenta === tipo ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
              >
                {tipo === 'PORTABILIDAD' ? 'PORTA' : 'LINEA N'}
              </button>
            ))}
          </div>
        </div>

        {editedData?.tipoVenta === 'PORTABILIDAD' && (
          <div className="flex flex-col gap-[0.5vh]">
            <label className="font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-[1.5vh] text-[clamp(0.6rem,1vh,1.1rem)]">Documentación</label>
            <div className="flex gap-[1.2vh]">
              {[true, false].map(status => (
                <button
                  key={String(status)}
                  onClick={() => isEditing && onEdit('portabilidad.documentacion', status)}
                  disabled={!isEditing}
                  className={`flex-1 py-[1.8vh] rounded-[1.5vh] font-black uppercase tracking-widest border transition-all text-[clamp(0.65rem,1vh,1.2rem)] ${
                    editedData?.portabilidad?.documentacion === status 
                      ? status ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20' : 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20'
                      : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  {status ? 'OK' : 'PENDIENTE'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="group bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 shadow-sm rounded-[2.5vh] px-[2.8vh] py-[2vh] hover:border-indigo-200 transition-colors">
          <label className="block font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-[0.6vh] text-[clamp(0.55rem,0.9vh,1rem)]">Fecha Creación</label>
          <div className="font-extrabold text-slate-900 dark:text-white text-[clamp(0.8rem,1.4vh,1.6rem)] tracking-tight">
            {editedData?.fechaCreacion ? new Date(editedData.fechaCreacion).toLocaleDateString('es-AR') : 'S/D'}
          </div>
        </div>
        <EditableField 
          label="Prioridad" value={editedData?.priority || 'MEDIA'} field="priority" type="select"
          options={[{ value: 'ALTA', label: 'ALTA' }, { value: 'MEDIA', label: 'MEDIA' }, { value: 'BAJA', label: 'BAJA' }]}
          isEditing={isEditing} onEdit={onEdit}
        />
      </div>
    </div>

    <div>
      <SectionHeader title="Vendedor" icon="👨‍💼" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <EditableField label="Nombre Completo" value={`${editedData?.vendedor?.nombre || ''} ${editedData?.vendedor?.apellido || ''}`} field="vendedor.nombre" readonly />
        <EditableField label="Legajo" value={editedData?.vendedor?.legajo || ''} field="vendedor.legajo" readonly />
        <EditableField label="EXA" value={editedData?.vendedor?.exa || ''} field="vendedor.exa" readonly />
        <EditableField label="Email" value={editedData?.vendedor?.email || ''} field="vendedor.email" readonly />
      </div>
    </div>

    <div>
      <SectionHeader title="Supervisor" icon="👔" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <EditableField label="Nombre Completitud" value={`${editedData?.supervisor?.nombre || ''} ${editedData?.supervisor?.apellido || ''}`} field="supervisor.nombre" readonly />
        <EditableField label="Legajo" value={editedData?.supervisor?.legajo || ''} field="supervisor.legajo" readonly />
        <EditableField label="Email" value={editedData?.supervisor?.email || ''} field="supervisor.email" readonly />
      </div>
    </div>
  </div>
));
