# Plan — Integración WhatsApp Cloud API

Reemplaza el chatbot actual de n8n (chat trigger interno) por una integración real con WhatsApp Cloud API de Meta, multi-tenant, con el backend como gateway.

---

## Contexto y diagnóstico del estado actual

### Lo que ya funciona
- **Backend Hono/CF Workers** con endpoints `/whatsapp/chats`, `/whatsapp/chats/:id/messages` para persistir mensajes
- **Endpoint `/bot/identify`** que resuelve `whatsappPhone → businessId` (ya soporta multi-tenant a nivel datos)
- **Tabla `businesses`** con campos `whatsappPhone`, `whatsappBotActive`, `whatsappRequestedAt`
- **Workflow n8n "Aesthetic – Bot WhatsApp"** (id `gyObwcM9JI7h3CTI`) con AI Agent (gpt-4o-mini), 8 tools (Buscar/Crear Cliente, Listar Servicios, Ver Agenda, Ver Horarios, Reservar/Cancelar Turno, Ver mis turnos), system prompt funcional para reservas + pagos con seña + cancelaciones
- **Vista de Negocio** con flujo de alta manual por email
- **PlanGate Pro** para gatear la feature

### Los 3 problemas críticos
1. **Trigger incorrecto** — `@n8n/n8n-nodes-langchain.chatTrigger` es el chat interno de n8n. No hay nada conectado a WhatsApp real.
2. **Teléfonos hardcodeados** — `+5491111111` y `2983 341123` en 6 lugares del workflow. Imposibilita multi-tenant real.
3. **Sin envío saliente** — el AI genera respuesta, se guarda en DB, pero nunca llega al celular del cliente.

### Arquitectura objetivo

```
Cliente WA ──► Meta Cloud API ──► aesthetic-back/webhook/whatsapp
                                            │
                                            │ verifica firma HMAC
                                            │ extrae from + phoneNumberId + text
                                            │ responde 200 OK (< 1s)
                                            │ waitUntil → POST a n8n
                                            ▼
                                   n8n Webhook (async)
                                            │
                                            │ identifica negocio
                                            │ AI Agent + tools
                                            │ guarda msgs en DB
                                            ▼
                                  Meta API graph.facebook.com
                                            │
                                            ▼
                                   Cliente recibe respuesta
```

---

## Etapa 1 — Setup en Meta (manual, ~1-2 horas + verificación 2-5 días)

