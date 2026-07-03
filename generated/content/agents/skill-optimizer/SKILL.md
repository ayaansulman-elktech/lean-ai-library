# Skill Optimizer

A full build-time MLOps platform (not a thin script) that optimizes the factory's own
skills. See **`README.md`** for the architecture, design principles, and key seams.

## Run it (offline, no keys)
```bash
pip install -e ".[dev]"
skill-opt validate-config
skill-opt calibrate-judge --offline          # judge must rank good > bad, reproducibly
skill-opt optimize-skill --offline --trials 10
skill-opt validate --offline                 # generalization on the held-out set
```
Drop `--offline` and set keys in `.env` (see `.env.example`) to run live.
An eval dataset root must be supplied — the standalone pilot data is not bundled.

## Where it fits
- **Meta layer / AI Engineers own it** — it improves skills the Sprint Engineers consume.
- The control surface is the YAMLs in `configs/`; behavior changes live there, not in code.
- Generated output (`mlruns/`, `artifacts/`, `mlflow.db`) is gitignored; only
  source / config / docs / tests are committed.

## To make it useful for THIS factory
Re-point its eval datasets + objective from the generic pilot task to the factory's real
skills (wireframing prompts, the ux-audit rubric, app-generation skills) on larger, real briefs.
