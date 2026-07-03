# UX audit

A real agent (`src/ux_audit/`, on `agent-core`): scores a screen 0-5 on the eight HIG-anchored
checklist criteria (`references/ux-checklist.md`, incl. `hig` conformance) and grades A-F.

```python
from ux_audit import UXAuditAgent
res = UXAuditAgent(ctx).run(screen_html_or_description)   # res.output["grade"], ["scores"], ["average"]
```

**Saliency attention check (SUM) — live.** Pass a `vis_models` saliency model plus a rendered
screenshot to verify predicted attention peaks on the primary action:

```python
from vis_models.saliency import build_saliency
agent = UXAuditAgent(ctx, saliency=build_saliency("sum"))   # mock fallback when weights absent
res = agent.run({"screen": html, "screenshot": "screen.png", "cta_region": [0.25, 0.80, 0.50, 0.12]})
res.output["saliency"]   # {status, passes, primary_attention, focal_point, ...}
```

SUM handles **stills**; the real weights are fetched into `libraries/ai-farm/raw/SUM` (offline a
deterministic mock is used). **ViNet (onboarding video) stays deferred.**