### 1.1 — Meta Business Portfolio
1. [business.facebook.com](https://business.facebook.com) → iniciar sesión con cuenta personal de Facebook (es obligatoria como base)
2. **Crear cuenta empresarial** → nombre `Rocketly` (o el que se use para Aesthetic)
3. Datos del negocio: razón social, dirección, sitio web

### 1.2 — Verificación del negocio (NO requerida desde 2024-2025)

**Update:** Meta confirmó en el panel: "No es necesario verificar tu organización". La Business Verification clásica (con docs AFIP, extracto bancario, etc.) dejó de ser requisito para WhatsApp Cloud API.

**Lo que sí aplica ahora:**

| Concepto | Qué es | Necesario? |
|---|---|---|
| Business Verification (clásica) | Verificación con docs del negocio | NO — Meta lo confirmó |
| Meta Verified | Suscripción paga (~$14.99 USD/mes), badge azul | NO — opcional |
| Autorizaciones y verificaciones | Sección que agrupa verificaciones específicas | Solo si Meta pide algo puntual |

**Requisitos REALES para WA Cloud API:**
1. **Display name approval** — al agregar un número, Meta revisa el nombre comercial (automático, minutos/horas)
2. **Commerce Policy** — no vender items prohibidos (turnos de estética OK)
3. **Phone Number Quality Rating** — Meta mide calidad de mensajes (empezás en High)

**Tiers de envío (reemplazan al concepto "verificado vs no verificado"):**

| Tier | Conversaciones business-initiated / 24h |
|---|---|
| Unverified Tier | 250 destinatarios únicos / día |
| Tier 1 | 1.000 |
| Tier 2 | 10.000 |
| Tier 3 | 100.000 |
| Tier 4 | Ilimitado |

Subís de tier automáticamente con quality rating High + uso cerca del límite por 2 días en ventana de 7.

**Implicancia para Aesthetic:** como el bot solo RESPONDE a mensajes del cliente (entran en ventana de servicio de 24h), estos límites casi no aplican. Arrancás sin verificación, sin Meta Verified, sin pagar nada extra.

### 1.3 — App de desarrollador
1. [developers.facebook.com](https://developers.facebook.com) → **Mis aplicaciones** → **Crear app**
2. Tipo: **Business** (no Consumer)
3. Nombre: `Aesthetic Bot`
4. Vincular al Meta Business Portfolio creado
5. **Agregar producto: WhatsApp** → "Set up"

Esto crea automáticamente:
- Una **WABA de prueba** (WhatsApp Business Account)
- Un **número de teléfono de prueba** (`+1 555 …`) con límite de 5 destinatarios y 1000 conversaciones gratis al mes

### 1.4 — App Secret (para verificar firmas de webhook)
1. App → **App Settings > Basic**
2. **App Secret** → mostrar → copiar
3. Guardar como: **`META_APP_SECRET`**

### 1.5 — Token permanente de System User
Token que usa backend/n8n para enviar mensajes. No vence si está bien configurado.

1. [business.facebook.com](https://business.facebook.com) → Business Portfolio
2. **Configuración > Usuarios > Usuarios del sistema**
3. **Agregar** → nombre `aesthetic-bot-system-user` → rol **Admin**
4. Click en el usuario creado → **Agregar activos**:
   - Apps → app Aesthetic Bot → **Control total**
   - WhatsApp Accounts → WABA → **Control total**
5. **Generar nuevo token**:
   - App: Aesthetic Bot
   - Vencimiento: **Nunca**
   - Permisos:
     - `whatsapp_business_messaging` (enviar mensajes)
     - `whatsapp_business_management` (administrar números/templates)
     - `business_management` (admin del Portfolio)
6. Copiar token (no se puede ver de nuevo después)
7. Guardar como: **`META_ACCESS_TOKEN`**

### 1.6 — Agregar número real (por cada cliente, manualmente)
Mismo flujo que hoy con el email — proceso manual cada vez que se da de alta un cliente nuevo:

1. App → **WhatsApp > Configuración de API** → **Agregar número de teléfono**
2. Datos: nombre comercial (del cliente), categoría del negocio, descripción
3. Verificación: SMS u OTP por voz al número del cliente
4. **Importante:** el número no puede estar registrado en la app WhatsApp normal. Si el cliente tiene WA personal en ese número, hay que dar de baja primero. Si quiere mantener el WA personal, necesita un número nuevo.
5. Anotar:
   - **`PHONE_NUMBER_ID`** (para enviar — está en la consola)
   - **`display_phone_number`** (formato internacional `+54911…`)

### 1.7 — Configurar webhook (UNA VEZ para toda la app)
1. App → **WhatsApp > Configuración** → **Webhook**
2. **Callback URL**: `https://aesthetic-back.aesthetic-rocketly.workers.dev/webhook/whatsapp`
3. **Verify token**: string secreto inventado, ej. `aes_wh_verify_2026_xyz789`
4. Guardar como: **`META_WEBHOOK_VERIFY_TOKEN`**
5. Suscribirse al campo: **`messages`** (incluye texto, audio, imagen, status)

Al agregar cada número nuevo a la WABA, los mensajes van automáticamente a este mismo webhook. El `phone_number_id` en el payload identifica a qué número llegó.

### 1.8 — Resumen de credenciales

| Variable | De dónde | Cuándo se usa | Multi-tenant |
|---|---|---|---|
| `META_APP_SECRET` | App Settings > Basic | Verificar firma de webhooks | Compartido (una sola app) |
| `META_WEBHOOK_VERIFY_TOKEN` | Inventado | Verificación inicial del webhook | Compartido |
| `META_ACCESS_TOKEN` | System User token | Enviar mensajes via Meta API | Compartido |
| `META_GRAPH_API_VERSION` | Doc Meta | URL del endpoint | Compartido — usar `v22.0` |
| `PHONE_NUMBER_ID` | Por cada número agregado | Endpoint de envío `/{ID}/messages` | **Por negocio** — va en DB |
| `display_phone_number` | Por cada número agregado | Lookup en `bot/identify` | **Por negocio** — ya está en `whatsappPhone` |

---

## Etapa 2 — Backend: webhook endpoint + multi-tenant

### 2.1 — Migración DB

**Archivo nuevo:** `aesthetic-back/drizzle/0005_whatsapp_phone_number_id.sql`
```sql
ALTER TABLE "businesses" ADD COLUMN "whatsapp_phone_number_id" text;
```

**Actualizar:** `aesthetic-back/src/db/schema.ts` — agregar el campo en `businesses`:
```ts
whatsappPhoneNumberId: text('whatsapp_phone_number_id'),
```

### 2.2 — Actualizar Bindings y env vars

**`aesthetic-back/src/index.ts`** — agregar a `Bindings`:
```ts
export type Bindings = {
  // ... existentes ...
  // WhatsApp Cloud API
  META_APP_SECRET: string
  META_WEBHOOK_VERIFY_TOKEN: string
  META_ACCESS_TOKEN: string
  META_GRAPH_API_VERSION: string
  N8N_WHATSAPP_WEBHOOK_URL: string
}
```

**`aesthetic-back/wrangler.toml`**:
```toml
[vars]
META_GRAPH_API_VERSION = "v22.0"
```
Los secretos (`META_APP_SECRET`, `META_WEBHOOK_VERIFY_TOKEN`, `N8N_WHATSAPP_WEBHOOK_URL`, `META_ACCESS_TOKEN`) se cargan con:
```bash
wrangler secret put META_APP_SECRET
wrangler secret put META_WEBHOOK_VERIFY_TOKEN
wrangler secret put N8N_WHATSAPP_WEBHOOK_URL
wrangler secret put META_ACCESS_TOKEN
```

> `META_ACCESS_TOKEN` lo cargás en backend por si más adelante mandás desde ahí (recordatorios, mensajes proactivos). El sender real al principio es n8n.

### 2.3 — Endpoint webhook

**Archivo nuevo:** `aesthetic-back/src/routes/webhook.ts`
```ts
import { Hono } from 'hono'
import type { Bindings, Variables } from '../index'

export const webhookRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// GET: verificación inicial de Meta
webhookRoutes.get('/whatsapp', (c) => {
  const mode = c.req.query('hub.mode')
  const token = c.req.query('hub.verify_token')
  const challenge = c.req.query('hub.challenge')

  if (mode === 'subscribe' && token === c.env.META_WEBHOOK_VERIFY_TOKEN) {
    return c.text(challenge ?? '', 200)
  }
  return c.json({ error: 'Forbidden' }, 403)
})

// POST: mensajes entrantes
webhookRoutes.post('/whatsapp', async (c) => {
  const rawBody = await c.req.text()
  const signature = c.req.header('x-hub-signature-256')

  // Verificar firma HMAC
  if (!signature || !(await verifySignature(c.env.META_APP_SECRET, rawBody, signature))) {
    return c.json({ error: 'Invalid signature' }, 401)
  }

  let payload: WhatsAppWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400)
  }

  // Extraer mensajes — Meta puede mandar varios entries / changes en un mismo POST
  const messages = extractTextMessages(payload)

  // Forward async a n8n para responder rápido a Meta (debe ser < 5s o reintenta)
  for (const msg of messages) {
    c.executionCtx.waitUntil(
      fetch(c.env.N8N_WHATSAPP_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      }).catch((err) => {
        console.error('n8n forward failed', err)
      })
    )
  }

  return c.json({ received: true })
})

// ───────────────────────────────────────────────────────────────────────────

type WhatsAppWebhookPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        metadata?: { phone_number_id?: string; display_phone_number?: string }
        messages?: Array<{
          id?: string
          from?: string
          type?: string
          text?: { body?: string }
          timestamp?: string
        }>
        contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>
      }
    }>
  }>
}

type N8nMessage = {
  from: string
  fromName: string | null
  message: string
  businessPhone: string
  phoneNumberId: string
  waMessageId: string
}

function extractTextMessages(payload: WhatsAppWebhookPayload): N8nMessage[] {
  const out: N8nMessage[] = []
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value
      if (!value?.messages) continue
      const phoneNumberId = value.metadata?.phone_number_id
      const displayPhone = value.metadata?.display_phone_number
      if (!phoneNumberId || !displayPhone) continue

      for (const m of value.messages) {
        if (m.type !== 'text' || !m.text?.body || !m.from || !m.id) continue
        const contact = value.contacts?.find((c) => c.wa_id === m.from)
        out.push({
          from: m.from,
          fromName: contact?.profile?.name ?? null,
          message: m.text.body,
          businessPhone: `+${displayPhone.replace(/^\+/, '')}`,
          phoneNumberId,
          waMessageId: m.id,
        })
      }
    }
  }
  return out
}

async function verifySignature(secret: string, body: string, signature: string): Promise<boolean> {
  const expected = await hmacSha256(secret, body)
  const provided = signature.replace(/^sha256=/, '')
  return timingSafeEqual(expected, provided)
}

async function hmacSha256(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
```

### 2.4 — Registrar la ruta como pública

**`aesthetic-back/src/index.ts`**:
```ts
import { webhookRoutes } from './routes/webhook'
// ...
app.route('/auth', authRoutes)
app.route('/bot', botRoutes)
app.route('/public', publicRoutes)
app.route('/billing', billingRoutes)
app.route('/webhook', webhookRoutes)  // ← nueva, sin auth
```

### 2.5 — Permitir guardar `whatsappPhoneNumberId` por API

**`aesthetic-back/src/routes/businesses.ts`** — en el PATCH de `me`:
- Schema de validación: `whatsappPhoneNumberId: z.string().nullable().optional()`
- Aceptarlo en el update — para cargarlo desde el panel cuando se da de alta el número

> Iteración 2: panel admin con un input para cargar `whatsappPhone` + `whatsappPhoneNumberId` + `whatsappBotActive = true` en un solo paso. Por ahora se carga via script o llamada directa a la API.

---

## Etapa 3 — Modificaciones del workflow n8n

### 3.1 — Reemplazar trigger
**Quitar:** `Chat Trigger`
**Agregar:** Node `Webhook`
- HTTP Method: `POST`
- Path: `aesthetic-whatsapp`
- Response Mode: **"Respond Immediately"** con body `{ ok: true }`
- Authentication: Header Auth con un secret (opcional pero recomendado)

Esto permite que el backend reciba el 200 al instante sin esperar todo el flujo de AI.

### 3.2 — Crear credential de Meta API
1. n8n → **Credentials** → **New** → **HTTP Header Auth**
2. Name: `Meta WhatsApp API`
3. Header Name: `Authorization`
4. Header Value: `Bearer {META_ACCESS_TOKEN}`

### 3.3 — Cambios en los nodos existentes

| Nodo | Cambio | De | A |
|---|---|---|---|
| `Identificar Negocio` | Body `whatsappPhone` | `+5491111111` | `={{ $('Webhook').item.json.body.businessPhone }}` |
| `Buscar Cliente por Tel` | Query `search` | `2983 341123` | `={{ $('Webhook').item.json.body.from }}` |
| `Crear Chat` | Body `clientPhone` | `2983 341123` | `={{ $('Webhook').item.json.body.from }}` |
| `Crear Chat` | Body `clientName` | `={{ ...clients?.[0]?.name ?? null }}` | `={{ $('Buscar Cliente por Tel').item.json.clients?.[0]?.name ?? $('Webhook').item.json.body.fromName }}` |
| `Guardar Msg Cliente` | Body `content` | `={{ $('Chat Trigger').item.json.chatInput }}` | `={{ $('Webhook').item.json.body.message }}` |
| `AI Agent` | Field `text` | `={{ $('Chat Trigger').item.json.chatInput }}` | `={{ $('Webhook').item.json.body.message }}` |
| `AI Agent` | System Prompt | hardcoded `2983 341123` | `{{ $('Webhook').item.json.body.from }}` |
| `Buscar Cliente Final` | Query `search` | `2983 341123` | `={{ $('Webhook').item.json.body.from }}` |

> **System prompt del AI Agent:** revisar las 2 menciones del teléfono hardcodeado. La línea `El número de teléfono del cliente con quien estás hablando es: 2983 341123.` y las referencias a "Usá 'Buscar Cliente' con el número 2983 341123" se reemplazan por la expresión dinámica.

### 3.4 — Memoria del AI Agent: separar por cliente
El nodo `Memoria` (`memoryBufferWindow`) usa la sesión del chat trigger por default. Como ahora viene de webhook, necesita un `sessionIdExpression` para no mezclar conversaciones entre clientes:

- Memory → **Session ID** → modo `Define below`
- Expression: `={{ $('Webhook').item.json.body.phoneNumberId + ':' + $('Webhook').item.json.body.from }}`

Esto le da un session ID único por par (número del negocio, teléfono del cliente). Sin esto, todos los clientes comparten el mismo contexto.

### 3.5 — Nuevo nodo: enviar respuesta a WhatsApp
Después de `AI Agent`, antes de `Guardar Respuesta Bot`, agregar HTTP Request:

- **Name:** `Enviar a WhatsApp`
- **Method:** POST
- **URL:** `=https://graph.facebook.com/v22.0/{{ $('Webhook').item.json.body.phoneNumberId }}/messages`
- **Authentication:** Credential `Meta WhatsApp API`
- **Send Body:** JSON
- **Body:**
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "={{ $('Webhook').item.json.body.from }}",
  "type": "text",
  "text": {
    "preview_url": true,
    "body": "={{ $('AI Agent').item.json.output }}"
  }
}
```

> **`preview_url: true`** hace que los links (ej. `initPoint` de MP para la seña) se rendericen con preview en WhatsApp.

### 3.6 — Conexión final
```
Webhook
  → Identificar Negocio
  → Buscar Cliente por Tel
  → Crear Chat
  → Guardar Msg Cliente
  → AI Agent
  → Enviar a WhatsApp        ← NUEVO
  → Guardar Respuesta Bot
  → Buscar Cliente Final
  → Actualizar Chat
```

Decisión: **mandar a WhatsApp antes de guardar la respuesta en DB** prioriza la UX del cliente (recibe rápido). Si falla el guardado, la respuesta ya llegó.

---

## Etapa 4 — Idempotencia y deduplicación

Meta reintenta el webhook si no recibe 200 dentro de ~5 segundos, o si el endpoint responde error. Para evitar procesar el mismo mensaje dos veces:

### Opción A — Rápida (KV en Cloudflare)
Agregar al endpoint webhook, antes de forwardear a n8n:
```ts
const seenKey = `wa:msg:${msg.waMessageId}`
const seen = await c.env.RATE_LIMIT.get(seenKey)
if (seen) continue  // ya procesado, saltar
c.executionCtx.waitUntil(c.env.RATE_LIMIT.put(seenKey, '1', { expirationTtl: 86400 }))
```

(Ya está el `RATE_LIMIT` KVNamespace en bindings — reusar o crear uno nuevo `WHATSAPP_DEDUPE`.)

### Opción B — Más robusta (en DB)
Agregar columna `wa_message_id` UNIQUE en `whatsapp_messages` y manejar el conflict 23505 como "ya procesado". Más caro pero a prueba de balas.

**Recomendación:** Opción A ahora, Opción B si llegan duplicados en producción.

---

## Etapa 5 — Frontend: ajuste mínimo

### 5.1 — Texto del modal de éxito
**`components/WhatsAppSetupModal.tsx`** — paso 3, ajustar el copy de "48 horas":
> "Te vamos a contactar dentro de 48 horas para coordinar la verificación del número con Meta. El proceso de activación lleva entre 1 y 3 días hábiles."

### 5.2 — (Iteración 2) Panel admin
Página `/admin/whatsapp` solo para el admin, que liste solicitudes pendientes (`whatsappRequestedAt IS NOT NULL AND whatsappBotActive = false`) con form para cargar:
- `whatsappPhone` (display number)
- `whatsappPhoneNumberId`
- Toggle `whatsappBotActive = true`

Reemplaza el flujo de "te llega un email y modificás la DB a mano".

---

## Etapa 6 — Testing end-to-end

### 6.1 — Verificación del webhook
- En Meta, hacer "Verify and Save". Si el endpoint está bien, dice "Webhook verified ✓".
- Si falla: revisar logs de CF Workers (`wrangler tail`), validar el verify token.

### 6.2 — Mensaje de prueba con número de test de Meta
- Usar el sandbox de Meta para mandar mensaje al propio celular (registrado como destinatario de prueba en la consola).
- Responder a ese mensaje.
- Validar:
  - Backend recibe el POST, firma OK, forwardea a n8n
  - n8n loggea la ejecución completa hasta `Enviar a WhatsApp`
  - El cliente recibe la respuesta en su celular
  - El chat aparece en `/whatsapp` del frontend con ambos mensajes

### 6.3 — Caso multi-tenant
- Cargar 2 números reales (negocio A y B) bajo la misma WABA
- Mandar mensajes a ambos desde teléfonos distintos
- Verificar que cada uno se rutea al `businessId` correcto, que el contexto del AI no se mezcla, y que las respuestas salen desde el número correcto.

### 6.4 — Casos borde
- Mensaje no-texto (imagen, audio) → backend lo ignora (filtro `type !== 'text'`)
- Status updates (delivered/read) → mismo filtro, ignorados
- Mensaje fuera de ventana de 24h iniciado por el cliente → no aplica acá, solo afecta a salientes proactivos

---

## Etapa 7 — Operaciones y costos

### 7.1 — Ventana de servicio de 24 horas
Reglas de Meta:
- Cliente escribe → **24 hs** para responder con texto libre (gratis dentro de la cuota de servicio)
- Pasadas las 24 hs → solo se pueden mandar **templates pre-aprobados** por Meta
- Implicancia: los **recordatorios de turno proactivos** requieren template aprobado

Para recordatorios necesitará:
1. Crear template en Meta Business Manager (ej. "Recordatorio: tenés turno mañana a las {{1}} para {{2}}")
2. Esperar aprobación (24-48 hs)
3. Endpoint nuevo en backend para enviar templates (cron de recordatorios)

> NO es parte del plan inicial, pero es la próxima feature lógica.

### 7.2 — Pricing de Meta
Desde julio 2025, Meta cobra por **plantilla enviada**, no por conversación. Los mensajes de servicio (respuestas dentro de 24 hs) siguen siendo gratis. Para Argentina:
- Marketing templates: ~$0.05 USD c/u
- Utility/Authentication templates: ~$0.01-0.03 USD c/u
- Service messages (respuesta a usuario): **gratis**

Como el bot solo responde a mensajes iniciados por el cliente, los costos son cero hasta sumar recordatorios proactivos.

### 7.3 — Logging y observabilidad
- CF Workers: `wrangler tail` para ver requests en tiempo real
- n8n: `Save execution data` ya está en `all` — payload completo de cada ejecución visible
- DB: la tabla `whatsapp_messages` es el log persistente

---

## Etapa 8 — Checklist final (orden de ejecución)

| # | Tarea | Quién | Cuándo |
|---|---|---|---|
| 1 | Crear Meta Business Portfolio (verificación NO requerida) | Vos | Día 0 |
| 2 | Crear app + obtener `META_APP_SECRET` + `META_ACCESS_TOKEN` | Vos | Día 0 |
| 3 | Migración DB `whatsapp_phone_number_id` | Backend | Día 1 |
| 4 | Endpoint `/webhook/whatsapp` + bindings + wrangler secrets | Backend | Día 1 |
| 5 | Permitir PATCH de `whatsappPhoneNumberId` en businesses | Backend | Día 1 |
| 6 | Deploy backend a CF Workers | Vos | Día 1 |
| 7 | Configurar webhook en Meta + verificación OK | Vos | Día 1 |
| 8 | Crear credential `Meta WhatsApp API` en n8n | Vos | Día 1 |
| 9 | Modificar workflow n8n (trigger + variables dinámicas + nodo de envío) | n8n | Día 2 |
| 10 | Activar workflow + configurar `N8N_WHATSAPP_WEBHOOK_URL` en wrangler | Vos | Día 2 |
| 11 | Agregar 1er número real (cliente piloto) en Meta | Vos | Día 2 |
| 12 | Cargar `whatsappPhone` + `whatsappPhoneNumberId` + `whatsappBotActive=true` en DB del cliente | Vos | Día 2 |
| 13 | Test end-to-end con cliente piloto | Vos | Día 2-3 |
| 14 | Iteración: deduplicación (KV) | Backend | Día 3 |
| 15 | Iteración: copy del modal de alta | Frontend | Día 3 |
| 16 | (Futuro) Panel admin para activación rápida | Frontend | Iteración 2 |
| 17 | (Futuro) Templates para recordatorios proactivos | Backend + Meta | Iteración 2 |

---

## Decisiones de arquitectura — el por qué

| Decisión | Alternativa rechazada | Por qué |
|---|---|---|
| Backend como gateway, no Meta → n8n directo | Meta → n8n direct webhook | Centraliza verificación de firma, dedupe, y rate limiting. n8n no expone bien el `hub.challenge` en el GET. |
| Una WABA con muchos números | Una WABA por cliente | Una WABA admite 20+ números. Más simple, mismo webhook, mismo token. |
| `waitUntil` para forward async a n8n | Llamar sincrónico y esperar | Meta exige 200 OK en < 5s. AI + tools puede tardar 10s+. Sin async, Meta reintenta y duplica respuestas. |
| `phoneNumberId` viaja en cada webhook | Lookup en DB por `whatsappPhone` | Meta ya lo da — evita round-trip a DB en el hot path. |
| Session ID = `phoneNumberId + from` en memoria de AI | Session global o solo `from` | Si dos clientes de negocios distintos escriben desde el mismo número (raro pero posible), el contexto no se mezcla. |
| Enviar a WA antes de guardar respuesta en DB | Guardar primero | Prioriza UX del cliente final. La DB es secundaria al envío real. |

---

## Workflow n8n actual — referencia

- **ID:** `gyObwcM9JI7h3CTI`
- **Nombre:** `Aesthetic – Bot WhatsApp`
- **Activo:** sí
- **Trigger actual:** `@n8n/n8n-nodes-langchain.chatTrigger` (a reemplazar)
- **AI Model:** gpt-4o-mini (credential `OpenAi Model - Aesthetic`)
- **Tools:** 8 HTTP tools contra el backend, todas con `X-API-Key: aes_bot_YMU2fQXomS4ji63HAlOJ7jFF2x14oRRf` y `X-Business-Id` dinámico desde `Identificar Negocio`
- **Memoria:** `memoryBufferWindow` con `contextWindowLength: 10`

## Endpoints del backend usados por el bot

- `POST /bot/identify` (resolución `whatsappPhone → businessId`)
- `GET /clients?search=...` (búsqueda)
- `POST /clients` (alta)
- `GET /services?visible=true`
- `GET /businesses/me/hours`
- `GET /appointments/agenda/{date}`
- `POST /appointments` (reserva)
- `DELETE /appointments/{id}` (cancelación)
- `GET /appointments?clientId=...` (consulta de turnos)
- `POST /whatsapp/chats` (crear chat)
- `POST /whatsapp/chats/{id}/messages` (guardar mensaje)
- `PATCH /whatsapp/chats/{id}` (linkear cliente al chat)
