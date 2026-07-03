# Wireframing agent

A real agent (`src/wireframing/`, built on `agent-core`): charter → LLM screen-spec →
generate HTML → flow-audit → revise loop until the flow grades **"A"**.

1. The LLM turns the charter into a validated screen spec (`WireframeSpec`).
2. `generate` writes one link-complete HTML page per screen (real links, no orphans).
3. `audit` grades the flow A–F against the thresholds below; if not A, the audit issues are
   fed back to the LLM and the spec is revised (bounded by `max_iterations`).
4. Stop at A; hand to human check; then to the prototype/design step.

## Run
```python
from wireframing import WireframingAgent          # see README of libraries/agent-core for the AgentContext
res = WireframingAgent(ctx, out_dir="...").run(charter_text)   # res.output["grade"] == "A"
```
Deterministic pieces are also CLI-runnable: `python -m wireframing.generate` / `python -m wireframing.audit`.

## Flow-audit thresholds (see `references/flow-rules.md`)
- clicks-to-key-action ≤ 3 · features per page ≤ 7 · max navigation depth ≤ 4 · zero orphan pages / dead links

> This loop is the fix for hallucinated flows (buttons to nowhere, unlinked pages).
