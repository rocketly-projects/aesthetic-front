# Plan: aesthetic. — Frontend Implementation

## Context

Implementing the "aesthetic." salon management system frontend from a Claude Design handoff.
Design is a wellness/spa-mood app for solo hairstylists with a rosé/greige palette.
Source: 9 HTML prototype pages extracted from the design bundle.

---

## Design Tokens

From `shared/tokens.css`:

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#f4f1ee` | warm off-white, main background |
| `--bg-2` | `#ebe6e1` | card / sunken areas |
| `--surface` | `#ffffff` | card foreground |
| `--ink` | `#2d2a26` | primary text |
| `--ink-2` | `#5a544e` | secondary text |
| `--ink-3` | `#8a827a` | muted / labels |
| `--line` | `#e2dad2` | borders |
| `--accent` | `#9b7e7e` | deep rose / wine |
| `--accent-soft` | `#d4a5a5` | powder rose |
| `--accent-pale` | `#ead8d0` | pale rose |
| `--ok` | `#6f8b6e` | sage green (confirmed) |
| `--warn` | `#c9a86a` | warm gold (pending) |
| `--err` | `#b87575` | dusty rose-red (cancelled) |

Typography: Geist (already in project) + Geist Mono for data/timestamps.

---

## File Structure to Create

```
app/
  (auth)/
    layout.tsx              ← minimal, no sidebar
    login/
      page.tsx              ← split panel login
  (app)/
    layout.tsx              ← AppShell (Sidebar + Topbar)
    dashboard/page.tsx      ← KPIs + today's timeline + activity
    agenda/page.tsx         ← Google Calendar week view
    turnos/page.tsx         ← CRUD table + modal
    clientes/page.tsx       ← split list + profile card
    whatsapp/page.tsx       ← 3-column chat interface
    servicios/page.tsx      ← service card grid
    negocio/page.tsx        ← business settings + schedule
    config/page.tsx         ← appearance + notifications + plan
  globals.css               ← design tokens + base styles
  layout.tsx                ← root (Geist fonts)
  page.tsx                  ← redirect to /login

components/
  Sidebar.tsx               ← nav, brand, user footer
  Topbar.tsx                ← title, subtitle, actions slot
  AppShell.tsx              ← 240px sidebar + main grid
  Chip.tsx                  ← ok/warn/err/info/neutral/rose variants
  KPI.tsx                   ← metric card (label + value + delta)
  Modal.tsx                 ← backdrop + centered dialog

lib/
  data.ts                   ← mock data (SERVICES, CLIENTS, ALL_APPTS, CHATS)
  types.ts                  ← TypeScript interfaces
```

---

## Implementation Steps

### Step 1 — `app/globals.css`
Add all CSS custom properties as design tokens:
- Color palette, semantic colors, radius tokens, spacing scale, shadow scale
- Base styles for `.app` grid, `.sidebar`, `.main`, `.topbar`, `.content`
- Component base styles: `.btn`, `.card`, `.chip`, `.kpi`, `.tbl`, `.input`, `.avatar`
- Keep `@import "tailwindcss"` at top (Tailwind 4 syntax)

### Step 2 — `app/layout.tsx`
- Set `html` and `body` to `height: 100%`
- Expose Geist as `--font-sans`, Geist Mono as `--font-mono`

### Step 3 — `lib/types.ts` + `lib/data.ts`
Types: `Service`, `Client`, `Appointment`, `Chat`, `Message`

