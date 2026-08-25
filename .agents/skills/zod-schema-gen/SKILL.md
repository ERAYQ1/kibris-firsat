---
name: zod-schema-gen
description: Fast Zod strict schema and inferred TypeScript type patterns.
---

Zod Schema Standards:
- Always `.strict()` to reject unallowed payload fields.
- String trim & bounds: `z.string().trim().min(1).max(120)`.
- Money in cents: `z.number().int().positive()`.
- Currency enum: `z.enum(["TRY", "GBP", "EUR"])`.
- Inferred Types: `export type InputType = z.infer<typeof schema>;`
