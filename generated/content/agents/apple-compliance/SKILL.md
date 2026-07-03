# Apple Compliance gate

The existential gate for a high-volume app factory: **Guideline 4.3 (Spam)** bans near-duplicate
apps that differ only cosmetically. This agent (`src/apple_compliance/`, on `agent-core`) reviews
an app descriptor and returns a structured `ComplianceReport`.

```python
from apple_compliance import AppleComplianceAgent
res = AppleComplianceAgent(ctx).run({"name": ..., "value": ..., "features": [...], "differs_from_siblings": ...})
if not res.output["passes"]:   # gate: block submission
    ...
```

- `verdict`: pass | flag | fail · `risk_level`: low | medium | high · `findings[]` with guideline refs.
- `passes()` blocks on a `fail` or any `high` overall risk.
- Guidelines encoded in the prompt; canonical source: developer.apple.com/app-store/review/guidelines (see `references/guidelines.md`).
