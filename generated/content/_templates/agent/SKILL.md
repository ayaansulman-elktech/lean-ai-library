# <Agent Name>

An agent is a skill **plus** a loop, memory, tools, and planning.

## Loop
- Goal: ...
- Terminates on: success | failure | budget | human interrupt.

## Memory
- Short-term: within-run scratch.
- Long-term: what persists across runs, and where.

## Tools
- the tools / `scripts/` this agent may call.

## Planning / reflection
- how it decomposes the task and self-checks before finishing.
