---
name: drizzle-orm-helpers
description: Drizzle ORM SQLite schema and query guidelines.
---

Drizzle ORM Guidelines:
- Schema: single source in `src/db/schema.ts`.
- Migrations: `drizzle-kit generate` -> check SQL in `drizzle/` -> apply via `migrate.mjs`.
- Queries: parameterized only. No raw SQL concatenation.
- Relations: define in `dealRelations` etc.
- Invariant: money is always `priceCents: integer`.
