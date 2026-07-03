# Microcopy agent

Step 4 of the design-automation pipeline (deck p.60): the words. LLM writes concise, benefit-led
copy per screen slot; a deterministic checker enforces the HIG rules (see `references/voice-and-tone.md`)
and re-asks once on failure.

```python
from microcopy import MicrocopyAgent
res = MicrocopyAgent(ctx).run({
    "spec": wireframe_result["spec"],     # {screens: [...]} from the wireframing agent
    "persona": "…", "voice": "warm, clear",
    "app": "ColorMatching",
})
res.output["copy"]         # {screen_id: {title, elements{}, actions{}, links{}}} -> feed swiftui-gen
res.output["all_passed"]   # gate
```

**Rules enforced:** title ≤ 40 chars; button labels 1–4 words, ≤ 22 chars, no trailing period,
never ALL CAPS; every wireframe element gets copy. Generation is **per screen** so each can be
reviewed and adjusted independently.
