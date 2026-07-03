# Sprint orchestrator

Chains the factory's agents into **one app sprint** with a single go/no-go verdict. This is the
keystone that turns standalone agents into a production line.

```
charter ─▶ wireframe ─▶ UX audit (+ SUM saliency) ─▶ Apple compliance ─▶ security ─▶ report
           advisory      gate: grade + attention      hard gate: 4.3       hard gate
```

```python
from sprint_orchestrator import SprintOrchestrator
from vis_models.saliency import build_saliency

orch = SprintOrchestrator(ctx, out_dir="out", saliency=build_saliency("sum"), min_ux_grade="C")
report = orch.run({
    "app": "color-matching",
    "charter": "A weekly color-matching app.",
    "descriptor": {...},                 # for the Apple 4.3 compliance check
    "code": {"ContentView.swift": "..."},# for the security scan
    "screenshot": "screen.png",          # optional → enables the saliency check
    "cta_region": [0.25, 0.80, 0.50, 0.12],
})
report.passed     # overall go/no-go
report.summary    # "color-matching: GO — 3/3 gates passed."
```

## Stages & gates
| Stage | Agent | Blocking? | Passes when |
|---|---|---|---|
| wireframe | `wireframing` | no (advisory) | records the flow grade; agent loops toward A internally |
| ux-audit | `ux-audit` | **yes** | grade ≥ `min_ux_grade` **and** (if a screenshot + saliency model are given) predicted attention lands on the CTA |
| apple-compliance | `apple-compliance` | **yes** | not a Guideline 4.3 spam/duplicate; `passes()` |
| security-review | `security-review` | **yes** | no high-severity finding (incl. iOS: secrets, ATS, Keychain) |

**Saliency is wired into the UX gate.** Supply `screenshot` + `cta_region` and a `vis_models`
saliency model and the sprint fails if attention misses the primary action — even when the UX
grade, compliance, and security all pass. Omit them and the saliency check is skipped (the UX gate
falls back to grade only).

## Properties
- All agents share one `AgentContext`, so **spend accrues on one meter** and `report.cost_usd` is
  the whole-sprint cost.
- Every stage runs under the agent-core contract: a failing agent becomes a failed stage, never a
  crash.
- Fully **offline-testable** (mock gateway + mock saliency); writes `out/sprint-report.json`.
