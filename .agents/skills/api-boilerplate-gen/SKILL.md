---
name: api-boilerplate-gen
description: Instant Next.js 15 route handler boilerplate with security guards.
---

Next.js 15 Secure Route Handler Boilerplate:
```typescript
import { NextRequest, NextResponse } from "next/navigation";
import { assertSameOrigin } from "@/lib/http";
import { rateGuard } from "@/server/rate-guard";
import { getCurrentUser } from "@/server/current-user";
import { handleApiError } from "@/lib/errors";
import { schema } from "@/lib/validation";
import { someService } from "@/server/service";
import { db } from "@/server/db";

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);
    await rateGuard(req, "mutation_key", { limit: 10, windowMs: 60_000 });
    const user = await getCurrentUser(req);
    const body = schema.parse(await req.json());
    const result = await someService(db, user, body);
    return NextResponse.json({ ok: true, data: result });
  } catch (err) {
    return handleApiError(err);
  }
}
```
