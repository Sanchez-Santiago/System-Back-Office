import { useState, useEffect, useMemo, useCallback } from 'react';
import { PlanResponse, PromocionResponse, EmpresaOrigenResponse } from '../../services/plan';
import { useEmpresasQuery, usePlanesQuery, usePromocionesQuery } from '../../hooks/useOfertasQuery';

export interface OfertaPlan {
  id: number;
  name: string;
  gb: string;
  calls: string;
  whatsapp: boolean;
  price: string;
  oldPrice?: string;
  discount: string;
  promo: string;
  promoId: number;
  companyName: string;
  companyId: number;
  amount: number;
  fullDetails: {
    roaming: string;
    sms: string;
    services: string[];
    finePrint: string;
  };
}

export interface GrupoPromocion {
  promocionId: number;
  promocionNombre: string;
  descuento: number;
  planes: OfertaPlan[];
}

export function useOfertasPageViewModel() {
  const [offerType, setOfferType] = useState<'PORTA' | 'LN'>('PORTA');
  const [selectedOperator, setSelectedOperator] = useState<string>('');
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | null>(null);
  const [detailedPlan, setDetailedPlan] = useState<OfertaPlan | null>(null);

  const { data: empresas = [], isLoading: isLoadingEmpresas } = useEmpresasQuery();
  const { data: planes = [], isLoading: isLoadingPlanes } = usePlanesQuery(selectedEmpresaId);
  const { data: promociones = [], isLoading: isLoadingPromociones } = usePromocionesQuery(selectedEmpresaId);

  const empresasFiltradas = useMemo(() => {
    if (offerType === 'PORTA') {
      return empresas.filter(e => e.empresa_origen_id !== 2);
    } else {
      return empresas.filter(e => e.empresa_origen_id === 2);
    }
  }, [empresas, offerType]);

  useEffect(() => {
    setSelectedEmpresaId(null);
    setSelectedOperator('');
  }, [offerType]);

  useEffect(() => {
    if (empresasFiltradas.length > 0 && !selectedEmpresaId) {
      const primeraEmpresa = empresasFiltradas[0];
      setSelectedOperator(primeraEmpresa.nombre_empresa);
      setSelectedEmpresaId(primeraEmpresa.empresa_origen_id);
    }
  }, [empresasFiltradas, selectedEmpresaId, offerType]);

  const crearOferta = useCallback((plan: PlanResponse, promocion: PromocionResponse | null, empresa: EmpresaOrigenResponse | undefined): OfertaPlan => {
    const descuentoNum = promocion?.descuento || 0;
    const discount = descuentoNum > 0 ? `${descuentoNum}%` : '0%';
    const promo = promocion?.nombre || 'Sin promoción';
    const promoId = promocion?.promocion_id || 0;

    const precioOriginal = plan.precio;
    const precioFinal = descuentoNum > 0
      ? Math.round(precioOriginal * (1 - descuentoNum / 100))
      : precioOriginal;

    return {
      id: plan.plan_id,
      name: plan.nombre,
      gb: `${plan.gigabyte} GB`,
      calls: plan.llamadas,
      whatsapp: plan.whatsapp?.toLowerCase().includes('ilimitado') || false,
      price: `$${precioFinal}`,
      oldPrice: descuentoNum > 0 ? `$${precioOriginal}` : undefined,
      discount: discount,
      promo: promo,
      promoId: promoId,
      companyName: empresa?.nombre_empresa || 'Claro',
      companyId: plan.empresa_origen_id,
      amount: precioFinal,
      fullDetails: {
        roaming: plan.roaming || 'No incluido',
        sms: plan.mensajes || 'Según plan',
        services: plan.beneficios ? [plan.beneficios] : ['Servicio estándar'],
        finePrint: promocion?.beneficios || plan.beneficios || 'Plan estándar'
      }
    };
  }, []);

  const gruposPorPromocion = useMemo((): GrupoPromocion[] => {
    const planesActivos = planes.filter(p => p.activo !== false);
    const promocionesActivas = promociones.filter(p => p.activo !== false && p.descuento > 0);

    const empresa = empresas.find(e => e.empresa_origen_id === selectedEmpresaId);
    const grupos: GrupoPromocion[] = [];

    promocionesActivas.forEach((promocion) => {
      const planesDePromocion = planesActivos.map(plan =>
        crearOferta(plan, promocion, empresa)
      );

      if (planesDePromocion.length > 0) {
        grupos.push({
          promocionId: promocion.promocion_id,
          promocionNombre: promocion.nombre,
          descuento: promocion.descuento,
          planes: planesDePromocion
        });
      }
    });

    const planesSinPromocion = planesActivos
      .filter(plan => !promocionesActivas.some(p => p.empresa_origen_id === plan.empresa_origen_id))
      .map(plan => crearOferta(plan, null, empresa));

    if (planesSinPromocion.length > 0) {
      grupos.push({
        promocionId: 0,
        promocionNombre: 'Planes Standard',
        descuento: 0,
        planes: planesSinPromocion
      });
    }

    return grupos;
  }, [planes, promociones, empresas, selectedEmpresaId, crearOferta]);

  const handleEmpresaChange = (empresa: EmpresaOrigenResponse) => {
    setSelectedOperator(empresa.nombre_empresa);
    setSelectedEmpresaId(empresa.empresa_origen_id);
  };

  const isLoading = isLoadingEmpresas || isLoadingPlanes || isLoadingPromociones;

  const state = {
    offerType, selectedOperator, selectedEmpresaId, detailedPlan,
    empresasFiltradas, gruposPorPromocion, isLoading, empresas, planes,
  };

  const actions = {
    setOfferType, setDetailedPlan, handleEmpresaChange,
  };

  return { state, actions };
}
