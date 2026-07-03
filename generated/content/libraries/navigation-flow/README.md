# Navigation / Flow Analysis MCP

An MCP server that analyzes a screen flow: builds the navigation graph and computes
clicks-to-action, navigation depth, orphan pages / dead ends, and features-per-page.

The wireframing agent calls it to grade a flow (the "A score" loop). The deterministic
logic mirrors `agents/wireframing/scripts/flow_audit.py`; exposing it as an MCP lets any
agent (Codex / Claude) call it directly.

_Server implementation: TODO._
