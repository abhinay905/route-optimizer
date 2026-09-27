Paste this as the first message to your coding agent (Antigravity / Gemini / Claude), with CONTROLLER.md at the repo root and the docs/ folder next to it:

---
You are building the Traffic-Aware Route Optimizer. Read CONTROLLER.md fully, then docs/DOC3.md fully. Follow CONTROLLER.md's Load Order, Build Steps and Agentic Coding Rules exactly.

Start at CURRENT_STEP. Work one step at a time. After each step: verify its "Done When", commit with `feat(step-N): <name>`, update the Session State block in CONTROLLER.md, and tell me in ONE line what's done and what's next — then continue to the next step without waiting for approval unless you are BLOCKED.

Deadline is tomorrow: no extra features, no libraries beyond Vite/React/TypeScript/Vitest, and never skip the tests.
---
