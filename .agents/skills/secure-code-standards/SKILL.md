---
name: secure-code-standards
description: Defensive security patterns for OWASP, IDOR, CSRF, and data integrity.
---

Defensive Security Standards:
- Validation: Zod `.strict()` on every external input.
- Auth: Never trust client userId/role/status. Derive from session.
- CSRF: `assertSameOrigin(req)` on all mutations.
- Rate Limiting: Apply `rateGuard` to auth/deal mutations.
- IDOR: Check ownership in `src/server/*.ts` before edit/delete.
- File Upload: Validate MIME magic-bytes (JPEG/PNG/WebP), max 5 MB, UUID filenames.
