# Plan: Migrar Frontend a Arquitectura MVVM

## Diagnóstico actual

**~835 líneas de lógica de negocio filtradas en componentes.** Los principales ofensores:

| Archivo | Líneas | Lógica mezclada |
|---|---|---|
| `App.tsx` | ~852 | 300+ líneas de handlers bulk, tracking, filtros, export — todo en el "controller" |
| `SaleFormModal.tsx` | ~733 | 250+ líneas: fetching, validación multi-paso, búsqueda cliente, armado payload |
| `SaleModal.tsx` | ~350 | 170+ líneas: mapper backend→domain, edit state |
| `LoginPage.tsx` | ~255 | 60+ líneas: validación inline, llenado mock users |
| `CommentModal.tsx` | ~249 | 40+ líneas: creación comentario, fechas |
| `SaleCard.tsx` | ~253 | 15+ líneas: fresh calc, glow effects |

**Ya existen componentes puros** (GestionPage, FilterBar, EstadoVentaFormModal, SaleDetail) que no tocan la API.

---

## Estándar MVVM

```
View (componente puro)
  ↓ props y callbacks
ViewModel (custom hook en hooks/viewmodels/)
  ↓ usa hooks de datos + transforma estado
Model (services/ + types/ + schemas/)
```

**ViewModel** = hook que expone `{ state, actions, computed }`:
- `state` — datos, loading, error, UI flags
- `actions` — funciones que el View llama (submit, toggle, select)
- `computed` — valores derivados (filteredItems, totalPages, etc.)

**View** = componente que SOLO renderiza, no llama API, no tiene lógica de negocio.

---

## Fases de implementación

### Fase 1 — Base (ViewModels pequeños, bajo riesgo)

| ViewModel | Origen | Lógica a extraer | Archivos nuevos |
|---|---|---|---|
| `useLoginViewModel` | `LoginPage.tsx:26-89` | validación email/password, fillInspectionUser, handleSubmit c/ localStorage | `hooks/viewmodels/useLoginViewModel.ts` |
| `useSaleCardViewModel` | `SaleCard.tsx:109-131` | cálculo isFresh, glow animation effects | `hooks/viewmodels/useSaleCardViewModel.ts` |
| `useCommentViewModel` | `CommentModal.tsx:14-98` | handleSubmit, formatDate, getTipoIcon/Color | `hooks/viewmodels/useCommentViewModel.ts` |

### Fase 2 — Núcleo (ViewModels complejos)

| ViewModel | Origen | Lógica a extraer | Archivos nuevos |
|---|---|---|---|
| `useGestionViewModel` | `App.tsx:93-637` (parcial) | filteredSales, trackingGroups, uniqueAdvisors, exportCSV + combina useVentasQuery + usePagination + useFilterOptions | `hooks/viewmodels/useGestionViewModel.ts` |
| `useBulkUpdateViewModel` | `App.tsx:115-338` | handleUpdateStatus, handleUpdateLogistic, handleUpdateBoth | `hooks/viewmodels/useBulkUpdateViewModel.ts` |
| `useSaleDetailViewModel` | `SaleModal.tsx:32-246` | mapBackendToSaleDetail, handleEdit, handleSave | `hooks/viewmodels/useSaleDetailViewModel.ts` |
| `useSaleFormViewModel` | `SaleFormModal.tsx:20-403` | multi-step form state, client search/create, plan filtering, payload construction | `hooks/viewmodels/useSaleFormViewModel.ts` |

### Fase 3 — Refactor de componentes

| Componente | Cambio |
|---|---|
| `LoginPage.tsx` | Usar `useLoginViewModel`, componente solo renderiza formulario |
| `SaleCard.tsx` | Usar `useSaleCardViewModel`, solo renderiza |
| `CommentModal.tsx` | Usar `useCommentViewModel`, solo renderiza |
| `SaleFormModal.tsx` | Usar `useSaleFormViewModel`, pasar `viewModel.state.fase` etc. |
| `SaleModal.tsx` | Usar `useSaleDetailViewModel`, pasar `viewModel.state.detail` |
| `App.tsx` | Usar `useGestionViewModel` + `useBulkUpdateViewModel`, eliminar ~300 líneas de handlers |

### Fase 4 — Limpieza

| Tarea | Detalle |
|---|---|
| Mover `api.Xxx()` inline de App.tsx | Reemplazar llamadas directas a `api.post()` con funciones en `services/` |
| Convertir `useFilterOptions.ts` | Reemplazar `useEffect`+`api.get` con React Query (`useQuery`) |
| Eliminar imports muertos | `Logo`, `ErrorBoundary`, `LineStatus` ya removidos; revisar otros |
| Estandarizar export de ViewModels | Todos los ViewModels exportan `{ state, actions, computed }` |

---

## Ejemplo concreto: `useLoginViewModel`

```typescript
// hooks/viewmodels/useLoginViewModel.ts
export function useLoginViewModel(onLogin: (email: string, password: string, keepSession: boolean) => Promise<void>, authError: string | null) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSession, setKeepSession] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (e: string) => !e ? 'El correo es obligatorio' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? 'Formato de correo inválido' : undefined;
  const validatePassword = (p: string) => !p ? 'La contraseña es obligatoria' : undefined;

  const handleSubmit = async () => {
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (emailErr || passErr) { setFieldErrors({ email: emailErr, password: passErr }); return; }
    setIsLoading(true);
    try {
      await onLogin(email, password, keepSession);
    } catch {
      // error manejado externamente
    } finally {
      setIsLoading(false);
    }
  };

  const fillInspectionUser = (user: typeof DEMO_CREDENTIALS) => {
    setEmail(user.email);
    setPassword(user.password);
  };

  return {
    state: { email, password, showPassword, keepSession, fieldErrors, isLoading, authError, inspectionUsers: DEMO_INSPECTION_USERS },
    actions: { setEmail, setPassword, setShowPassword, setKeepSession, handleSubmit, fillInspectionUser },
  };
}
```

```typescript
// LoginPage.tsx (View puro)
const { state, actions } = useLoginViewModel(onLogin, authError);
// ... solo renderiza: <input value={state.email} onChange={e => actions.setEmail(e.target.value)} />
// ... <button onClick={actions.handleSubmit} disabled={state.isLoading}>
```

---

## Resultado esperado

| Métrica | Antes | Después |
|---|---|---|
| `App.tsx` | 852 líneas | ~400 líneas (solo orquestación) |
| `SaleFormModal.tsx` | 733 líneas | ~350 líneas (solo render) |
| `SaleModal.tsx` | 350 líneas | ~180 líneas (solo render) |
| `LoginPage.tsx` | 255 líneas | ~150 líneas (solo render) |
| Lógica en vistas | ~835 líneas | ~50 líneas (solo helpers visuales) |
| ViewModels | 0 | 7 archivos en `hooks/viewmodels/` |
| Nuevos archivos | — | `hooks/viewmodels/` directorio + 7 archivos |

---

## Mitigación de riesgos

1. **No romper nada existente:** Cada ViewModel se crea nuevo, el componente viejo se mantiene hasta que el nuevo ViewModel esté probado
2. **Sin cambios en API:** Los ViewModels envuelven los hooks/service existentes, no los reemplazan
3. **Pruebas:** Ejecutar `npm run build` (o `npx tsc --noEmit`) después de cada ViewModel
4. **Prioridad:** Fase 1 primero (bajo riesgo), Fase 2 después (alto impacto), Fase 3 al final
