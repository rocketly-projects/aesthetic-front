# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint (Next.js + TypeScript rules)
```

No test suite is configured. The backend dev server runs at `http://localhost:8787` (Cloudflare Workers via Hono); set `NEXT_PUBLIC_API_URL` in `.env` to point elsewhere.

## Architecture

**aesthetic.** is a SaaS management platform for hair salons and beauty studios. It has three distinct surfaces:

### Route groups

| Group | Path | Purpose |
|---|---|---|
| `(auth)` | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/planes` | Unauthenticated entry |
| `(app)` | `/dashboard`, `/agenda`, `/turnos`, `/clientes`, `/servicios`, `/negocio`, `/config`, `/whatsapp` | Authenticated owner/staff panel |
| `[slug]` | `/:slug` | Public booking page for end clients (no auth) |
| — | `/billing/success`, `/reserva/*`, `/privacidad` | Billing callbacks and post-booking result pages |

### Auth model

- JWT is stored in a cookie (`token`) via `js-cookie`. User metadata (name, email, role, businessName) goes in `localStorage` (`aesthetic_user`).
- Route protection lives in `proxy.ts` (not `middleware.ts`) — it exports a `proxy` function and `config` matcher that Next.js picks up as middleware.
- `lib/api/client.ts` → `apiFetch` auto-clears the cookie and redirects to `/login` on any 401 response, **unless** there was no token to begin with (so login-form 401s don't redirect).

### API + data layer

```
lib/api/client.ts          # apiFetch() + ApiError class
lib/api/{domain}.ts        # One file per resource (auth, appointments, clients, services, billing, business, whatsapp, notifications, public)
hooks/use{Domain}.ts       # TanStack Query wrappers — useQuery / useMutation + toast.success/error
```

Each `hooks/` file exports a `{domain}Keys` object for cache invalidation. Mutations invalidate related queries on success and call `toast.success`. Errors surface via `toast.error` with the `ApiError.message` string.

### Billing gate

`components/PlanGate.tsx` wraps the entire `(app)` subtree. It:
- Lets through when `planStatus === "active"` or during an active trial (shows a `TrialBanner`).
- Blocks with a plan-selection screen when the plan is expired, cancelled, or past-due.

### UI shell

`components/AppShell.tsx` is the standard page wrapper for every `(app)` route. Pass `active`, `title`, `subtitle`, and optionally `actions`. It handles the desktop sidebar/collapsed state and the mobile off-canvas drawer.

### Design system

Tailwind v4 — theme tokens defined in `app/globals.css` under `@theme`. Key values:

- **Colors**: `bg` / `bg-2` (sage backgrounds), `surface` (white), `ink` / `ink-2` / `ink-3` (text), `accent` (sage green `#7a8b6e`), semantic `ok` / `warn` / `err` / `info`.
- **Fonts**: `font-sans` (Inter), `font-display` (DM Sans), `font-mono` (Space Grotesk).
- **Motion**: `--dur-fast/base/slow` + `--ease-out` / `--ease-spring` custom properties.
- **Layout**: `--sidebar-w` (15rem desktop, 0 mobile), `--topbar-h`.

### Backend

Hono on Cloudflare Workers + PostgreSQL via Drizzle ORM. See `docs/Context-Back.md` for the full API contract. The backend defaults to port 8787 in dev.
