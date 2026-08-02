import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useCountry } from '../../contexts/CountryContext';

type TabType = 'promociones' | 'planes' | 'empresas';

interface Empresa {
  empresa_origen_id: number;
  nombre_empresa: string;
  pais: string;
}

interface Promocion {
  promocion_id: number;
  nombre: string;
  beneficios?: string;
  empresa_origen_id: number;
  descuento: number;
  activo: boolean;
  empresa?: Empresa;
}

interface Plan {
  plan_id: number;
  nombre: string;
  precio: number;
  gigabyte: number;
  llamadas: string;
  mensajes: string;
  whatsapp: string;
  roaming: string;
  beneficios?: string;
  empresa_origen_id: number;
  promocion_id?: number;
  activo: boolean;
  empresa?: Empresa;
  promocion?: Promocion;
}

const initialPromocion: Partial<Promocion> = {
  nombre: '',
  beneficios: '',
  empresa_origen_id: undefined,
  descuento: 0,
  activo: true,
};

const initialPlan: Partial<Plan> = {
  nombre: '',
  precio: 0,
  gigabyte: 0,
  llamadas: 'Ilimitadas',
  mensajes: 'Ilimitados',
  whatsapp: 'SI',
  roaming: 'Nacional',
  beneficios: '',
  empresa_origen_id: undefined,
  promocion_id: undefined,
  activo: true,
};

const initialEmpresa: Partial<Empresa> = {
  nombre_empresa: '',
  pais: 'Argentina',
};

export function useGestionarOfertasViewModel(isOpen: boolean) {
  const [activeTab, setActiveTab] = useState<TabType>('promociones');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formPromocion, setFormPromocion] = useState<Partial<Promocion>>(initialPromocion);
  const [formPlan, setFormPlan] = useState<Partial<Plan>>(initialPlan);
  const [formEmpresa, setFormEmpresa] = useState<Partial<Empresa>>(initialEmpresa);
  const { effectiveCountry } = useCountry();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const withPais = (path: string) => {
        if (!effectiveCountry) return path;
        return `${path}${path.includes('?') ? '&' : '?'}pais=${encodeURIComponent(effectiveCountry)}`;
      };
      const [empRes, promoRes, planRes] = await Promise.all([
        api.get<Empresa[]>(withPais('/empresa-origen')),
        api.get<Promocion[]>(withPais('/promociones')),
        api.get<Plan[]>(withPais('/planes')),
      ]);
      setEmpresas(empRes.data || []);
      setPromociones(promoRes.data || []);
      setPlanes(planRes.data || []);
    } catch (err: any) {
      setError('Error al cargar datos: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  }, [effectiveCountry]);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setShowForm(false);
      setEditingId(null);
    }
  }, [isOpen, loadData]);

  const resetForm = () => {
    setFormPromocion(initialPromocion);
    setFormPlan(initialPlan);
    setFormEmpresa(initialEmpresa);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.promocion_id || item.plan_id || item.empresa_origen_id);
    if (activeTab === 'promociones') {
      setFormPromocion({ ...item });
    } else if (activeTab === 'planes') {
      setFormPlan({ ...item });
    } else {
      setFormEmpresa({ ...item });
    }
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    setLoading(true);
    try {
      if (activeTab === 'promociones') {
        await api.delete(`/promociones/${id}`);
        setPromociones(prev => prev.filter(p => p.promocion_id !== id));
      } else if (activeTab === 'planes') {
        await api.delete(`/planes/${id}`);
        setPlanes(prev => prev.filter(p => p.plan_id !== id));
      } else {
        await api.delete(`/empresa-origen/${id}`);
        setEmpresas(prev => prev.filter(e => e.empresa_origen_id !== id));
      }
    } catch (err: any) {
      setError('Error al eliminar: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'promociones') {
        if (!formPromocion.nombre || !formPromocion.empresa_origen_id) {
          setError('Nombre y Empresa son requeridos');
          setLoading(false);
          return;
        }
        const data = {
          nombre: formPromocion.nombre?.toUpperCase(),
          beneficios: formPromocion.beneficios || '',
          empresa_origen_id: formPromocion.empresa_origen_id,
          descuento: formPromocion.descuento || 0,
          activo: formPromocion.activo ?? true,
        };
        if (editingId) {
          const res = await api.put(`/promociones/${editingId}`, data);
          setPromociones(prev => prev.map(p => p.promocion_id === editingId ? { ...p, ...(res.data as Partial<Promocion>) } : p));
        } else {
          const res = await api.post('/promociones', data);
          setPromociones(prev => [...prev, res.data as Promocion]);
        }
      } else if (activeTab === 'planes') {
        if (!formPlan.nombre || !formPlan.precio || !formPlan.gigabyte || !formPlan.empresa_origen_id) {
          setError('Nombre, Precio, GB y Empresa son requeridos');
          setLoading(false);
          return;
        }
        const data = {
          nombre: formPlan.nombre?.toUpperCase(),
          precio: formPlan.precio,
          gigabyte: formPlan.gigabyte,
          llamadas: formPlan.llamadas || 'Ilimitadas',
          mensajes: formPlan.mensajes || 'Ilimitados',
          whatsapp: formPlan.whatsapp || 'SI',
          roaming: formPlan.roaming || 'Nacional',
          beneficios: formPlan.beneficios || '',
          empresa_origen_id: formPlan.empresa_origen_id,
          promocion_id: formPlan.promocion_id || null,
          activo: formPlan.activo ?? true,
        };
        if (editingId) {
          const res = await api.put(`/planes/${editingId}`, data);
          setPlanes(prev => prev.map(p => p.plan_id === editingId ? { ...p, ...(res.data as Partial<Plan>) } : p));
        } else {
          const res = await api.post('/planes', data);
          setPlanes(prev => [...prev, res.data as Plan]);
        }
      } else {
        if (!formEmpresa.nombre_empresa || !formEmpresa.pais) {
          setError('Nombre de empresa y País son requeridos');
          setLoading(false);
          return;
        }
        const data = {
          nombre_empresa: formEmpresa.nombre_empresa,
          pais: formEmpresa.pais,
        };
        if (editingId) {
          const res = await api.put(`/empresa-origen/${editingId}`, data);
          setEmpresas(prev => prev.map(e => e.empresa_origen_id === editingId ? { ...e, ...(res.data as Partial<Empresa>) } : e));
        } else {
          const res = await api.post('/empresa-origen', data);
          setEmpresas(prev => [...prev, res.data as Empresa]);
        }
      }
      resetForm();
    } catch (err: any) {
      setError('Error al guardar: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const getEmpresaName = (empresaId: number) => {
    const emp = empresas.find(e => e.empresa_origen_id === empresaId);
    return emp?.nombre_empresa || 'Sin asignar';
  };

  const getPromocionName = (promocionId: number | undefined) => {
    if (!promocionId) return 'Sin promoción';
    const promo = promociones.find(p => p.promocion_id === promocionId);
    return promo?.nombre || 'Sin promoción';
  };

  const state = {
    activeTab, empresas, promociones, planes,
    loading, error, showForm, editingId,
    formPromocion, formPlan, formEmpresa,
  };

  const actions = {
    setActiveTab,
    setShowForm,
    resetForm,
    handleEdit,
    handleDelete,
    handleSubmit,
    loadData,
    setFormPromocion,
    setFormPlan,
    setFormEmpresa,
    getEmpresaName,
    getPromocionName,
  };

  return { state, actions };
}
