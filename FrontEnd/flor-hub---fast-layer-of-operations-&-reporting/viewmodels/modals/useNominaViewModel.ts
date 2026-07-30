import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import { useCountry } from '../../contexts/CountryContext';
import { MOCK_USERS } from '../../services/mockUsers';

export interface Usuario {
  usuario_id: string;
  nombre: string;
  apellido: string;
  documento: string;
  tipo_documento: string;
  email: string;
  telefono?: string;
  fecha_nacimiento?: string;
  nacionalidad: string;
  genero: string;
  legajo: string;
  exa: string;
  celula: number;
  rol: string;
  permisos: string[];
  estado: string;
  fecha_creacion?: string;
}

export interface Celula {
  celula_id: number;
  nombre: string;
  empresa_origen_id: number;
  supervisor_id: string;
  supervisor_nombre?: string;
  supervisor_exa?: string;
  supervisor_legajo?: string;
  supervisor_email?: string;
  pais_venta?: string | null;
}

interface NominaViewModelProps {
  user?: {
    permisos?: string[];
    id?: string;
    email?: string;
    nombre?: string;
    apellido?: string;
    rol?: string;
  } | null;
  refreshKey?: number;
  onOpenUserForm?: (celulas: Celula[], editingUser?: Usuario | null) => void;
}

