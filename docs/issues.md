# Issues detectados — aesthetic-front

Análisis del estado actual del proyecto. Cada issue incluye ubicación exacta, descripción del problema y qué se necesita para resolverlo.

---

## CRITICOS

### [C-01] ~~Sin auth guard en rutas protegidas~~ ✅
**Archivo:** `proxy.ts`

`proxy.ts` ya existe en la raíz con la lógica completa: redirige a `/login` si no hay cookie `token`, y redirige a `/dashboard` si hay token y se intenta acceder a `/login` o `/register`.

---

### [C-02] ~~No existe página de registro~~ ✅
**Archivos:** `app/(auth)/register/page.tsx` (creado), `app/(auth)/login/page.tsx`

Creada `app/(auth)/register/page.tsx` con formulario completo (nombre, negocio, email, password) usando `useRegister`. El link "Crear cuenta" en login actualizado a `/register`.

---

### [C-03] ~~Token 401 no redirige al login~~ ✅
**Archivo:** `lib/api/client.ts`

Agregado interceptor en `apiFetch`: cuando el backend responde 401, se elimina la cookie `token` con `Cookies.remove()` y se redirige con `window.location.href = "/login"`. Evita dependencia circular con `auth.ts` usando js-cookie directamente.

---

## FUNCIONALIDAD ROTA

### [F-01] ~~Botones de editar/eliminar sin acción — Turnos~~ ✅
**Archivos:** `components/EditTurnoModal.tsx` (creado), `app/(app)/turnos/page.tsx`

`✎` abre `EditTurnoModal` (estado, fecha, hora, notas). `⋯` despliega un menú inline con cambios rápidos de estado (Confirmar / Completar / Cancelar / No asistió), filtrando el estado actual del turno.

---

### [F-02] ~~Botón "Editar" sin acción — Clientes~~ ✅
**Archivos:** `components/EditClienteModal.tsx` (creado), `app/(app)/clientes/page.tsx`

`EditClienteModal` pre-populated con los datos del cliente activo (nombre, teléfono, email, notas). El botón "Editar" en el perfil abre el modal usando `useUpdateClient`.

---

### [F-03] ~~Botón "Editar" sin acción — Servicios~~ ✅
**Archivos:** `components/EditServicioModal.tsx` (creado), `app/(app)/servicios/page.tsx`

`EditServicioModal` pre-populated con todos los campos del servicio (nombre, categoría, duración, precio, color, visibilidad). El botón "Editar" en cada tarjeta abre el modal del servicio correspondiente usando `useUpdateService`.

---

### [F-04] ~~Vista Día/Mes en agenda es decorativa~~ ✅
**Archivo:** `app/(app)/agenda/page.tsx`

Implementadas las tres vistas. Estado `view: "dia" | "semana" | "mes"` controla qué se renderiza. Navegación (‹/›/Hoy) ajusta el offset correcto según la vista activa. Vista Mes incluye click en celda para saltar a vista Día de ese día.

---

### [F-05] "Olvidé mi contraseña" no tiene flujo
**Archivo:** `app/(auth)/login/page.tsx:88`

El link apunta a `href="#"`. No hay página ni endpoint de recuperación de contraseña.

**Solución:** Crear `app/(auth)/forgot-password/page.tsx` con campo de email que llame al endpoint del backend.

---

### [F-06] ~~Login con Google no implementado~~ ✅ (frontend listo — requiere backend)
**Archivos:** `types/google.d.ts`, `lib/api/auth.ts`, `hooks/useAuth.ts`, `components/CompleteGoogleRegisterModal.tsx`, `app/(auth)/layout.tsx`, `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`

Frontend completo con Google Identity Services (sin dependencias extra). Flujo:
1. Click → popup de Google → ID token
2. `POST /auth/google { credential }` → usuario existente: redirect a dashboard; usuario nuevo: `{ needsOnboarding: true }` → modal pide `businessName` → segundo call con credential + businessName
3. Disponible en login y register con el mismo flow

**Backend pendiente:** `POST /auth/google` que verifique el Google ID token y devuelva `AuthResponse` o `{ needsOnboarding: true }`. Variable de entorno requerida: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

---

### [F-07] ~~Config — preferencias no se guardan~~ ✅
**Archivo:** `app/(app)/config/page.tsx:39`

El botón "Guardar" no tiene `onClick`. Paleta de color, tipografía, densidad y notificaciones son estado local que se pierde al navegar. No hay endpoint ni hook para persistir preferencias.

**Solución:** Definir endpoint en backend para preferencias de usuario y crear `useUpdatePreferences` hook. Conectar el botón.

---

### [F-08] ~~Logo del negocio — upload no implementado~~ ✅
**Archivo:** `app/(app)/negocio/page.tsx:109-113`

El área de "Subir logo" es un `div` estático sin `<input type="file">` ni lógica de upload.

