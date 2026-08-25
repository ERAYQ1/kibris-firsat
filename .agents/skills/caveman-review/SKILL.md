---
name: caveman-review
description: Razor-sharp code review for security, correctness, and diffs.
---

Review diff or code:
- Format: `[file:line] [SEV: HIGH|MED|LOW] [issue]. [fix].`
- Check: Unvalidated input, IDOR, SQL injection, secrets, float money, missing error handling.
- If clean: `LGTM. [tests passed].`
