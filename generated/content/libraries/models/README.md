# Models library (`vis_models`)

The factory's **vision-model layer**. Two parts:

- **`catalog.json`** — a human-readable discovery view over the AI-farm registry: model name,
  task, status, license, and the niche(s) it serves. It stores **no weights** (those live in
  `../ai-farm`).
- **`src/vis_models/`** — the importable adapters Sprint Engineers and agents call. Today this is
  `saliency`.

## Saliency — "does attention land on the primary action?"

`vis_models.saliency` predicts a human-attention heatmap for a screen and checks whether the
predicted gaze peaks on the primary call-to-action. The UX-audit agent consumes it.

**Backend: SUM** ([Arhosseini77/SUM](https://github.com/Arhosseini77/SUM)) — *Saliency Unification
through Mamba*. Chosen over [ViNet](https://github.com/samyak0210/ViNet) because the audit scores
**still screens**, and SUM is an image model with a UI/web-page condition tuned for interface
imagery. ViNet is video-only and stays deferred for onboarding clips.

### The seam (mirrors `ml_core`'s gateway)
| Piece | Role |
|---|---|
| `SaliencyModel` (Protocol) | `predict(image) -> SaliencyMap` |
| `SaliencyMap` | a small normalized grid (not a pixel array) — keeps metrics dependency-free |
| `MockSaliencyModel` | deterministic, offline, **no torch/weights** — used in CI |
| `SUMSaliencyModel` | real SUM; lazy `torch` import; runs in the **AI Farm** |
| `analyze(map, cta_region)` | → `SaliencyReport` (focal point, dispersion, CTA attention, pass/fail) |
| `build_saliency(backend, offline=...)` | picks SUM if available, else transparently the mock |

```python
from vis_models.saliency import analyze, build_saliency, Region

sal = build_saliency("sum")                       # real SUM in the farm; mock fallback elsewhere
report = analyze(sal.predict("screen.png"),
                 Region(0.25, 0.80, 0.50, 0.12))   # primary button, normalized coords
report.passes            # True if the CTA captures >= threshold of predicted attention
```

### Running the real SUM (AI Farm)
1. Fetch the SUM repo + checkpoint into `../ai-farm/raw/SUM/` (per `ai-farm/registry.json`).
2. `pip install -e ".[sum]"` (pulls `torch`, `numpy`).
3. `build_saliency("sum")` now returns the real model; `is_available()` gates the fallback.

Core (`mock` + metrics) is **dependency-free and tested offline**; only the SUM backend needs
the heavy extras, so CI stays fast and green without weights.
