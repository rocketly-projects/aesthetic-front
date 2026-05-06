# Plan — Capa de comunicación Frontend ↔ Backend

## Arquitectura objetivo

```
Página / Componente
  └── hooks/use*.ts          (React Query)
        └── lib/api/*.ts     (módulos por dominio)
              └── lib/api/client.ts   (fetch core + JWT)
                    └── Backend (Hono · localhost:8787)
```

Reglas:
- Los componentes solo importan hooks, nunca módulos ni `client.ts` directamente.
- Sin `useState`/`useEffect` para fetching — solo React Query.
- TypeScript estricto, sin `any`.
- El JWT se guarda y lee desde cookies (`token`, 7 días).

---

## Fase 0 — Instalar dependencias

> **Correr vos:**

```bash
npm install @tanstack/react-query js-cookie
npm install -D @types/js-cookie
```

- `@tanstack/react-query` — hooks de fetching
- `js-cookie` — leer/escribir el JWT en cookies sin parsear `document.cookie` a mano

---

## Fase 1 — Infraestructura base

### `lib/api/client.ts`
Única pieza que sabe cómo hablar con el backend.
- Clase `ApiError` con `status`, `message` y `details?`
- Función `apiFetch<T>` que adjunta el JWT, hace el fetch y parsea errores centralizadamente
- Base URL desde `NEXT_PUBLIC_API_URL`
- Maneja el formato de error del backend:
  ```json
  { "error": "Mensaje" }
  { "error": "Validation failed", "details": { "campo": ["msg"] } }
  ```

### `providers/QueryProvider.tsx`
Client Component que envuelve la app con `QueryClientProvider`.

### `app/layout.tsx`
Agregar `QueryProvider` alrededor del `{children}`.

---

## Fase 2 — Módulo Auth + hook

### `lib/api/auth.ts`
`login()` y `register()`. Rutas públicas — no necesitan token.
Al recibir la respuesta, guarda el JWT en la cookie.

### `hooks/useAuth.ts`
`useLogin` y `useRegister` con `useMutation`.
En `onSuccess`: guarda el token en cookie y redirige con `useRouter`.

> Por qué primero auth: es el punto de entrada; sin token no funcionan el resto.

---

## Fase 3 — Módulos de dominio

Solo las funciones de fetch, sin hooks aún. Todos tipados contra `API-Context.md`.

### `lib/api/business.ts`
`getBusiness()` · `updateBusiness()` · `getHours()` · `updateHours()`

### `lib/api/services.ts`
`getServices()` · `getService(id)` · `createService()` · `updateService(id)` · `deleteService(id)`

### `lib/api/clients.ts`
`getClients(params)` · `getClient(id)` · `createClient()` · `updateClient(id)` · `deleteClient(id)`

### `lib/api/appointments.ts`
`getAppointments(params)` · `getAppointment(id)` · `createAppointment()` · `updateAppointment(id)` · `deleteAppointment(id)` · `getAgenda(date)`

### `lib/api/whatsapp.ts`
`getChats()` · `getChat(id)` · `createOrGetChat()` · `patchChat(id)` · `getMessages(chatId, params)` · `sendMessage(chatId)`

---

## Fase 4 — Hooks de dominio

Un archivo por dominio en `hooks/`. Cada `useMutation` invalida las `useQuery` relacionadas en `onSuccess`.

### `hooks/useBusiness.ts`
`useGetBusiness` · `useUpdateBusiness` · `useGetHours` · `useUpdateHours`

### `hooks/useServices.ts`
`useGetServices` · `useGetService` · `useCreateService` · `useUpdateService` · `useDeleteService`

### `hooks/useClients.ts`
`useGetClients` · `useGetClient` · `useCreateClient` · `useUpdateClient` · `useDeleteClient`

### `hooks/useAppointments.ts`
`useGetAppointments` · `useGetAppointment` · `useCreateAppointment` · `useUpdateAppointment` · `useDeleteAppointment` · `useGetAgenda`

### `hooks/useWhatsapp.ts`
`useGetChats` · `useGetChat` · `useCreateOrGetChat` · `usePatchChat` · `useGetMessages` · `useSendMessage`

---

## Fase 5 — Wiring de páginas

Reemplazar datos hardcodeados de `lib/data.ts` por hooks reales, página por página:

| Orden | Página | Hooks |
|-------|--------|-------|
| 1 | `/turnos` | `useGetAppointments`, `useCreateAppointment`, `useGetClients`, `useGetServices` |
| 2 | `/clientes` | `useGetClients`, `useGetClient`, `useGetAppointments` |
| 3 | `/servicios` | `useGetServices`, `useCreateService`, `useUpdateService` |
| 4 | `/dashboard` | `useGetAppointments` (con `date=hoy`) |
| 5 | `/agenda` | `useGetAgenda` |
| 6 | `/whatsapp` | `useGetChats`, `useGetMessages`, `useSendMessage` |
| 7 | `/negocio` | `useGetBusiness`, `useUpdateBusiness`, `useGetHours`, `useUpdateHours` |

---

## Árbol final

```
lib/api/
  client.ts
  auth.ts
  business.ts
  clients.ts
  services.ts
  appointments.ts
  whatsapp.ts

hooks/
  useAuth.ts
  useBusiness.ts
  useClients.ts
  useServices.ts
  useAppointments.ts
  useWhatsapp.ts

providers/
  QueryProvider.tsx
```
