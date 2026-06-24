# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install       # install dependencies
bun dev           # start dev server (Vite + TanStack Start)
bun build         # production build (targets Cloudflare Workers via nitro)
bun lint          # ESLint
bun format        # Prettier
```

No test suite is configured. Verify changes by running the dev server.

## Environment

Requires a single env var:

```
APOLLO_API_KEY=...   # not currently read by the app — contacts come from n8n webhook
```

The app calls an external n8n webhook (hardcoded in `src/hooks/useApolloSearch.ts`) rather than calling the Apollo API directly.

## Architecture

**TanStack Start** (SSR-capable React meta-framework) running on top of Vite + Bun, deploying to Cloudflare Workers via nitro.

### Request flow

1. User enters a company URL → `useApolloSearch` hook (`src/hooks/useApolloSearch.ts`) fires a GET to the n8n webhook with `?url=&domain=` params.
2. n8n runs the Apollo workflow and responds with a JSON array of contacts (wrapped in `{ json: {...} }` per-item, or as bare array / `{ contacts, people, data, results }`).
3. `extractContacts()` normalises the wrapper; `normalize()` maps Spanish field names from the n8n output (`Nombre`, `Cargo`, `Email`, `LinkedIn`, `Empresa`, etc.) to the `EnrichedContact` interface (`src/types/apollo.ts`).
4. Results are held in local React state (`SearchStatus` union type) and rendered by `ResultsTable` / `SummaryCard`.

### Key files

| File | Purpose |
|---|---|
| `src/hooks/useApolloSearch.ts` | All data-fetching logic, n8n response parsing, state machine |
| `src/types/apollo.ts` | `EnrichedContact`, `ApolloContact`, `SearchStatus` union — the shared contract |
| `src/routes/index.tsx` | Single page: wires form + hook + result components |
| `src/routes/__root.tsx` | App shell: `QueryClientProvider`, global head tags, error/404 boundaries |
| `src/router.tsx` | Creates router with `QueryClient` in context |
| `src/server.ts` | Cloudflare Worker entry; wraps SSR handler; normalises h3's swallowed 500 errors |
| `src/lib/config.server.ts` | Server-only env reads — **always read `process.env` inside a function, not at module scope** (Cloudflare Workers bind env at request time) |
| `src/lib/api/example.functions.ts` | Template for `createServerFn` (TanStack Start's server functions) |

### Routing

File-based via TanStack Router. `src/routeTree.gen.ts` is **auto-generated** — never edit by hand. Dynamic segments use bare `$` (e.g. `$id.tsx`), not curly braces. Only one route exists today (`index.tsx`).

### Styling

Tailwind CSS v4 (no `tailwind.config.js` — configured via CSS). All UI primitives are in `src/components/ui/` (shadcn/ui pattern). Custom components live directly in `src/components/`.

### Server functions

Use `createServerFn` from `@tanstack/react-start` for any server-only logic (see `src/lib/api/example.functions.ts`). Put truly server-only helpers in `.server.ts` files so Vite tree-shakes them from the client bundle. Never use `VITE_` prefix for secrets.

### n8n field mapping

The n8n workflow returns contacts with Spanish field names. The `normalize()` function in `useApolloSearch.ts` handles both Spanish (`Nombre`, `Cargo`, `Email`, `LinkedIn`, `Ciudad`, `Empresa`, `Dominio`, `Teléfono`) and English Apollo field names as a fallback.
