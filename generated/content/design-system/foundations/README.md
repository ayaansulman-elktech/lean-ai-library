# Foundations

The lowest design layer — the raw decisions the tokens are derived from: color,
typography, spacing, radius, elevation, motion, accessibility, breakpoints, grids.

Foundations are *expressed* as machine-readable tokens in `../tokens/` (W3C DTCG);
this folder documents the **rationale and rules** behind them. Humans set foundations
here; agents only ever touch the derived tokens.

- `color-rules.md` — how palettes are computed (not hand-picked); harmonies, 60-30-10, WCAG.
- `typography.md` — the four type roles and the hierarchy rules.
- `spacing.md` — the 4-pt spacing scale, radius, and elevation.
- `accessibility.md` — contrast gate, hit targets, Dynamic Type, VoiceOver.
- `materials.md` — Liquid Glass translucency (the `material.*` tokens).
- (add: motion curves, breakpoints/grids when those tokens land.)

Color theory behind `color-rules.md` lives in the knowledge corpus:
`../../libraries/knowledge/color-theory/color-theory.md`.
