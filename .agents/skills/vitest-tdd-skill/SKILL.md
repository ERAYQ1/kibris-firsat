---
name: vitest-tdd-skill
description: Vitest TDD workflow guidelines with in-memory SQLite.
---

TDD & Testing Standards:
- Runner: Vitest (`npm test`).
- DB: `:memory:` SQLite with real migrations via `tests/helpers.ts`.
- Coverage: Happy path + Unauthorized/Forbidden + Edge case for each service function.
- Verification order: `npm run typecheck && npm run lint && npm test`.
