# Plan: Componentizar App.tsx + Fix demo login + Mover Select All

## Problemas
1. **App.tsx** ~1103 líneas, difícil de mantener
2. **Demo login** falla con "Correo no encontrado" — seed endpoint nunca se llamó
3. **Select All** está en FilterBar, debe estar en UpdateMenu (barra flotante de selección)

---

## 1. Auto-seed demo user en startup del backend

**Archivo:** `BackEnd/src/main.ts`

Después de la línea 76 (modelos instanciados), agregar un IIFE que:
1. Verifica si `dbConnected` es true
2. Crea `AuthController` con `usuarioModel`
3. Llama a `usuarioModel.getByEmail({ email: 'demo@florhub.com' })`
4. Si no existe, registra el usuario demo con `authCtrl.register({ user: validated })`

```typescript
const { AuthController } = await import('./Controller/AuthController');
const { UsuarioCreateSchema } = await import('./schemas/persona/User');
const authCtrl = new AuthController(usuarioModel);
const existing = await usuarioModel.getByEmail({ email: 'demo@florhub.com' });
if (!existing) {
  const demoUser = {
    nombre: 'DEMO', apellido: 'SUPERADMIN',
    documento: '99999999', tipo_documento: 'DNI',
    nacionalidad: 'ARGENTINA', email: 'demo@florhub.com',
    fecha_nacimiento: '2000-01-01', telefono: '+549999999999',
    genero: 'OTRO', legajo: 'DEMO0', rol: 'SUPERADMIN',
    permisos: ['SUPERADMIN', 'ADMIN', 'BACK_OFFICE', 'SUPERVISOR', 'VENDEDOR'],
    exa: 'EXADEMO', password_hash: 'Demo2024!', celula: 1, estado: 'ACTIVO',
  };
  await authCtrl.register({ user: UsuarioCreateSchema.parse(demoUser) });
}
```

---

## 2. Mover Select All de FilterBar a UpdateMenu

### FilterBar.tsx
- Eliminar props `selectAllChecked`, `onToggleSelectAll`, `visibleCount`
- Eliminar el botón "Seleccionar Todo / Deseleccionar" del JSX

### UpdateMenu.tsx
- Agregar props: `selectAllChecked: boolean`, `onToggleSelectAll: () => void`, `visibleCount: number`
- En el JSX, junto al contador de selección (círculo con número), agregar:
```
<button onClick={onToggleSelectAll} className="...">
  {selectAllChecked ? 'Deseleccionar todo' : 'Seleccionar todo'}
</button>
```

### App.tsx
- Mover `selectAllChecked` y `handleToggleSelectAll` al UpdateMenu en lugar del FilterBar
- Pasar las props al UpdateMenu

---

## 3. Componentizar App.tsx (~1103 → ~500 líneas)

### 3a. Crear hooks extraídos

#### `hooks/useTheme.ts`
Extraer de App.tsx líneas 123–160:
- `isDarkMode`, `themeStyle` useState
- useEffect para persistencia localStorage + clase `dark` en `<html>`
- useEffect para `theme-modern` class

#### `hooks/useAppTabs.ts`  
Extraer de App.tsx líneas 117–135:
- `activeTab`, `trackingSubTab` useState con localStorage
- useEffect para persistencia

#### `hooks/useInspectionMode.ts`
Extraer de App.tsx líneas 67–97:
- `inspectionMode`, `logoClickCount` useState
- `handleLogoClick` callback
- useEffect reset del contador

#### `hooks/useFilterOptions.ts`
Extraer de App.tsx líneas 181–235:
- `planesData`, `promocionesData`, `empresasOrigenData`, `celulasData` + fetch effect
- Soporte para inspectionMode mock data

#### `hooks/usePagination.ts`
Extraer de App.tsx líneas 248–335:
- `currentPage`, `rowsPerPage` state
- `currentLimit`, `totalPages` derived
- `handlePrevPage`, `handleNextPage` callbacks
- useEffect reset page on filter change

#### `hooks/useModalState.ts`
Extraer de App.tsx líneas 237–261:
- Todos los booleanos de modales: `showAdvancedFilters`, `showNomina`, `showUserForm`, etc.
- `selectedSale`, `commentingSale`, `creatingSale`, `editingEstadoVenta`, etc.

