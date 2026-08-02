import { useState, useEffect } from 'react';
import { SaleDetail, SaleStatus, LogisticStatus, Genero, TipoDocumento, Sale } from '../../types';
import { useVentaDetalle } from '../../hooks/useVentaDetalle';
import { VentaDetalleCompletoResponse } from '../../services/ventas';

type TabType = 'venta' | 'cliente' | 'plan' | 'correo' | 'estados';

export const mapBackendToSaleDetail = (data: VentaDetalleCompletoResponse): SaleDetail => {
  const precioBase = data.plan?.precio || 0;
  const descuento = data.promocion?.descuento || 0;
  const precioFinal = descuento > 0 ? Math.round(precioBase * (1 - descuento / 100)) : precioBase;

  return {
    id: `V-${data.venta.venta_id}`,
    sap: data.venta.sap,
    sds: data.venta.sds,
    stl: data.venta.stl,
    chip: data.venta.chip as 'SIM' | 'ESIM',
    tipoVenta: data.venta.tipo_venta as 'PORTABILIDAD' | 'LINEA_NUEVA',
    fechaCreacion: data.venta.fecha_creacion,
    multiple: 0,

    cliente: data.cliente ? {
      id: String(data.cliente.persona_id),
      nombre: data.cliente.nombre,
      apellido: data.cliente.apellido,
      documento: data.cliente.documento,
      email: data.cliente.email,
      telefono: data.cliente.telefono || null,
      tipoDocumento: (data.cliente as any).tipoDocumento || TipoDocumento.DNI,
      genero: (data.cliente as any).genero || Genero.MASCULINO,
      fechaNacimiento: (data.cliente as any).fechaNacimiento || '',
      nacionalidad: (data.cliente as any).nacionalidad || 'Argentina',
    } : {
      id: '', nombre: '', apellido: '', documento: '', email: '',
      telefono: null, tipoDocumento: TipoDocumento.DNI, genero: Genero.MASCULINO,
      fechaNacimiento: '', nacionalidad: 'Argentina'
    },

    vendedor: data.vendedor ? {
      id: String(data.vendedor.persona_id),
      nombre: data.vendedor.nombre,
      apellido: data.vendedor.apellido,
      email: data.vendedor.email,
      telefono: (data.vendedor as any).telefono || null,
      legajo: (data.vendedor as any).legajo || 'S/D',
      exa: (data.vendedor as any).exa || 'S/D',
      celula: (data.vendedor as any).celula || 0,
    } : {
      id: '', nombre: '', apellido: '', email: '', telefono: null,
      legajo: '', exa: '', celula: 0
    },

    supervisor: data.supervisor ? {
      id: (data.supervisor as any).id || '',
      nombre: data.supervisor.nombre,
      apellido: data.supervisor.apellido,
      legajo: (data.supervisor as any).legajo || '',
      email: (data.supervisor as any).email || '',
    } : {
      id: '', nombre: '', apellido: '', legajo: '', email: ''
    },

    plan: data.plan ? {
      id: data.plan.plan_id,
      nombre: data.plan.nombre,
      precio: data.plan.precio,
      gigabyte: Number((data.plan as any).gigabyte) || 0,
      llamadas: (data.plan as any).llamadas || '0',
      mensajes: (data.plan as any).mensajes || '0',
      whatsapp: (data.plan as any).whatsapp || 'Ilimitado',
      roaming: 'No Incluido',
      beneficios: data.plan.descripcion || '',
    } : {
      id: 0, nombre: '', precio: 0, gigabyte: 0, llamadas: '', mensajes: '', whatsapp: '', roaming: '', beneficios: ''
    },

    precioFinal: precioFinal,
    precioBase: precioBase,
    descuento: descuento,

    promocion: data.promocion ? {
      id: data.promocion.promocion_id,
      nombre: data.promocion.nombre,
      beneficios: data.promocion.beneficios,
      descuento: data.promocion.descuento,
    } : undefined,

    estadoVentaActual: data.estado_actual?.estado as SaleStatus,
    estadoCorreoActual: data.correo_estado?.estado as LogisticStatus,

    correo: data.correo ? {
      sapId: data.correo.sap_id,
      destinatario: data.correo.destinatario,
      personaAutorizada: (data.correo as any).persona_autorizada || null,
      telefonoContacto: data.correo.telefono_contacto,
      telefonoAlternativo: data.correo.telefono_alternativo || null,
      direccion: data.correo.direccion,
      numeroCasa: data.correo.numero_casa,
      piso: data.correo.piso || null,
      departamentoNumero: data.correo.departamento_numero || null,
      entreCalles: data.correo.entre_calles || null,
      barrio: data.correo.barrio || null,
      localidad: data.correo.localidad,
      departamento: data.correo.departamento,
      codigoPostal: data.correo.codigo_postal,
      geolocalizacion: data.correo.geolocalizacion || null,
      comentarioCartero: data.correo.comentario_cartero || null,
      fechaLimite: data.correo.fecha_limite,
    } : undefined,

    portabilidad: data.portabilidad ? {
      numeroPortar: data.portabilidad.numero_portar,
      empresaOrigen: data.portabilidad.operador_origen_nombre,
      mercadoOrigen: data.portabilidad.mercado_origen,
      spn: (data.portabilidad as any).spn || '',
      pin: (data.portabilidad as any).pin || null,
      fechaPortacion: (data.portabilidad as any).fecha_portacion || null,
    } : undefined,

    historialEstadosVenta: (data.historial_estados || []).map(h => ({
      estado: h.estado as SaleStatus,
      descripcion: h.descripcion || '',
      fecha: h.fecha_creacion,
      usuario: h.usuario_id || 'Sistema'
    })),

    historialEstadosCorreo: (data.historial_correo || []).map(h => ({
      estado: h.estado as LogisticStatus,
      descripcion: h.descripcion || '',
      fecha: h.fecha_creacion,
      usuario: 'Sistema',
      ubicacionActual: h.ubicacion_actual || null
    })),

    comentarios: (data.comentarios || []).map(c => ({
      id: c.comentario_id,
      titulo: c.titulo,
      comentario: c.comentario,
      tipo: (c.tipo as any) || 'GENERAL',
      fecha: c.fecha,
      autor: {
        nombre: c.author || 'Sistema',
        apellido: '',
        legajo: '',
        rol: ''
      }
    })),

    priority: 'MEDIA'
  };
};

