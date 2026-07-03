# AI Farm

Productionized models, each packaged as an MCP-compatible capability.

## Raw → Ready

- `raw/<model>/` — the model + a wrapper + a one-page card (inputs/outputs/license).
- `ready/<model>` — the Apple-native build (CoreML / MLX) when an app needs it on-device.

Promote `raw → ready` only when an app actually needs it on device.

## registry.json

The single index agents read to discover capabilities. One entry per model:

```json
{ "name": "", "task": "", "status": "raw | ready", "source": "", "license": "", "mcp": "" }
```

## Phase-1 scope

Only `skin-tone-cv` goes fully Raw→Ready (the reference example). `SUM` / `ViNet`
stay raw (used by `ux-audit` on host). Everything else is added on demand — do not
pre-fill the shelf.