export function useNominaViewModel({ user, refreshKey, onOpenUserForm }: NominaViewModelProps) {
  const permisosUser = user?.permisos?.map(p => typeof p === 'string' ? p.toUpperCase() : String(p).toUpperCase()) || [];
  const isAdmin = permisosUser.includes('SUPERADMIN') || permisosUser.includes('ADMIN');
  const { effectiveCountry } = useCountry();

  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [celulas, setCelulas] = useState<Celula[]>([]);
  const [selectedCelula, setSelectedCelula] = useState<number | null>(null);
  const [expandedCelulas, setExpandedCelulas] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const isInspectionMode = import.meta.env.VITE_INSPECTION_MODE === 'true' || localStorage.getItem('inspectionMode') === 'true';
      if (isInspectionMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockCelulas: Celula[] = [
          { celula_id: 1, nombre: 'Ventas Digitales AR', empresa_origen_id: 1, supervisor_id: 'super-1', supervisor_nombre: 'Andrés García', pais_venta: 'ARGENTINA' },
          { celula_id: 2, nombre: 'Fidelización UY', empresa_origen_id: 2, supervisor_id: 'super-2', supervisor_nombre: 'Mariana López', pais_venta: 'URUGUAY' },
          { celula_id: 3, nombre: 'Retención PY', empresa_origen_id: 3, supervisor_id: 'super-3', supervisor_nombre: 'Carlos Ruiz', pais_venta: 'PARAGUAY' },
          { celula_id: 4, nombre: 'Estrategia Global', empresa_origen_id: 4, supervisor_id: 'super-4', supervisor_nombre: 'Lucía Fernández', pais_venta: null },
        ];

        const celulasFiltradas = effectiveCountry
          ? mockCelulas.filter(c => c.pais_venta?.toLowerCase() === effectiveCountry.toLowerCase())
          : mockCelulas;
        setCelulas(celulasFiltradas);

        const mockUsuarios: Usuario[] = MOCK_USERS.map(u => ({
          usuario_id: u.id,
          nombre: u.nombre,
          apellido: u.apellido,
          documento: '12345678',
          tipo_documento: 'DNI',
          email: u.email,
          nacionalidad: u.pais_venta || 'ARGENTINA',
          genero: 'PREFERO NO DECIR',
          legajo: u.legajo,
          exa: u.exa,
          celula: u.celula || 1,
          rol: u.rol,
          permisos: u.permisos,
          estado: u.estado,
        }));

        const celulaIds = new Set(celulasFiltradas.map(c => c.celula_id));
        const usuariosFiltrados = effectiveCountry
          ? mockUsuarios.filter(u => celulaIds.has(u.celula))
          : mockUsuarios;

        setUsuarios(usuariosFiltrados);
        setTotalCount(usuariosFiltrados.length);
        setTotalPages(1);
        setExpandedCelulas(new Set(celulasFiltradas.map(c => c.celula_id)));
        setLoading(false);
        return;
      }

      const withPais = (path: string) => {
        if (!effectiveCountry) return path;
        return `${path}${path.includes('?') ? '&' : '?'}pais=${encodeURIComponent(effectiveCountry)}`;
      };

      const [usuariosRes, celulasRes] = await Promise.all([
        api.get<any>(`/usuarios?page=${page}&limit=100`),
        api.get<any>(withPais('/celulas?limit=100')),
      ]);

      const celulasData = celulasRes.payload?.data || celulasRes.data?.data || celulasRes.payload || celulasRes.data || [];
      const celulasFiltradas = effectiveCountry
        ? celulasData.filter((c: Celula) => c.pais_venta?.toLowerCase() === effectiveCountry.toLowerCase())
        : celulasData;
      setCelulas(celulasFiltradas);

      const celulaIds = new Set(celulasFiltradas.map((c: Celula) => c.celula_id));
      const usuariosData = usuariosRes.payload?.data || usuariosRes.data?.data || usuariosRes.payload || usuariosRes.data || [];
      const usuariosFiltrados = effectiveCountry
        ? usuariosData.filter((u: Usuario) => celulaIds.has(u.celula))
        : usuariosData;
      setUsuarios(usuariosFiltrados);

      const pagination = usuariosRes.pagination || usuariosRes.payload?.pagination || usuariosRes.data?.pagination;
      if (pagination) {
        setTotalCount(pagination.total);
        setTotalPages(Math.ceil(pagination.total / 100));
      }

      const allCelulaIds = new Set<number>(celulasFiltradas.map((c: Celula) => c.celula_id));
      setExpandedCelulas(allCelulaIds);
    } catch (err: any) {
      setError('Error al cargar datos: ' + (err.message || 'Error desconocido'));
    } finally {
      if (!(import.meta.env.VITE_INSPECTION_MODE === 'true' || localStorage.getItem('inspectionMode') === 'true')) {
        setLoading(false);
      }
    }
  }, [page, effectiveCountry, refreshKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter(u =>
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.apellido.toLowerCase().includes(search.toLowerCase()) ||
      u.legajo.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [usuarios, search]);

  const celulasDelSistema = useMemo(() => {
    const uniqueCelulas = new Map<number, Celula>();
    celulas.forEach(c => {
      uniqueCelulas.set(c.celula_id, c);
    });
    usuarios.forEach(u => {
      if (!uniqueCelulas.has(u.celula)) {
        uniqueCelulas.set(u.celula, { celula_id: u.celula, nombre: `Célula ${u.celula}`, empresa_origen_id: 0, supervisor_id: '', pais_venta: null });
      }
    });
    return Array.from(uniqueCelulas.values()).sort((a, b) => a.celula_id - b.celula_id);
  }, [usuarios, celulas]);

  const usuariosByCelula = useMemo(() => {
    const grouped: Record<number, Usuario[]> = {};
    filteredUsuarios.forEach(usuario => {
      const celulaId = usuario.celula;
      if (!grouped[celulaId]) {
        grouped[celulaId] = [];
      }
      grouped[celulaId].push(usuario);
    });
    return grouped;
  }, [filteredUsuarios]);

  const getSupervisorByCelula = (celulaId: number) => {
    return usuarios.find(u => u.celula === celulaId && u.rol === 'SUPERVISOR');
  };

  const getCelulaInfo = (celulaId: number) => {
    const celula = celulas.find(c => c.celula_id === celulaId);
    const supervisor = getSupervisorByCelula(celulaId);
    return {
      ...celula,
      supervisor_nombre: supervisor ? `${supervisor.nombre} ${supervisor.apellido}` : undefined,
      supervisor_exa: supervisor?.exa,
      supervisor_legajo: supervisor?.legajo,
      supervisor_email: supervisor?.email,
    };
  };

  const toggleCelula = (celulaId: number) => {
    setExpandedCelulas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(celulaId)) {
        newSet.delete(celulaId);
      } else {
        newSet.add(celulaId);
      }
      return newSet;
    });
  };

  const handleEdit = (usuario: Usuario) => {
    onOpenUserForm?.(celulas, usuario);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este vendedor?')) return;
    setLoading(true);
    try {
      await api.delete(`/usuarios/${id}`);
      setUsuarios(prev => prev.filter(u => u.usuario_id !== id));
    } catch (err: any) {
      setError('Error al eliminar: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (usuario: Usuario) => {
    const newStatus = usuario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    setLoading(true);
    try {
      await api.patch(`/usuarios/${usuario.usuario_id}/status`, { estado: newStatus });
      setUsuarios(prev => prev.map(u =>
        u.usuario_id === usuario.usuario_id ? { ...u, estado: newStatus } : u
      ));
    } catch (err: any) {
      setError('Error al cambiar estado: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const totalVendedores = totalCount;
  const activos = usuarios.filter(u => u.estado === 'ACTIVO').length;

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const state = {
    search, loading, error, usuarios, celulas,
    selectedCelula, expandedCelulas, page, totalPages, totalCount,
    filteredUsuarios, celulasDelSistema, usuariosByCelula,
    permisosUser, isAdmin,
    totalVendedores, activos,
  };

  const actions = {
    setSearch,
    setSelectedCelula,
    toggleCelula,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    handlePrevPage,
    handleNextPage,
    getCelulaInfo,
    loadData,
  };

  return { state, actions };
}