**Solución:** Agregar `<input type="file" accept="image/*">` oculto, manejar la selección, subir a storage (Vercel Blob u otro) y guardar la URL en el negocio.

---

### [F-09] ~~"quick-add" del dashboard sin onClick~~ ✅
**Archivo:** `app/(app)/dashboard/page.tsx:145-150`

El botón "Agregar un turno para hoy" en la sección "Agenda de hoy" es un `div` sin `onClick`. No abre el modal.

**Solución:** Cambiar a `<button>` con `onClick={() => setModalOpen(true)}`.

---

## DATOS HARDCODEADOS

### [D-01] ~~Actividad reciente es mock data~~ ✅
**Archivo:** `app/(app)/dashboard/page.tsx`

Eliminado el array `ACTIVITY` hardcodeado. La actividad ahora se deriva de los `appts` ya cargados mediante `deriveActivity()`: ordena pasados desc y futuros asc, toma hasta 4, y genera un item por status con color y tiempo relativo ("Hace X min/h" o "a las HH:MM"). Sin turnos muestra empty state. Sin endpoint nuevo.

---

### [D-02] ~~Ocupación del día es hardcodeada~~ ✅
**Archivo:** `app/(app)/dashboard/page.tsx`

Porcentaje, tiempo usado y bloques libres ahora calculados en tiempo real. Se usa `useGetHours` para obtener el horario del día actual y `appts` ya cargados. Helpers: `toMin`, `fromMin`, `formatMinutes`, `calcFreeBlocks` (gaps ≥ 30 min entre turnos activos). Maneja: negocio cerrado hoy, sin bloques libres, estado de carga.

---

### [D-03] ~~Delta KPIs hardcodeados~~ ✅

---

### [D-04] ~~Nombre del usuario hardcodeado en dashboard y sidebar~~ ✅
**Archivos:** `lib/api/auth.ts`, `hooks/useAuth.ts`, `components/Sidebar.tsx`, `app/(app)/dashboard/page.tsx`

El JWT no incluye `name`, por lo que se persiste `{ name, email, role, businessName }` en `localStorage` al hacer login/register/googleAuth (y se limpia en logout). `useCurrentUser` lee ese dato de forma síncrona sin fetch. Sidebar muestra iniciales, nombre corto y rol ("Propietario"/"Colaborador"). Dashboard muestra el primer nombre real.

---

### [D-05] Badge de WhatsApp hardcodeado en sidebar
**Archivo:** `components/Sidebar.tsx:74`

`badge: 3` es un número fijo. No refleja los mensajes no leídos reales.

**Solución:** Consumir `useGetChats()` en el sidebar (o en un hook global de notificaciones) y calcular `chats.reduce((sum, c) => sum + c.unread, 0)`.

---

### [D-06] Estado "En línea" hardcodeado en WhatsApp
**Archivo:** `app/(app)/whatsapp/page.tsx:114`

Todos los chats activos muestran "En línea" independientemente del estado real del contacto.

**Solución:** Remover o mostrar solo si el campo `online` viene del backend. Por ahora mostrar el número de teléfono o la última conexión si está disponible.

---

### [D-07] clientId crudo en agenda del dashboard
**Archivo:** `app/(app)/dashboard/page.tsx:132`

`{appt.clientId}` muestra un UUID en lugar del nombre del cliente.

**Solución:** El tipo `Appointment` debería incluir `clientName: string | null`. Si el backend ya lo devuelve, actualizar la interfaz en `lib/api/appointments.ts`. Si no, solicitar que el backend incluya el campo en la respuesta.

---

## UX / EXPERIENCIA

### [U-01] Estado "no_show" falta en filtros de turnos
**Archivo:** `app/(app)/turnos/page.tsx:12-18`

`AppointmentStatus` incluye `"no_show"` pero el array `FILTERS` no lo contempla. Los turnos con ese estado quedan atrapados en "Todos" sin filtro propio.

**Solución:** Agregar `{ key: "no_show", label: "No asistió" }` al array `FILTERS`.

---

### [U-02] Paginación ausente en todas las listas
**Archivos:** `app/(app)/turnos/page.tsx:28`, `app/(app)/clientes/page.tsx:23`, `app/(app)/whatsapp/page.tsx:32`

Todos los listados usan `limit: 100` sin paginación ni scroll infinito. Con bases de datos reales esto devuelve solo los primeros 100 registros sin aviso al usuario.

**Solución:** Implementar paginación por cursor o página. El response ya incluye `page` y `limit` pero falta `total` para mostrar "X de Y". Agregar `total` al response del backend y controles de paginación en el frontend.

---

### [U-03] Búsqueda de clientes no usa la API
**Archivo:** `app/(app)/clientes/page.tsx:26-28`

El `search` filtra client-side sobre los 100 clientes ya cargados. El endpoint `getClients` acepta `params.search` pero no se usa.

**Solución:** Hacer debounce del input y pasar `search` como parámetro a `useGetClients({ search, limit: 100 })` para que filtre en el servidor.

---

