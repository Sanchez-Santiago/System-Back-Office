import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Fase1Schema, Fase2Schema, Fase3Schema, Fase1Data, Fase2Data, Fase3Data } from '../../schemas/sale';
import { Sale, ProductType } from '../../types';
import { usePlansQuery, usePromotionsQuery, useEmpresasQuery } from '../../hooks/useSaleDependencies';
import { useCreateSaleMutation } from '../../hooks/useVentasQuery';
import { clienteService } from '../../services/cliente';
import { useToast } from '../../contexts/ToastContext';
import { NotificationMessages } from '../../services/NotificationMessages';

export type Fase = 1 | 2 | 3 | 4;

export function useSaleFormViewModel(
  onClose: () => void,
  onVentaCreada?: () => void,
  initialData?: Partial<Sale>,
) {
  const { addToast } = useToast();
  const [fase, setFase] = useState<Fase>(1);
  const [clienteEncontrado, setClienteEncontrado] = useState<any | null>(null);
  const [isLoadingCliente, setIsLoadingCliente] = useState(false);

  const { data: planes, isLoading: isLoadingPlanes } = usePlansQuery();
  const { data: promociones, isLoading: isLoadingPromociones } = usePromotionsQuery();
  const { data: empresas, isLoading: isLoadingEmpresas } = useEmpresasQuery();
  const createSaleMutation = useCreateSaleMutation();

  const formFase1 = useForm<Fase1Data>({
    resolver: zodResolver(Fase1Schema),
    defaultValues: {
      tipo_documento: 'DNI',
      documento: '', nombre: '', apellido: '', email: '',
      telefono: '', telefono_alternativo: '', fecha_nacimiento: '',
      genero: '', nacionalidad: '',
    }
  });

  const formFase2 = useForm<Fase2Data>({
    resolver: zodResolver(Fase2Schema),
    defaultValues: {
      tipo_venta: initialData?.productType === ProductType.PORTABILITY ? 'PORTABILIDAD' : 'LINEA_NUEVA',
      empresa_origen_id: initialData?.empresa_origen_id || 0,
      plan_id: initialData?.plan_id || 0,
      promocion_id: initialData?.promocion_id,
      chip: 'SIM', sds: '', stl: '', spn: '',
      numero_portar: '', pin: '', fecha_vencimiento_pin: '',
      mercado_origen: undefined,
    }
  });

  const formFase3 = useForm<Fase3Data>({
    resolver: zodResolver(Fase3Schema),
    defaultValues: {
      sap: '', numero: '', tipo: 'RESIDENCIAL', direccion: '',
      numero_casa: '', entre_calles: '', barrio: '', localidad: '',
      departamento: '', codigo_postal: '', geolocalizacion: '',
      telefono_alternativo: '', piso: '', departamento_numero: ''
    }
  });

  const documento = formFase1.watch('documento');
  const tipoDocumento = formFase1.watch('tipo_documento');
  const tipoVenta = formFase2.watch('tipo_venta');
  const planId = formFase2.watch('plan_id');
  const chip = formFase2.watch('chip');

  const inputClass = "w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm";
  const labelClass = "block font-black text-slate-500 dark:text-slate-400 uppercase text-xs mb-1 ml-1";
  const errorClass = "text-red-500 text-xs mt-1 font-bold ml-1";

  const usarClienteComoAutorizado = () => {
    const nombre = formFase1.getValues('nombre');
    const apellido = formFase1.getValues('apellido');
    formFase3.setValue('persona_autorizada', `${nombre} ${apellido}`.trim());
    addToast({ type: 'success', title: 'Copiado', message: 'Persona autorizada copiada del cliente' });
  };

  const usarNumeroPortarComoContacto = () => {
    const numeroPortar = formFase2.getValues('numero_portar');
    if (numeroPortar) {
      formFase3.setValue('numero', numeroPortar);
      addToast({ type: 'success', title: 'Copiado', message: 'Número a portar usado como contacto' });
    }
  };

  const usarTelefonoClienteComoContacto = () => {
    const telefono = formFase1.getValues('telefono');
    if (telefono) {
      formFase3.setValue('numero', telefono);
      addToast({ type: 'success', title: 'Copiado', message: 'Teléfono del cliente usado como contacto' });
    }
  };

  const filteredPlanes = useMemo(() => {
    if (!planes) return [];
    if (tipoVenta === 'LINEA_NUEVA') {
      return planes.filter(p => p.activo !== false && p.empresa_origen_id === 2).sort((a, b) => a.precio - b.precio);
    }
    const empresaId = formFase2.getValues('empresa_origen_id');
    if (tipoVenta === 'PORTABILIDAD' && empresaId) {
      return planes.filter(p => p.activo !== false && p.empresa_origen_id === empresaId).sort((a, b) => a.precio - b.precio);
    }
    return [];
  }, [planes, tipoVenta, formFase2.watch('empresa_origen_id')]);

  const filteredPromociones = useMemo(() => {
    if (!promociones) return [];
    if (tipoVenta === 'LINEA_NUEVA') {
      return promociones.filter(p => p.activo !== false && p.descuento > 0 && p.empresa_origen_id === 2).sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
    const empresaId = formFase2.getValues('empresa_origen_id');
    if (tipoVenta === 'PORTABILIDAD' && empresaId) {
      return promociones.filter(p => p.activo !== false && p.descuento > 0 && p.empresa_origen_id === empresaId).sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
    return [];
  }, [promociones, tipoVenta, formFase2.watch('empresa_origen_id')]);

  const handleBuscarCliente = async () => {
    if (!documento) {
      addToast({ type: 'error', title: 'Error', message: NotificationMessages.ERROR.DATOS_INVALIDOS });
      return;
    }
    setIsLoadingCliente(true);
    try {
      const res = await clienteService.buscarPorDocumento({
        tipo_documento: tipoDocumento,
        documento: documento,
      });

      if (res.success && res.data) {
        setClienteEncontrado(res.data);
        formFase1.reset({
          ...formFase1.getValues(),
          nombre: res.data.nombre || '',
          apellido: res.data.apellido || '',
          email: res.data.email || '',
          telefono: res.data.telefono || '',
          fecha_nacimiento: res.data.fecha_nacimiento ? res.data.fecha_nacimiento.split('T')[0] : '',
          genero: res.data.genero || '',
          nacionalidad: res.data.nacionalidad || '',
        });
        addToast({ type: 'success', title: 'Cliente Encontrado', message: `${res.data.nombre} ${res.data.apellido}` });
      } else {
        setClienteEncontrado(null);
        addToast({ type: 'info', title: 'Cliente No Encontrado', message: NotificationMessages.INFO.DATOS_GUARDADOS });
      }
    } catch (error) {
      console.error('[handleBuscarCliente] Error:', error);
      addToast({ type: 'error', title: 'Error', message: NotificationMessages.ERROR.CONEXION_FALLIDA });
    } finally {
      setIsLoadingCliente(false);
    }
  };

  const handleCrearCliente = async () => {
    const data = formFase1.getValues();
    setIsLoadingCliente(true);
    try {
      const res = await clienteService.crear({
        nombre: data.nombre!.toUpperCase(),
        apellido: data.apellido!.toUpperCase(),
        documento: data.documento,
        tipo_documento: data.tipo_documento,
        email: data.email!.toLowerCase(),
        telefono: data.telefono,
        telefono_alternativo: data.telefono_alternativo,
        fecha_nacimiento: data.fecha_nacimiento!,
        genero: data.genero as any,
        nacionalidad: data.nacionalidad!.toUpperCase(),
      });

      if (res.success && res.data) {
        setClienteEncontrado(res.data);
        addToast({ type: 'success', title: 'Cliente Creado', message: NotificationMessages.SUCCESS.CLIENTE_CREADO });
      } else {
        addToast({ type: 'error', title: 'Error', message: res.message || NotificationMessages.ERROR.GENERICO });
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Error', message: NotificationMessages.ERROR.GENERICO });
    } finally {
      setIsLoadingCliente(false);
    }
  };

  const getValidationErrors = async (targetFase: number): Promise<string[]> => {
    const missingFields: string[] = [];
    if (targetFase === 1) {
      const data = formFase1.getValues();
      if (!data.nombre) missingFields.push('Nombre');
      if (!data.apellido) missingFields.push('Apellido');
      if (!data.email) missingFields.push('Email');
      if (!data.telefono) missingFields.push('Teléfono');
      if (!data.fecha_nacimiento) missingFields.push('Fecha de nacimiento');
      if (!data.genero) missingFields.push('Género');
      if (!data.nacionalidad) missingFields.push('Nacionalidad');
    } else if (targetFase === 2) {
      const data = formFase2.getValues();
      if (!data.plan_id || data.plan_id === 0) missingFields.push('Plan');
      if (tipoVenta === 'PORTABILIDAD') {
        if (!data.empresa_origen_id || data.empresa_origen_id === 0) missingFields.push('Empresa de origen');
        if (!data.numero_portar) missingFields.push('Número a portar');
        if (!data.mercado_origen) missingFields.push('Mercado de origen');
      }
    } else if (targetFase === 3 && chip === 'SIM') {
      const data = formFase3.getValues();
      if (!data.numero) missingFields.push('Teléfono de contacto');
      if (!data.direccion) missingFields.push('Dirección');
      if (!data.numero_casa) missingFields.push('Número');
      if (!data.localidad) missingFields.push('Localidad');
      if (!data.departamento) missingFields.push('Departamento');
      if (!data.codigo_postal) missingFields.push('Código postal');
    }
    return missingFields;
  };

  const nextFase = async () => {
    if (fase === 1) {
      if (!clienteEncontrado) {
        addToast({ type: 'error', title: 'Error', message: 'Debe seleccionar o crear un cliente' });
        return;
      }
      const missing = await getValidationErrors(1);
      if (missing.length > 0) {
        addToast({ type: 'error', title: 'Faltan datos obligatorios', message: NotificationMessages.WARNING.DATOS_INCOMPLETOS });
        return;
      }
      setFase(2);
    } else if (fase === 2) {
      const missing = await getValidationErrors(2);
      if (missing.length > 0) {
        addToast({ type: 'error', title: 'Faltan datos obligatorios', message: missing.join(', ') });
        return;
      }
      if (chip === 'ESIM') {
        setFase(4);
        return;
      }
      setFase(3);
    } else if (fase === 3) {
      const missing = await getValidationErrors(3);
      if (missing.length > 0) {
        addToast({ type: 'error', title: 'Faltan datos obligatorios', message: missing.join(', ') });
        return;
      }
      setFase(4);
    }
  };

  const onSubmit = async () => {
    const missingFields = await getValidationErrors(3);

    if (missingFields.length > 0 && chip === 'SIM') {
      addToast({
        type: 'error',
        title: 'Faltan datos obligatorios',
        message: missingFields.join(', ')
      });
      return;
    }

    if (!clienteEncontrado) {
      addToast({ type: 'error', title: 'Error', message: 'Debe seleccionar un cliente' });
      return;
    }

    try {
      const dataFase1 = formFase1.getValues();
      const dataFase2 = formFase2.getValues();
      const dataFase3 = formFase3.getValues();

      const ventaPayload: any = {
        venta: {
          sds: dataFase2.sds?.toUpperCase() || null,
          chip: dataFase2.chip,
          stl: dataFase2.chip === 'ESIM' ? null : (dataFase2.stl?.toUpperCase() || null),
          tipo_venta: dataFase2.tipo_venta,
          sap: null,
          cliente_id: clienteEncontrado?.persona_id,
          plan_id: dataFase2.plan_id,
          promocion_id: dataFase2.promocion_id || null,
          empresa_origen_id: dataFase2.tipo_venta === 'LINEA_NUEVA' ? 2 : (dataFase2.empresa_origen_id || 0),
        }
      };

      if (dataFase2.chip === 'SIM') {
        ventaPayload.correo = {
          sap: dataFase3?.sap?.toUpperCase() || null,
          telefono_contacto: dataFase3?.numero || '',
          telefono_alternativo: dataFase3?.telefono_alternativo || null,
          destinatario: `${dataFase1?.nombre || ''} ${dataFase1?.apellido || ''}`.trim(),
          persona_autorizada: dataFase3?.persona_autorizada || null,
          direccion: dataFase3?.direccion || '',
          numero_casa: dataFase3?.numero_casa ? Number(dataFase3.numero_casa) : 1,
          entre_calles: dataFase3?.entre_calles || null,
          barrio: dataFase3?.barrio || null,
          localidad: dataFase3?.localidad || '',
          departamento: dataFase3?.departamento || '',
          codigo_postal: dataFase3?.codigo_postal ? Number(dataFase3.codigo_postal) : 1000,
          geolocalizacion: dataFase3?.geolocalizacion || null,
          piso: dataFase3?.piso || null,
          departamento_numero: dataFase3?.departamento_numero || null,
          comentario_cartero: dataFase3?.comentario_cartero || null,
        };
      }

      if (dataFase2.tipo_venta === 'PORTABILIDAD') {
        ventaPayload.portabilidad = {
          spn: dataFase2.spn?.toUpperCase() || null,
          empresa_origen: dataFase2.empresa_origen_id,
          mercado_origen: dataFase2.mercado_origen,
          numero_portar: dataFase2.numero_portar || null,
          pin: dataFase2.pin?.toUpperCase() || null,
          fecha_vencimiento_pin: dataFase2.fecha_vencimiento_pin || null,
        };
      }

      createSaleMutation.mutate(ventaPayload, {
        onSuccess: () => {
          addToast({ type: 'success', title: 'Venta Creada', message: NotificationMessages.SUCCESS.VENTA_CREADA });
          if (onVentaCreada) onVentaCreada();
          onClose();
        },
        onError: (err: any) => {
          const errorMessage = err.response?.data?.message || err.message || NotificationMessages.ERROR.GENERICO;
          const errors = err.response?.data?.errors;
          const detailedError = errors ? `${errorMessage}: ${JSON.stringify(errors)}` : errorMessage;
          addToast({ type: 'error', title: 'Error', message: detailedError });
        }
      });
    } catch (error) {
      console.error('[onSubmit] Error en onSubmit:', error);
      addToast({ type: 'error', title: 'Error', message: NotificationMessages.ERROR.GENERICO });
    }
  };

  return {
    state: {
      fase, clienteEncontrado, isLoadingCliente,
      planes, promociones, empresas,
      isLoadingPlanes, isLoadingPromociones, isLoadingEmpresas,
      formFase1, formFase2, formFase3,
      filteredPlanes, filteredPromociones,
      tipoVenta, chip, planId, documento, tipoDocumento,
      createSaleMutation,
      inputClass, labelClass, errorClass,
      isPending: createSaleMutation.isPending,
    },
    actions: {
      setFase,
      handleBuscarCliente,
      handleCrearCliente,
      onSubmit,
      nextFase,
      usarClienteComoAutorizado,
      usarNumeroPortarComoContacto,
      usarTelefonoClienteComoContacto,
    },
  };
}
