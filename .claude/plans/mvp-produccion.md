# Plan: aesthetic MVP — Producción

## Contexto

El core del producto está completo (turnos, clientes, servicios, agenda, reservas públicas, billing con MP, WhatsApp bot). Este plan cubre los gaps que bloquean o ponen en riesgo el lanzamiento a producción como MVP.

---

## 🔴 Bloqueantes

### 1. Verificar firma de webhooks de MercadoPago - OK
**Archivos:** `aesthetic-back/src/routes/billing.ts`

El env `MP_WEBHOOK_SECRET` está declarado en `Bindings` pero los handlers `/billing/webhook` y `/billing/deposit-webhook` no verifican la firma HMAC-SHA256 que MP envía en el header `x-signature`. Cualquiera puede falsificar un pago.

**Fix:** Al inicio de cada handler, leer `x-signature` y `x-request-id`, reconstruir el string `ts:xxx,v1:xxx` y verificar con `crypto.subtle.verify` usando `MP_WEBHOOK_SECRET`. Rechazar con 401 si no coincide.

---

### 2. Dominio propio en Resend
**Archivos:** `aesthetic-back/src/lib/email.ts`

`from: 'aesthetic <onboarding@resend.dev>'` solo entrega a `aesthetic.rocketly@gmail.com`. Con usuarios reales los emails no llegan.

**Pasos:**
1. Comprar dominio (ej. `aestheticapp.com.ar`) en Cloudflare Registrar
2. Verificar dominio en Resend → agregar registros DNS (MX, DKIM, SPF)
3. Cambiar `from` en `email.ts` a `noreply@aestheticapp.com.ar`
4. Actualizar `wrangler secret put` si es necesario

---

### 3. Recuperación de contraseña
**Archivos a crear/modificar:**
- `aesthetic-back/src/routes/auth.ts` — 2 endpoints nuevos
- `aesthetic-back/src/db/schema.ts` — 2 columnas en `users`
- `aesthetic-front/app/(auth)/forgot-password/page.tsx` — nueva página
- `aesthetic-front/app/(auth)/reset-password/page.tsx` — nueva página

**Backend:**
- Agregar `passwordResetToken text` y `passwordResetExpiresAt timestamp` a tabla `users` + migración
- `POST /auth/forgot-password` → genera token aleatorio (`crypto.randomUUID`), guarda hash en DB con expiración 1h, envía email con link `${FRONTEND_URL}/reset-password?token=xxx`
- `POST /auth/reset-password` → valida token, actualiza `passwordHash`, limpia token

**Frontend:**
- Página `/forgot-password`: input email + submit → llama al endpoint → muestra "revisá tu email"
- Página `/reset-password?token=xxx`: inputs nueva contraseña + confirmación → llama al endpoint → redirige a `/login`
- Agregar link "¿Olvidaste tu contraseña?" en `/login` (placeholder ya existe)

---

### 4. Cron de expiración de turnos en producción
**Archivos:** `aesthetic-back/wrangler.toml`

El endpoint `/billing/appointments/expire` cancela turnos `awaiting_payment` vencidos pero depende de n8n externo. Si n8n no está activo, slots quedan bloqueados forever.

**Fix recomendado:** Migrar a Cloudflare Cron Trigger (sin dependencia externa):

```toml
# wrangler.toml
[triggers]
crons = ["0 * * * *"]  # cada hora
```

Agregar handler `scheduled()` en `src/index.ts` que ejecute la misma lógica de expiración.

---

## 🟡 Importantes

### 5. Trial de 14 días - OK
**Archivos:** `aesthetic-back/src/routes/billing.ts`, `aesthetic-back/src/db/schema.ts`, `aesthetic-front/components/PlanGate.tsx`

La landing promete "14 días gratis" pero un usuario nuevo tiene `planStatus: 'inactive'` y PlanGate muestra el paywall de inmediato.

**Implementado (Opción B — DB-based):** `trialEndsAt timestamp` en `businesses` (se setea en `createdAt + 14 días`). En `GET /billing/status` se incluye `trialEndsAt`. En `PlanGate`: si `planStatus !== 'active'` pero `trialEndsAt > now()`, se deja pasar con banner de días restantes.

**Alcance del trial (Opción A):** Solo funcionalidades básicas. WhatsApp bot sigue bloqueado (requiere configuración manual de número por usuario).

---

### 6. Páginas de error en Next.js - OK
**Archivos a crear:**
- `aesthetic-front/app/error.tsx`
- `aesthetic-front/app/not-found.tsx`
- `aesthetic-front/app/(app)/error.tsx`

Componentes mínimos con mensaje amigable, botón "Reintentar" (error) o link al inicio (404). Usan el diseño existente (`bg-bg`, `font-display`, colores del theme).

---

### 7. Deployment checklist
Verificar antes del go-live:

**Backend (Cloudflare Workers):**
- [ ] `wrangler secret put RESEND_API_KEY`
- [ ] `FRONTEND_URL` = URL de producción de Vercel
- [ ] MP webhook URL → `https://<worker>.workers.dev/billing/webhook`
- [ ] MP deposit webhook URL → `/billing/deposit-webhook?businessId=xxx`
- [ ] Google OAuth: agregar redirect URI del Worker en Google Console
- [ ] `npm run migrate` en producción (tabla `notifications`, columnas WhatsApp)

**Frontend (Vercel):**
- [ ] `NEXT_PUBLIC_API_URL` = URL del Worker
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- [ ] `BLOB_READ_WRITE_TOKEN`
- [ ] Authorized origins en Google Console → dominio de Vercel

---

### 8. Rate limiting en login
**Archivos:** `aesthetic-back/src/routes/auth.ts`

Sin throttle en `POST /auth/login`. Solución liviana con Cloudflare KV: contar intentos por IP, bloquear por 15 min tras 10 intentos fallidos, retornar 429 con `Retry-After` header.

---

## Orden de ejecución sugerido

1. **#2 Resend domain** — no requiere código, es infra, desbloquea emails para todo lo demás
2. **#1 Webhook signature** — protege el sistema de pagos
3. **#3 Password reset** — requiere migración de DB + código full-stack
4. **#4 Cron en Cloudflare** — pequeño cambio en wrangler.toml + handler
5. **#5 Trial 14 días** — verificar MP primero, si no alcanza → opción B
6. **#6 Error pages** — rápido, puro frontend
7. **#7 Deployment checklist** — recorrer la lista item por item
8. **#8 Rate limiting** — el menos urgente