### [U-04] Clicks en turnos de la agenda no abren detalle
**Archivo:** `app/(app)/agenda/page.tsx:116-127`

Los bloques de turno en la vista de calendario tienen `cursor-pointer` pero no tienen `onClick`. No es posible ver detalles ni cambiar estado desde la agenda.

**Solución:** Al hacer click, abrir un popover/modal con los datos del turno y acciones rápidas (Confirmar, Cancelar, etc.) usando `useUpdateAppointment`.

---

### [U-05] Click en celda vacía de la agenda no pre-llena el modal
**Archivo:** `app/(app)/agenda/page.tsx:115`

El `div` de cada día no tiene `onClick` para capturar el horario y pre-llenarlo en `NuevoTurnoModal`.

**Solución:** Detectar el click en la columna del día, calcular la hora según posición Y y abrir el modal con `date` y `time` pre-seteados.

---

### [U-06] No hay estados vacíos explícitos en listas filtradas
**Archivo:** `app/(app)/turnos/page.tsx`

Si se filtra por un estado y no hay resultados, la tabla queda vacía sin mensaje. El usuario no sabe si es un error o si realmente no hay datos.

**Solución:** Mostrar un empty state con mensaje contextual cuando `visible.length === 0`.

---

### [U-07] Sin feedback de éxito en modales
**Archivos:** `NuevoTurnoModal.tsx`, `NuevoClienteModal.tsx`, `NuevoServicioModal.tsx`

Los modales se cierran al crear exitosamente pero no hay ningún toast/snackbar de confirmación. El usuario no recibe feedback visual de que la acción se completó.

**Solución:** Implementar un sistema de notificaciones (toast) global y dispararlo `onSuccess` en las mutations.

---

### [U-08] Mapa en negocio es un placeholder
**Archivo:** `app/(app)/negocio/page.tsx:178-181`

El "mapa" es un `div` con un emoji. No es un mapa real.

**Solución:** Integrar Google Maps Embed API o Mapbox usando la dirección guardada, o directamente mostrar un link a Google Maps con la dirección.

---

## TECNICO / DEUDA

### [T-01] `remember` en login no se usa
**Archivo:** `app/(auth)/login/page.tsx:11,17`

El estado `remember` se trackea y muestra en el checkbox "Mantener sesión", pero no se pasa al `login()` call ni afecta la duración del token/cookie.

**Solución:** Pasar `remember` al `login` mutation y que el backend ajuste la expiración del JWT/cookie (ej. 7 días vs. sesión).

---

### [T-02] `useGetAgenda` existe pero no se usa
**Archivo:** `hooks/useAppointments.ts:75-81`

El hook `useGetAgenda(date)` —que llama a `/appointments/agenda/:date` y devuelve `availableSlots`— está implementado pero ninguna página lo consume. La agenda fetcha todos los appointments y filtra client-side.

**Solución:** La página de Agenda debería usar `useGetAgenda` por día o bien el endpoint con rango de fechas, para obtener también los slots disponibles.

---

### [T-03] Layouts de grupos de rutas son pass-through vacíos
**Archivos:** `app/(app)/layout.tsx`, `app/(auth)/layout.tsx`

Ambos layouts solo hacen `return <>{children}</>`. El de `(app)` debería ser donde viva el auth guard (ver C-01). El de `(auth)` podría verificar que el usuario NO esté autenticado y redirigir al dashboard.

---

### [T-04] Dependencia circular implícita entre hooks
**Archivos:** `hooks/useAppointments.ts:13`, `hooks/useClients.ts`

`useAppointments.ts` importa `clientKeys` de `useClients.ts`. Si `useClients.ts` alguna vez importara algo de `useAppointments.ts`, se crearía una dependencia circular. Considerar mover las query keys a un archivo separado `lib/queryKeys.ts`.

---

### [T-05] `var(--color-*)` usado directamente en algunos style inline
**Archivos:** múltiples componentes

En varios lugares se usa `style={{ background: "var(--color-ok)" }}` en lugar de la clase Tailwind `bg-ok`. Inconsistente con la convención definida en el proyecto (usar clases Tailwind, no variables CSS directamente).

---

## RESUMEN

| Categoria   | Cantidad |
|-------------|----------|
| Criticos    | 3        |
| Funcionalidad rota | 7  |
| Datos hardcodeados | 7  |
| UX / Experiencia   | 8  |
| Tecnico / Deuda    | 5  |
| **Total**   | **30**   |

### Prioridad sugerida de implementación

1. **C-01** — Auth guard (seguridad básica)
2. **C-03** — Interceptor 401 (sesiones expiradas)
3. **F-01, F-02, F-03** — Acciones de editar (funcionalidad core)
4. **D-07** — clientName en turnos (dato visible roto)
5. **U-01** — Filtro no_show (dato perdido)
6. **C-02** — Página de registro
7. **D-04, D-05** — Usuario y badge reales
8. El resto según roadmap del producto
