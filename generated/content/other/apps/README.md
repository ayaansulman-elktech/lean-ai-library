# Apps

One folder per product. An app **consumes** the shared layer (`design-system`,
`agents`, `libraries`) — it does not fork it.

## Per-app shape
- `charter.md` — the spec; feeds the wireframing agent.
- `universe/` — this app's identity: `tokens.override.json` + a `moodboard/`. The **only** design work that is per-app. Generated, not hand-drawn.
- `Sources/` — the SwiftUI code.
- `wireframe/`, `audit/` — outputs of the wireframing & ux-audit agents.

`color-matching` is Sprint 1.