Mock data (from design's `shared/data.jsx`):
- **SERVICES**: 7 services (Corte, Coloración, Brushing, Mechas, Keratina, Corte+barba, Manicura)
- **CLIENTS**: 10 clients with phone, visit count, notes
- **ALL_APPTS**: 15 appointments across the week
- **CHATS**: 6 WhatsApp conversations with bot/me/them messages

### Step 4 — Components
- **`AppShell`**: `div.app` → 240px sidebar + `main.main` (topbar + `.content`)
- **`Sidebar`**: brand mark, 2 nav sections, active state, footer with avatar
- **`Topbar`**: h1 title, subtitle, right-side `actions` slot
- **`Chip`**: variants via className map to `chip-ok / chip-warn / chip-err / chip-info / chip-neutral / chip-rose`
- **`KPI`**: `.kpi` card with `.lbl`, `.val`, `.delta`
- **`Modal`**: fixed backdrop with blur + centered `.modal` panel

### Step 5 — Pages

#### `/login`
- Grid `1fr 1.1fr`: left form panel + right gradient panel
- Brand mark, heading "Bienvenida de *vuelta*.", email/password inputs, submit
- Right: quote block + social proof badges

#### `/dashboard`
- Greeting: "Buenos días, **Marina**." (display font, italic accent on "buenos días")
- 4 KPIs: Turnos hoy (6), Ingresos del día ($28.500), Semana actual (18), Clientes nuevos (2)
- 2-col grid `1.5fr 1fr`:
  - Left card: today's appointment timeline with colored stripe cards
  - Right card: recent activity feed

#### `/agenda` — `"use client"`
- Week toolbar: prev/next arrows, "4–10 mayo 2026" label, "Hoy" pill, Día/Semana/Mes tabs
- Legend (Confirmado/Pendiente/Cancelado)
- Calendar grid: `60px + repeat(7, 1fr)`, hour rows at 56px each
- Today column highlighted, "now line" at current position
- Appointment blocks: `position: absolute`, top/height calculated from time+duration

#### `/turnos` — `"use client"`
- Segmented control: Todos/Confirmados/Pendientes/Completados/Cancelados (with counts)
- Pill filters: week date range, client
- Table: fecha (mono) | hora (mono) | cliente (avatar+name) | servicio | duración | precio | estado chip | actions
- Row hover reveals edit/more buttons
- "Nuevo turno" modal: client select, service select, date, time, notes textarea

#### `/clientes` — `"use client"`
- Grid `360px 1fr`:
  - Left: search input + alphabetical client list with visit count
  - Active row: `--accent-pale` bg + 3px left accent border
  - Right profile: 64px avatar, name, stats row (4 cells), notes card, history table

#### `/whatsapp` — `"use client"`
- Grid `340px 1fr 320px`:
  - Left: filter tabs (Todos/Bot/Yo), chat list with unread dot badges
  - Center: conversation header, message bubbles (them/me/bot), bot messages with dashed rose border
  - Right: client info + upcoming appointment

#### `/servicios`
- Summary row: 4 KPI cards
- 3-col service grid: colored swatch top stripe, name, duration+price meta, footer
- Dashed "+ Agregar servicio" card

#### `/negocio` — `"use client"`
- Grid `1.2fr 1fr`:
  - Left: logo upload row, business data form, day schedule with on/off toggles + time inputs
  - Right: bot preview card (sample WhatsApp response), map placeholder, social links form

#### `/config`
- Sections: Apariencia, Notificaciones (toggle rows), Plan Pro (upgrade CTA card)

---

## Technical Notes

- **Tailwind v4**: Use `@theme` block for token-to-utility mapping; no `tailwind.config.js`
- **`"use client"`**: Required on agenda, turnos, clientes, whatsapp, negocio (useState)
- **Icons**: Inline SVG or lucide-react — check if lucide is available, otherwise inline SVGs
- **Routing**: App Router with `(auth)` and `(app)` route groups for separate layouts
- **Next.js 16**: Read `node_modules/next/dist/docs/` before writing routing code

---

## Verification

1. `npm run dev` — no TypeScript or build errors
2. Visit each of the 9 routes, compare against HTML prototypes visually
3. Sidebar nav highlights correct active item on each page
4. Interactive: turnos modal opens/closes, clientes list selection updates profile, agenda blocks position correctly
