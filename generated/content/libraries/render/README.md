# rendering

Turns a screen into an **image + the primary-action region**, so the UX-audit's SUM saliency
check can run on a *real* screen instead of a screenshot you supply by hand.

Mirrors the `vis_models` saliency seam: **protocol + real backend + offline mock + factory**.

| Piece | Role |
|---|---|
| `derive_cta_region(html)` | deterministic CTA box from the wireframe markup — **no browser** |
| `MockRenderer` | offline: writes an SVG sketch + the derived region (CI path, dependency-free) |
| `PlaywrightRenderer` | real: headless Chromium → PNG + the actual button bounding box (dev/farm) |
| `build_renderer(backend, offline=…)` | Playwright when available, else the mock |

```python
from rendering import build_renderer
r = build_renderer("playwright")                 # mock fallback if Playwright is absent
res = r.render(wireframe_html, "out/screen.png")
res.image_path, res.cta_region                   # feed straight into ux-audit's saliency check
```

Wireframes from the wireframing agent use a known structure (`button.action` / `a.nav`), so the
CTA box is reliable offline. **Real PNGs** need `pip install "rendering[browser]"` +
`playwright install chromium` (dev/farm); CI stays on the dependency-free mock.