export function useSaleDetailViewModel(saleId: string | null) {
  const { ventaDetalle, isLoading: isLoadingDetalle, isError } = useVentaDetalle(saleId);
  const [activeTab, setActiveTab] = useState<TabType>('venta');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<SaleDetail | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (ventaDetalle) {
      setEditedData(mapBackendToSaleDetail(ventaDetalle));
    }
  }, [ventaDetalle]);

  const handleEdit = (field: string, value: any) => {
    if (!editedData) return;
    const newData = { ...editedData };
    const fieldParts = field.split('.');

    if (fieldParts.length === 1) {
      (newData as any)[field] = value;
    } else {
      let current: any = newData;
      for (let i = 0; i < fieldParts.length - 1; i++) {
        current = current[fieldParts[i]];
      }
      current[fieldParts[fieldParts.length - 1]] = value;
    }

    setEditedData(newData);
    setHasChanges(true);
  };

  const handleSave = async (onUpdate: (updatedSale: any) => Promise<void>) => {
    if (!editedData) return;
    try {
      await onUpdate(editedData);
      setIsEditing(false);
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving sale:", error);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setHasChanges(false);
    if (ventaDetalle) {
      setEditedData(mapBackendToSaleDetail(ventaDetalle));
    }
  };

  return {
    state: {
      ventaDetalle,
      isLoadingDetalle,
      isError,
      activeTab,
      isEditing,
      editedData,
      hasChanges,
    },
    actions: {
      setActiveTab,
      setIsEditing,
      handleEdit,
      handleSave,
      cancelEdit,
    },
  };
}