### 3b. Crear componente `<AppModals>`

**Archivo nuevo:** `components/layout/AppModals.tsx`

Props que recibe (todas las que necesita para renderizar los ~20 modales condicionales):

```typescript
interface AppModalsProps {
  selectedIds: Set<string>;
  filteredSales: Sale[];
  selectAllChecked: boolean;
  handleToggleSelectAll: () => void;
  isUpdatingBulk: boolean;
  handleUpdateBoth: (s: SaleStatus|null, l: LogisticStatus|null) => void;
  onClearSelection: () => void;
  editingEstadoVenta: Sale | null;
  setEditingEstadoVenta: (v: Sale|null) => void;
  editingCorreo: Sale | null;
  setEditingCorreo: (v: Sale|null) => void;
  editingEstadoCorreo: {...} | null;
  setEditingEstadoCorreo: (v: any) => void;
  creatingSale: Partial<Sale> | null;
  setCreatingSale: (v: any) => void;
  showNomina: boolean;
  setShowNomina: (v: boolean) => void;
  showUserForm: boolean;
  setShowUserForm: (v: boolean) => void;
  userFormCelulas: any[];
  setUserFormCelulas: (v: any) => void;
  userFormEditingUser: any;
  setUserFormEditingUser: (v: any) => void;
  nominaRefreshKey: number;
  setNominaRefreshKey: (v: number) => void;
  selectedSale: Sale | null;
  setSelectedSale: (v: Sale|null) => void;
  commentingSale: Sale | null;
  setCommentingSale: (v: Sale|null) => void;
  // callbacks de actualización
  handleUpdateSale: (data: Partial<Sale>) => void;
  handleSingleUpdateStatus: (status: SaleStatus) => void;
  handleSingleUpdateLogistic: (status: LogisticStatus) => void;
  // otros
  showCommandPalette: boolean;
  setShowCommandPalette: (v: boolean) => void;
  showAIChat: boolean;
  setShowAIChat: (v: boolean) => void;
  activeTab: AppTab;
  setActiveTab: (v: AppTab) => void;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  authUser: any;
}
```

Renderiza condicionalmente:
- `{selectedIds.size > 0 && <UpdateMenu .../>}`
- `{editingEstadoVenta && <EstadoVentaFormModal .../>}`
- `{editingCorreo && <CorreoFormModal .../>}`
- `{editingEstadoCorreo && <EstadoCorreoFormModal .../>}`
- `{creatingSale && <SaleFormModal .../>}`
- `{showNomina && <NominaModal .../>}`
- `{showUserForm && <UserFormModal .../>}`
- `{selectedSale && <SaleModal .../>}`
- `{showCommandPalette && <CommandPalette .../>}`
- `{showAIChat && <AIChatModal .../>}`
- `{commentingSale && <CommentModal .../>}`

### 3c. Modificar App.tsx

- Importar y usar los 6 hooks nuevos
- Importar y usar `<AppModals>`
- Mantener solo:
  - Auth logic (useAuth, useAuthCheck)
  - Datos de ventas (useVentasQuery)
  - Lógica de filtrado (filteredSales, trackingGroups)
  - Lógica de selección (selectedIds, handleToggleSelectAll)
  - Bulk update handlers (handleUpdateBoth, etc.)
  - Single update handlers
  - Export CSV helper
- Reemplazar todo el bloque de modales con `<AppModals .../>`

### 3d. Cleanup adicional

- Remover imports no usados: `Logo`, `ErrorBoundary`, `LineStatus`
- Unificar `onToggleSelect` en un solo `useCallback` (en lugar de duplicado inline en jsx)
- Remover `console.log` de debug

---

## Orden de implementación

1. Auto-seed demo en backend (3 líneas en main.ts)
2. Mover Select All a UpdateMenu (FilterBar.tsx, UpdateMenu.tsx, App.tsx)
3. Crear hooks (1 archivo cada uno)
4. Crear AppModals.tsx
5. Refactorizar App.tsx
6. Verificar typecheck

## Demo credentials finales
- **Email:** `demo@florhub.com`
- **Password:** `Demo2024!`
- **Rol:** SUPERADMIN
- **Permisos:** SUPERADMIN, ADMIN, BACK_OFFICE, SUPERVISOR, VENDEDOR
