# agent-core

The factory's **shared agent framework**, built on `ml-core`. A thin, production-minded base
so every agent (wireframing, compliance, security, ux-audit) is consistent: budget-checked,
cost-metered, observable, with structured output and memory.

## What it gives you
- **`Agent`** base — subclass it and implement `_run(task) -> output`. `run()` wraps that in the
  contract: budget enforcement, step counting, cost accounting, MLflow tracking, and failures
  returned as an `AgentResult` (never an uncaught crash).
- **`Agent.llm(...)` / `Agent.llm_json(...)`** — budget-checked LLM calls; `llm_json` returns a
  parsed (optionally pydantic-validated) JSON object with corrective retry.
- **Memory** — `ShortTermMemory` (per run) + a `MemoryStore` protocol (`InMemoryStore` default;
  back it with sqlite/files in prod).
- **Tools** — a typed `ToolRegistry` of deterministic callables agents orchestrate.

## Minimal agent
```python
from ml_core import load_providers, CostMeter, build_gateway
from agent_core import Agent, AgentContext

class Summarize(Agent):
    name = "summarize"
    def _run(self, task: str) -> dict:
        return self.llm_json(
            system="You summarize. Reply JSON: {\"summary\": <=8 words}.",
            user=task,
        )

cfg = load_providers("../ml-core/providers.yaml")
ctx = AgentContext(gateway=build_gateway(cfg, m := CostMeter(budget_usd=1.0), offline=True),
                   meter=m, default_model="deepseek")
result = Summarize(ctx).run("the cat sat on the mat")
print(result.success, result.output, result.cost_usd)
```

## Design
- **Built on ml-core** — all LLM calls go through the shared gateway/meter; agent-core adds the
  loop/contract/memory/tools, nothing provider-specific.
- **Injected context** — `AgentContext` makes agents fully testable with the mock gateway (no keys).
- **Budget-first** — every LLM call checks the meter; over budget → `BudgetExceeded`, surfaced as
  a failed `AgentResult`.

## Test (offline, no keys)
```bash
cd libraries/agent-core
python -m pytest          # mock gateway via ml-core; no providers, no spend
```
