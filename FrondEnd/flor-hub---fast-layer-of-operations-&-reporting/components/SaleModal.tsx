import React, { useState } from 'react';
import { SaleDetail, SaleStatus, LogisticStatus, Genero, TipoDocumento } from '../types';
import { SUPERVISORES_MOCK } from '../mocks/supervisores';
import { EMPRESAS_ORIGEN_MOCK } from '../mocks/empresasOrigen';

interface SaleModalProps {
  sale: SaleDetail;
  onClose: () => void;
  onUpdate?: (updatedSale: SaleDetail) => void;
}

type TabType = 'venta' | 'cliente' | 'plan' | 'correo' | 'estados';

export const SaleModal: React.FC<SaleModalProps> = ({ sale, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('venta');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<SaleDetail>(sale);
  const [hasChanges, setHasChanges] = useState(false);

  const handleEdit = (field: string, value: any) => {
    setEditedData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else {
        const newData = { ...prev };
        let current: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newData;
      }
    });
    setHasChanges(true);
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(editedData);
    }
    setHasChanges(false);
    setIsEditing(false);
  };

  const getStatusColor = (status: SaleStatus | LogisticStatus) => {
    const successStates = [SaleStatus.ACTIVADO, LogisticStatus.ENTREGADO, LogisticStatus.RENDIDO_AL_CLIENTE];
    const warningStates = [LogisticStatus.EN_TRANSITO, LogisticStatus.ASIGNADO, SaleStatus.EN_PROCESO, SaleStatus.APROBADO];
    const errorStates = [SaleStatus.CANCELADO, SaleStatus.RECHAZADO, LogisticStatus.NO_ENTREGADO, LogisticStatus.PIEZA_EXTRAVIADA];
    
    if (successStates.includes(status as any)) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (warningStates.includes(status as any)) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (errorStates.includes(status as any)) return 'bg-rose-100 text-rose-700 border-rose-200';
    return 'bg-indigo-100 text-indigo-700 border-indigo-200';
  };

  const renderTabButton = (tab: TabType, icon: string, label: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
        activeTab === tab
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
          : 'bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );

  const EditableField = ({ 
    label, 
    value, 
    field, 
    type = 'text', 
    options,
    readonly = false 
  }: { 
    label: string; 
    value: string | number | null; 
    field: string; 
    type?: 'text' | 'select' | 'date' | 'number';
    options?: { value: string; label: string }[];
    readonly?: boolean;
  }) => {
    const displayValue = value ?? '-';
    
    if (!isEditing || readonly) {
      return (
        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
            {label}
          </label>
          <div className="text-xs font-bold text-slate-900">
            {displayValue}
          </div>
        </div>
      );
    }

    if (type === 'select' && options) {
      return (
        <div>
          <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-2">
            {label}
          </label>
          <select
            value={value as string}
            onChange={(e) => handleEdit(field, e.target.value)}
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all bg-white"
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div>
        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-2">
          {label}
        </label>
        <input
          type={type}
          value={value as string || ''}
          onChange={(e) => handleEdit(field, type === 'number' ? Number(e.target.value) : e.target.value)}
          className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all bg-white"
        />
      </div>
    );
  };

  const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-lg">{icon}</span>
      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">{title}</h4>
      <div className="flex-1 h-px bg-slate-200 ml-4"></div>
    </div>
  );

  const TabVenta = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Sección: Datos de la Venta */}
      <div>
        <SectionHeader title="Datos de la Venta" icon="📋" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <EditableField label="ID Venta" value={editedData.id} field="id" readonly />
          <EditableField label="SAP" value={editedData.sap} field="sap" />
          <EditableField label="SDS" value={editedData.sds} field="sds" />
          <EditableField label="STL" value={editedData.stl} field="stl" />
          
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-2">
              Tipo de Chip
            </label>
            <div className="flex gap-2">
              {['SIM', 'ESIM'].map(chip => (
                <button
                  key={chip}
                  onClick={() => isEditing && handleEdit('chip', chip)}
                  disabled={!isEditing}
                  className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                    editedData.chip === chip
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : isEditing 
                        ? 'bg-white text-slate-400 border-slate-200 hover:border-indigo-400'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-2">
              Tipo de Venta
            </label>
            <div className="flex gap-2">
              {['PORTABILIDAD', 'LINEA_NUEVA'].map(tipo => (
                <button
                  key={tipo}
                  onClick={() => isEditing && handleEdit('tipoVenta', tipo)}
                  disabled={!isEditing}
                  className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                    editedData.tipoVenta === tipo
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : isEditing
                        ? 'bg-white text-slate-400 border-slate-200 hover:border-indigo-400'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  }`}
                >
                  {tipo === 'PORTABILIDAD' ? 'PORTA' : 'LINEA N'}
                </button>
              ))}
            </div>
          </div>

          <EditableField 
            label="Fecha Creación" 
            value={editedData.fechaCreacion} 
            field="fechaCreacion" 
            type="date"
            readonly 
          />
          <EditableField 
            label="Prioridad" 
            value={editedData.priority} 
            field="priority" 
            type="select"
            options={[
              { value: 'ALTA', label: 'ALTA' },
              { value: 'MEDIA', label: 'MEDIA' },
              { value: 'BAJA', label: 'BAJA' }
            ]}
          />
        </div>
      </div>

      {/* Sección: Datos del Vendedor */}
      <div>
        <SectionHeader title="Datos del Vendedor" icon="👨‍💼" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <EditableField label="Nombre" value={editedData.vendedor.nombre} field="vendedor.nombre" />
          <EditableField label="Apellido" value={editedData.vendedor.apellido} field="vendedor.apellido" />
          <EditableField label="Legajo" value={editedData.vendedor.legajo} field="vendedor.legajo" />
          <EditableField label="EXA" value={editedData.vendedor.exa} field="vendedor.exa" />
          <EditableField label="Email" value={editedData.vendedor.email} field="vendedor.email" />
          <EditableField label="Teléfono" value={editedData.vendedor.telefono} field="vendedor.telefono" />
          <EditableField label="Célula" value={editedData.vendedor.celula} field="vendedor.celula" type="number" />
        </div>
      </div>

      {/* Sección: Supervisor Asignado */}
      <div>
        <SectionHeader title="Supervisor Asignado" icon="👔" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isEditing ? (
            <div className="col-span-2">
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-2">
                Supervisor
              </label>
              <select
                value={editedData.supervisor.id}
                onChange={(e) => {
                  const sup = SUPERVISORES_MOCK.find(s => s.usuario_id === e.target.value);
                  if (sup) {
                    handleEdit('supervisor', {
                      id: sup.usuario_id,
                      nombre: sup.nombre,
                      apellido: sup.apellido,
                      legajo: sup.legajo,
                      email: sup.email
                    });
                  }
                }}
                className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all bg-white"
              >
                {SUPERVISORES_MOCK.map(sup => (
                  <option key={sup.usuario_id} value={sup.usuario_id}>
                    {sup.nombre} {sup.apellido} ({sup.legajo})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <EditableField label="Nombre" value={`${editedData.supervisor.nombre} ${editedData.supervisor.apellido}`} field="supervisor" readonly />
              <EditableField label="Legajo" value={editedData.supervisor.legajo} field="supervisor.legajo" readonly />
              <EditableField label="Email" value={editedData.supervisor.email} field="supervisor.email" readonly />
            </>
          )}
        </div>
      </div>
    </div>
  );

  const TabCliente = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <SectionHeader title="Información Personal" icon="👤" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <EditableField label="Nombre" value={editedData.cliente.nombre} field="cliente.nombre" />
        <EditableField label="Apellido" value={editedData.cliente.apellido} field="cliente.apellido" />
        <EditableField 
          label="Tipo de Documento" 
          value={editedData.cliente.tipoDocumento} 
          field="cliente.tipoDocumento"
          type="select"
          options={[
            { value: TipoDocumento.DNI, label: 'DNI' },
            { value: TipoDocumento.CUIL, label: 'CUIL' },
            { value: TipoDocumento.PASAPORTE, label: 'Pasaporte' }
          ]}
        />
        <EditableField label="Documento" value={editedData.cliente.documento} field="cliente.documento" />
        <EditableField label="Email" value={editedData.cliente.email} field="cliente.email" />
        <EditableField label="Teléfono" value={editedData.cliente.telefono} field="cliente.telefono" />
        <EditableField 
          label="Género" 
          value={editedData.cliente.genero} 
          field="cliente.genero"
          type="select"
          options={[
            { value: Genero.MASCULINO, label: 'Masculino' },
            { value: Genero.FEMENINO, label: 'Femenino' },
            { value: Genero.OTRO, label: 'Otro' },
            { value: Genero.PREFIERO_NO_DECIR, label: 'Prefiero no decir' }
          ]}
        />
        <EditableField label="Fecha de Nacimiento" value={editedData.cliente.fechaNacimiento} field="cliente.fechaNacimiento" type="date" />
        <EditableField label="Nacionalidad" value={editedData.cliente.nacionalidad} field="cliente.nacionalidad" />
      </div>
    </div>
  );

  const TabPlan = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Información del Plan */}
      <div>
        <SectionHeader title="Plan Contratado" icon="📱" />
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-indigo-900 uppercase">{editedData.plan.nombre}</h3>
            <span className="text-2xl font-black text-indigo-600">${editedData.plan.precio.toLocaleString()}/mes</span>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 text-center border border-indigo-100">
              <div className="text-2xl font-black text-indigo-600">{editedData.plan.gigabyte}</div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">GB de Datos</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-indigo-100">
              <div className="text-lg font-black text-indigo-600 truncate">{editedData.plan.llamadas}</div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Llamadas</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-indigo-100">
              <div className="text-lg font-black text-indigo-600 truncate">{editedData.plan.mensajes}</div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SMS</div>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-indigo-100">
              <div className="text-lg font-black text-indigo-600">{editedData.plan.whatsapp}</div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</div>
            </div>
          </div>

          {editedData.plan.beneficios && (
            <div className="bg-white rounded-2xl p-4 border border-indigo-100">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Beneficios Adicionales</div>
              <div className="text-sm font-bold text-slate-700">{editedData.plan.beneficios}</div>
            </div>
          )}
        </div>
      </div>

      {/* Promoción */}
      {editedData.promocion && (
        <div>
          <SectionHeader title="Promoción Aplicada" icon="🎁" />
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-black text-emerald-800">{editedData.promocion.nombre}</h4>
                {editedData.promocion.beneficios && (
                  <p className="text-sm font-medium text-emerald-600 mt-1">{editedData.promocion.beneficios}</p>
                )}
              </div>
              <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-black">
                {editedData.promocion.descuento} OFF
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portabilidad */}
      {editedData.portabilidad && (
        <div>
          <SectionHeader title="Datos de Portabilidad" icon="🔄" />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <EditableField label="N° a Portar" value={editedData.portabilidad.numeroPortar} field="portabilidad.numeroPortar" />
            <EditableField 
              label="Empresa Origen" 
              value={editedData.portabilidad.empresaOrigen} 
              field="portabilidad.empresaOrigen"
              type="select"
              options={EMPRESAS_ORIGEN_MOCK.map(e => ({ value: e.nombre, label: e.nombre }))}
            />
            <EditableField 
              label="Mercado Origen" 
              value={editedData.portabilidad.mercadoOrigen} 
              field="portabilidad.mercadoOrigen"
              type="select"
              options={[
                { value: 'Prepago', label: 'Prepago' },
                { value: 'Contrafactura', label: 'Contrafactura' }
              ]}
            />
            <EditableField label="SPN" value={editedData.portabilidad.spn} field="portabilidad.spn" />
            <EditableField label="PIN" value={editedData.portabilidad.pin} field="portabilidad.pin" type="number" />
            <EditableField label="Fecha Portación" value={editedData.portabilidad.fechaPortacion} field="portabilidad.fechaPortacion" type="date" />
          </div>
        </div>
      )}
    </div>
  );

  const TabCorreo = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <SectionHeader title="Información de Envío" icon="📮" />
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <EditableField label="SAP ID" value={editedData.correo?.sapId} field="correo.sapId" readonly />
        <EditableField label="Destinatario" value={editedData.correo?.destinatario} field="correo.destinatario" />
        <EditableField label="Persona Autorizada" value={editedData.correo?.personaAutorizada} field="correo.personaAutorizada" />
        <EditableField label="Teléfono Contacto" value={editedData.correo?.telefonoContacto} field="correo.telefonoContacto" />
        <EditableField label="Teléfono Alternativo" value={editedData.correo?.telefonoAlternativo} field="correo.telefonoAlternativo" />
      </div>

      <SectionHeader title="Dirección de Entrega" icon="📍" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <EditableField label="Calle" value={editedData.correo?.direccion} field="correo.direccion" />
        <EditableField label="Número" value={editedData.correo?.numeroCasa} field="correo.numeroCasa" type="number" />
        <EditableField label="Piso" value={editedData.correo?.piso} field="correo.piso" />
        <EditableField label="Departamento" value={editedData.correo?.departamentoNumero} field="correo.departamentoNumero" />
        <EditableField label="Entre Calles" value={editedData.correo?.entreCalles} field="correo.entreCalles" />
        <EditableField label="Barrio" value={editedData.correo?.barrio} field="correo.barrio" />
        <EditableField label="Localidad" value={editedData.correo?.localidad} field="correo.localidad" />
        <EditableField label="Provincia" value={editedData.correo?.departamento} field="correo.departamento" />
        <EditableField label="Código Postal" value={editedData.correo?.codigoPostal} field="correo.codigoPostal" type="number" />
        <EditableField label="Geolocalización" value={editedData.correo?.geolocalizacion} field="correo.geolocalizacion" />
        <EditableField label="Fecha Límite" value={editedData.correo?.fechaLimite} field="correo.fechaLimite" type="date" readonly />
      </div>

      {editedData.correo?.comentarioCartero && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <div className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Comentario del Cartero</div>
          <div className="text-sm font-medium text-amber-800">{editedData.correo.comentarioCartero}</div>
        </div>
      )}
    </div>
  );

  const TabEstados = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Estados Actuales */}
      <div>
        <SectionHeader title="Estados Actuales" icon="📊" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`p-6 rounded-3xl border-2 ${getStatusColor(editedData.estadoVentaActual)}`}>
            <div className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">Estado de Venta</div>
            <div className="text-2xl font-black uppercase mb-2">{editedData.estadoVentaActual}</div>
            {editedData.historialEstadosVenta[0] && (
              <div className="text-xs font-bold opacity-70">
                Desde: {new Date(editedData.historialEstadosVenta[0].fecha).toLocaleDateString('es-AR')}
              </div>
            )}
          </div>

          {editedData.estadoCorreoActual && (
            <div className={`p-6 rounded-3xl border-2 ${getStatusColor(editedData.estadoCorreoActual)}`}>
              <div className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">Estado de Correo</div>
              <div className="text-2xl font-black uppercase mb-2">{editedData.estadoCorreoActual}</div>
              {editedData.historialEstadosCorreo[0]?.ubicacionActual && (
                <div className="text-xs font-bold opacity-70">
                  📍 {editedData.historialEstadosCorreo[0].ubicacionActual}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Timeline de Estados de Venta */}
      <div>
        <SectionHeader title="Historial de Estados de Venta" icon="📈" />
        <div className="space-y-0">
          {editedData.historialEstadosVenta.map((estado, index) => (
            <div key={index} className="relative flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-4 h-4 rounded-full border-4 ${
                  index === 0 ? 'bg-indigo-600 border-indigo-200' : 'bg-slate-300 border-slate-100'
                }`}></div>
                {index < editedData.historialEstadosVenta.length - 1 && (
                  <div className="w-0.5 h-full bg-slate-200 my-1"></div>
                )}
              </div>
              <div className={`flex-1 pb-6 ${index === 0 ? 'opacity-100' : 'opacity-60'}`}>
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-slate-900 uppercase">{estado.estado}</span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(estado.fecha).toLocaleString('es-AR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-indigo-600 mb-1">Por: {estado.usuario}</div>
                  {estado.descripcion && (
                    <div className="text-xs font-medium text-slate-600">{estado.descripcion}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline de Estados de Correo */}
      {editedData.historialEstadosCorreo.length > 0 && (
        <div>
          <SectionHeader title="Historial de Estados de Correo" icon="📦" />
          <div className="space-y-0">
            {editedData.historialEstadosCorreo.map((estado, index) => (
              <div key={index} className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-4 ${
                    index === 0 ? 'bg-purple-600 border-purple-200' : 'bg-slate-300 border-slate-100'
                  }`}></div>
                  {index < editedData.historialEstadosCorreo.length - 1 && (
                    <div className="w-0.5 h-full bg-slate-200 my-1"></div>
                  )}
                </div>
                <div className={`flex-1 pb-6 ${index === 0 ? 'opacity-100' : 'opacity-60'}`}>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-black text-slate-900 uppercase">{estado.estado}</span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(estado.fecha).toLocaleString('es-AR', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {estado.usuario && (
                      <div className="text-xs font-bold text-purple-600 mb-1">Por: {estado.usuario}</div>
                    )}
                    {estado.descripcion && (
                      <div className="text-xs font-medium text-slate-600 mb-1">{estado.descripcion}</div>
                    )}
                    {estado.ubicacionActual && (
                      <div className="text-xs font-bold text-slate-500">📍 {estado.ubicacionActual}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-6xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-3">
              <span className="text-4xl">🔷</span>
              VENTA {editedData.id}
            </h3>
            <p className="text-sm font-bold uppercase tracking-widest opacity-80 mt-2">
              {editedData.cliente.nombre} {editedData.cliente.apellido} • DNI: {editedData.cliente.documento}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {hasChanges && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-2xl border border-amber-500/30">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                <span className="text-xs font-black text-amber-100 uppercase">Cambios pendientes</span>
              </div>
            )}
            <button onClick={onClose} className="p-3 bg-white/20 hover:bg-rose-500 rounded-2xl transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="px-8 py-4 bg-slate-50 border-b border-slate-200 flex gap-2 overflow-x-auto shrink-0">
          {renderTabButton('venta', '📋', 'Venta')}
          {renderTabButton('cliente', '👤', 'Cliente')}
          {renderTabButton('plan', '📱', 'Plan')}
          {renderTabButton('correo', '📮', 'Correo')}
          {renderTabButton('estados', '📊', 'Estados')}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {activeTab === 'venta' && <TabVenta />}
          {activeTab === 'cliente' && <TabCliente />}
          {activeTab === 'plan' && <TabPlan />}
          {activeTab === 'correo' && <TabCorreo />}
          {activeTab === 'estados' && <TabEstados />}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center shrink-0">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-8 py-4 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${
              isEditing 
                ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' 
                : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
            }`}
          >
            {isEditing ? 'Cancelar Edición' : '✏️ Editar Datos'}
          </button>

          <div className="flex gap-4">
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`px-8 py-4 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${
                  hasChanges
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:scale-105'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                💾 Guardar Cambios
              </button>
            )}
            <button
              className="px-8 py-4 rounded-[22px] bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all"
            >
              🔄 Actualizar Estado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
