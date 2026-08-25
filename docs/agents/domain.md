# Domain Docs & Architecture Rules

- **Layout**: Single-context (`src/`, `src/db/schema.ts`, `src/server/`, `src/lib/`, `src/app/`, `src/components/`)
- **Single Source of Truth**: `src/db/schema.ts` for database entities, `src/server/` for service business logic.
- **Rules**:
  - Currency values are always integers in minor units (kuruş/pence/cents).
  - Mutations must verify session authentication (`requireUser`/`requireAdmin`).
  - Strict server-side Zod validation on every input payload.
