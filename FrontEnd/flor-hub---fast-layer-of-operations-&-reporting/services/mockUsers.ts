import { VerifiedUser } from '../hooks/useAuthCheck';

/**
 * MOCK_USERS
 * Lista de usuarios predefinidos para pruebas en Modo Inspección.
 * Permite cambiar entre diferentes roles, permisos y perspectivas regionales.
 */
export const MOCK_USERS: VerifiedUser[] = [
  {
    id: 'superadmin-1',
    email: 'superadmin@florhub.com',
    nombre: 'Santiago',
    apellido: 'Sanchez',
    rol: 'SUPERADMIN',
    permisos: ['ALL'],
    legajo: 'LEG-001',
    exa: 'EXA-001',
    celula: 0,
    estado: 'ACTIVO',
    pais_venta: null, // Ver todo (ALL)
  },
  {
    id: 'admin-ar-1',
    email: 'admin.ar@florhub.com',
    nombre: 'Admin',
    apellido: 'Argentina',
    rol: 'ADMIN',
    permisos: ['VENTAS', 'VENTAS_VISUALIZAR', 'REPORTES', 'MODULO_GESTION'],
    legajo: 'LEG-AR-01',
    exa: 'EXA-AR-01',
    celula: 1,
    estado: 'ACTIVO',
    pais_venta: 'ARGENTINA',
  },
  {
    id: 'supervisor-uy-1',
    email: 'supervisor.uy@florhub.com',
    nombre: 'Supervisor',
    apellido: 'Uruguay',
    rol: 'SUPERVISOR',
    permisos: ['VENTAS', 'VENTAS_VISUALIZAR', 'MODULO_SEGUIMIENTO'],
    legajo: 'LEG-UY-01',
    exa: 'EXA-UY-01',
    celula: 2,
    estado: 'ACTIVO',
    pais_venta: 'URUGUAY',
  },
  {
    id: 'vendedor-py-1',
    email: 'vendedor.py@florhub.com',
    nombre: 'Vendedor',
    apellido: 'Paraguay',
    rol: 'VENDEDOR',
    permisos: ['VENTAS'],
    legajo: 'LEG-PY-01',
    exa: 'EXA-PY-01',
    celula: 3,
    estado: 'ACTIVO',
    pais_venta: 'PARAGUAY',
  },
  {
    id: 'backoffice-1',
    email: 'backoffice@florhub.com',
    nombre: 'Back',
    apellido: 'Office',
    rol: 'BACK_OFFICE',
    permisos: ['VENTAS', 'MODULO_REPORTES'],
    legajo: 'LEG-BO-01',
    exa: 'EXA-BO-01',
    celula: 4,
    estado: 'ACTIVO',
    pais_venta: null, // Global
  }
];

export const getMockUserByEmail = (email: string): VerifiedUser | undefined => {
  return MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
};
