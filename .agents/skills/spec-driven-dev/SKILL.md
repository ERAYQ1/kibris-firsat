---
name: spec-driven-dev
description: 5-line specification pattern before coding complex features to prevent token waste and hallucinations.
---

Spec-Driven Development (Micro-Spec):
Before creating multi-file feature, formulate:
1. **Target:** 1-sentence feature goal.
2. **Schema:** New/modified DB fields or types.
3. **Endpoint:** Route + method + Zod schema.
4. **Service:** Function name in `src/server/*`.
5. **Tests:** Happy path + Error/IDOR test cases.

Rule: Keep spec under 15 lines. Approve/proceed directly.
