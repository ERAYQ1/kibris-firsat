# Loop Protocol (Self-Healing Execution Loop)

Mandatory loop for every code modification:

```
[Write Code] 
     ↓
[npm run typecheck] ➔ Error? ➔ Fix ➔ Retry
     ↓ (OK)
[npm run lint]      ➔ Error? ➔ Fix ➔ Retry
     ↓ (OK)
[npm test]          ➔ Error? ➔ Fix ➔ Retry
     ↓ (OK)
[Done / Green] (Max 3 iterations)
```

Rules:
- Never report task complete until all 3 pass exit 0.
- If failure persists after 3 tries: stop and report exact blocker.
- No human intervention needed during loop.
