# Skill Optimizer

Build-time MLOps platform that optimizes `SKILL.md` files as ML artifacts. Optuna proposes a
Skill configuration → an Agent LLM proposes a variation → a Generator LLM writes the candidate
Skill → the Skill is run to produce an output → a Judge panel scores it → MLflow logs
everything → repeat while `score < goal` → validate on held-out then frozen datasets.

## Quickstart (offline, no API keys)

```bash
pip install -e ".[dev]"

# All commands run with the mock provider — no keys needed.
skill-opt validate-config                       # load + check the 5 YAMLs
skill-opt calibrate-judge --offline             # judge ranks good > bad
skill-opt run --offline --no-track              # one candidate end-to-end
skill-opt optimize-skill --offline --trials 10  # search -> artifacts/best_SKILL.md
skill-opt validate --offline                    # generalization on D_test
skill-opt validate --offline --final            # frozen D_guard final validation
skill-opt portability --offline                 # score preservation across models
skill-opt compress --offline                    # shrink tokens, keep the score
```

To go live: put API keys in `.env` (see `.env.example`) and drop `--offline`. The configs
ship with real model IDs already.

**Render-based scoring** (default) judges the *rendered* page, not raw HTML. It needs the
browser engine — install once:

```bash
pip install -e ".[render]"
python -m playwright install chromium
```

Without it the runner falls back to judging HTML text (set `execution.mode: static_only` in
`configs/output-metrics.yaml` to force that).

**Watch a run live:** start the dashboard, then run optimize *with* tracking (no `--no-track`):

```bash
mlflow ui --backend-store-uri sqlite:///mlflow.db   # open http://127.0.0.1:5000
skill-opt optimize-skill --trials 30                 # watch trials appear
```

## Layout

```
configs/      the 4 core YAMLs (+ providers.yaml) — the control surface
src/skill_optimizer/
  config/     pydantic models that load + validate the YAMLs
  providers/  LiteLLM gateway, generator/judge pools, cost meter, mock provider
  datasets/   D_wm / D_test / D_guard loaders
  genome/     genome <-> SKILL.md assembly
  generator/  Generator LLM -> candidate SKILL.md
  runner/     execute a Skill -> output
  evaluation/ metrics, judge panel, Skill Score
  tracking/   MLflow wrapper + lineage
  cli.py
tests/        unit + integration (mock providers; no real spend in CI)
```

## Design principles

- **Evaluation-first.** The judge is the only real risk — build and *calibrate* it before the optimizer exists.
- **Vertical slices, not horizontal layers.** Every slice runs end-to-end.
- **Config is the control surface.** Behaviour changes live in the YAMLs, not in code.
- **Reproducibility by construction.** Every candidate links genome + Optuna trial ID + MLflow run ID + outputs + scores.
- **Cost visible from line one.** Tokens/$ are metered per call and aggregated per trial, under a hard budget cap.

## Key seams

Everything depends on three interfaces, so providers, judges, and runners are swappable
and mockable in tests without touching the optimization loop:

- `providers.LLMGateway.complete(pool, messages) -> Response{text, tokens, cost}`
- `runner.Runner.run(skill) -> Output{artifacts, render?}`
- `evaluation.Judge.score(skill, output) -> Scores`
