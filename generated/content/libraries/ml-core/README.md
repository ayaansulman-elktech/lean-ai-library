# ml-core

The factory's **shared LLM layer** — one tested, provider-agnostic gateway + cost meter +
tracking that every agent and tool depends on. Extracted from the skill-optimizer so there's
a single, hardened seam for all LLM calls (no per-tool reinvention).

## What it gives you
- **`build_gateway(cfg, meter, offline=…)`** → `gateway.complete(alias, messages)` across all
  providers (Claude / Codex / Grok / Kimi / DeepSeek), with retries/backoff and param-dropping.
- **`CostMeter`** — tokens / USD / latency per call, per model, with a hard budget cap.
- **`build_tracker(...)`** — MLflow wrapper (`log_params/metrics/text`), degrades to a no-op
  if MLflow isn't installed.
- **`load_env()`** — pulls provider keys from `.env`.
- **`MockGateway`** — deterministic offline backend (no keys, no spend) for tests/CI.

## Use it
```python
from ml_core import load_env, load_providers, CostMeter, build_gateway

load_env()                                   # reads .env (provider keys)
cfg   = load_providers("providers.yaml")
meter = CostMeter(budget_usd=5.0)
gw    = build_gateway(cfg, meter, offline=False)   # offline=True -> MockGateway, no keys

resp = gw.complete("deepseek", [{"role": "user", "content": "hello"}])
print(resp.text, meter.summary())
```

## Design notes
- **Decoupled:** ml-core knows nothing about skills/agents — just LLM plumbing, cost, config,
  tracking. Agents import it; it imports nothing of theirs.
- **Lazy deps:** `litellm` and `mlflow` are imported only when actually used, so `import ml_core`
  and the whole offline/mock path need only `pydantic` + `pyyaml`.
- **Pools** (`smart`/`fast`/`vision` in `providers.yaml`) are caller-side groupings; the gateway
  dispatches a single alias — pool selection is the caller's job.

## Test (offline, no keys)
```bash
cd libraries/ml-core
python -m pytest          # uses the mock gateway; no providers, no spend
```
