# App-Benchmark memory

A queryable store of competitor **screens, flows, onboarding, and paywalls** — the
"memory app" from the deck.

- **Sources:** screensdesign.com (screens/flows), Sensor Tower (revenue), startups.rip (what failed).
- `scripts/ingest.py` pulls and tags each screen by app / niche / screen-type into `benchmark.db`.
- **Consumers:** the wireframing agent (best-practice flows) and feature decomposition (minimal feature set per niche).

Phase 1: ingest the Color Matching competitor + 2–3 onboarding/paywall references under
`sources/color-matching/`.
