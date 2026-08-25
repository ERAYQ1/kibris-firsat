---
name: nextjs-patterns
description: Next.js 15 App Router and React 19 standards.
---

Next.js 15 Patterns:
- Thin Route Handlers: `src/app/api/**/route.ts` only parse + call `src/server/*`.
- Server Components by default. Use `'use client'` only for interactive state/hooks.
- Headers/Cookies: read in Server Components/Route Handlers via `next/headers`.
- Data Fetching: direct service layer call in Server Components, no internal HTTP fetch.
