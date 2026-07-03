# SwiftUI generation agent

The **prototype** step of the design-automation pipeline (deck p.60 step 2): apply the design
system onto the wireframe. LLM writes the view; a deterministic checker gates it and, on failure,
re-asks once with the issues.

```python
from swiftui_gen import SwiftUIGenAgent
res = SwiftUIGenAgent(ctx, out_dir="apps/color-matching/Sources").run({
    "spec": wireframe_result["spec"],      # {screens: [...]} from the wireframing agent
    "tokens": token_names,                  # from design-system/tokens/build/Tokens.swift
    "app": "ColorMatching",
    "copy": {"onboarding": {...}},          # optional micro-copy per screen (from microcopy agent)
})
res.output["files"]        # [{screen_id, view, filename, swift, passed, issues}]
res.output["all_passed"]   # gate
```

**Hard rule:** screens must style **only** with `Tokens.*` — hardcoded colors/fonts/sizes fail the
check (they'd break the per-app universe mechanism). Generation is **per screen** so each can be
audited and adjusted independently. See `references/component-map.md` for the element→SwiftUI map.
