# CONTROLLER.md — Traffic-Aware Route Optimizer

## Session State  (agent: update after every step)
```
SESSION_STATUS:  ACTIVE            # ACTIVE | BLOCKED | PAUSED | DONE
CURRENT_STEP:    8 — Stepper actions + StepperPanel + map step highlights
LAST_COMPLETED:  Step 7 — data/scenarios.ts + presets, explainRouteChange + ExplainerPanel
PAUSED_AT:       —
```

## Load Order
1. Read this file fully.
2. Read `docs/DOC3.md` fully — it is the build spec (interfaces, data, algorithm, tiers).
3. Read `docs/DOC1.md` / `docs/DOC2.md` **only** the section needed to answer a specific question.
4. Read `docs/vibe-antipatterns.md` / `docs/prompt-patterns.md` **only** via the Triggers table.
5. Deadline is tomorrow. Do not ask questions the docs answer; decide and note it in one line.

## State Machine
- **ACTIVE** — work only on CURRENT_STEP. When its Done When holds → commit → update Session State → next step.
- **BLOCKED** — stop. Report in ≤5 lines: goal, exact error/ambiguity, doc section checked, what you need. No workarounds.
- **PAUSED** — set PAUSED_AT to the exact sub-task; list uncommitted changes; stop.
- **RESUMING** — verify LAST_COMPLETED's Done When in the code (run tests / app) before trusting it, then continue.
- **DONE** — all steps through Step 8 complete (Step 9 optional), `npm run build` passes.

## Build Steps  (tiers from DOC3 §3.0 — never start a higher tier with a lower one broken)

| # | Step | Tier | Done When |
|---|---|---|---|
| 1 | Scaffold: `npm create vite@latest . -- --template react-ts`, add Vitest, delete boilerplate | T1 | `npm run dev` shows blank app; `npx vitest run` runs (0 tests OK) |
| 2 | `domain/graph/{types,weights,buildGraph}.ts` + `data/network.ts` (exact data from DOC3 §3.6) | T1 | Data-sanity test passes (endpoints exist, base minutes positive ints) |
| 3 | `domain/routing/minHeap.ts` + `minHeap.test.ts` | T1 | Heap tests pass |
| 4 | `domain/routing/dijkstra.ts` (generator + wrapper per DOC3 §3.3) + `reachability.ts` + tests | T1 | normal=11, rush=12, accident=20, cutoff=unreachable, same-location, stepper==instant — all pass |
| 5 | `simulation/{state,reducer}.ts` with single `recompute()` | T1 | Reducer compiles; setCondition on MKT–HOSP severe yields COL→STN→HOSP |
| 6 | `ui/`: CityMap, RoadConditionPicker, ControlPanel, RoutePanel, conditionStyle, styles.css | T1 | In browser: pick COL→HOSP, set MKT–HOSP severe, route switches to Station; close 3 airport roads → unreachable msg |
| 7 | `data/scenarios.ts` + preset buttons; `explainRouteChange.ts` + ExplainerPanel | T2 | All 4 presets give DOC3 §3.6 expected results; rush shows `5 + 24 = 29` vs `12`, cause MKT–HOSP |
| 8 | Stepper actions + StepperPanel + map step highlights | T3 | Stepping normal preset visits nodes in dist order; final step equals RoutePanel result; Prev/Next work |
| 9 | *(optional)* Live mode: seeded PRNG (mulberry32) in `domain/`, timer in UI, `randomTrafficTick` action | T4 | Same seed → same sequence of changes twice; toggle off stops ticks |
| 10 | Polish: projector-size labels, legend, `npm run build` | — | Build passes; app readable at 1280×720 |

Commit after every step: `feat(step-N): <step name>`.

## Agentic Coding Rules

ALWAYS:
- Keep all weight math in `src/domain/graph/weights.ts` (`effectiveMinutes`) — the only place multipliers appear.
- Keep `src/domain/**` pure TypeScript: no `react`, no DOM, no `window`, no `Math.random()` (use the seeded PRNG).
- Compute routes only via `recompute()` in `src/simulation/reducer.ts`; components only `dispatch`.
- Make `dijkstra()` consume `dijkstraSteps()` — one code path for instant and step mode.
- Copy snapshots (`{...dist}`, `[...visited]`, queue arrays) inside yielded steps.
- Use the exact types, function names and data from DOC3 (`LocationId`, `RoadId`, `RouteResult`, `DijkstraStep`, `COL/MKT/STN/HOSP…`).
- Use `switch (result.status)` exhaustively on `RouteResult`.
- Run `npx vitest run` before marking any step from 2 onward done.

NEVER:
- Never install graph, heap, priority-queue, or map libraries (no cytoscape, react-flow, leaflet, d3-force, js-priority-queue, heap-js). Heap and Dijkstra are hand-written — graded requirement.
- Never add a backend, database, real traffic API, router, or Next.js.
- Never put multipliers, Dijkstra calls, or path logic in any `.tsx` file.
- Never represent a closed road as `Infinity` — skip the edge in `buildGraph`.
- Never change network/scenario numbers in `data/` — tests and the demo script depend on them.
- Never start Step 9 before Steps 1–8 are committed.

## Triggers

| When you notice… | Read immediately |
|---|---|
| You're adding something not in the current step (live mode early, map tiles, drag-to-edit nodes, dark mode, animations beyond step highlights) | AP-01 → PP-04 (log idea as future scope via PP-05) |
| You're about to `npm install` anything other than vitest / @testing-library | AP-07 → PP-09 |
| Multiplier math, `dijkstra(`, or path building appears in `src/ui/` or `App.tsx` | AP-06 → PP-07 |
| A type or function signature differs from DOC3 §3.2–3.4 | AP-09 → PP-08 |
| About to mark a step done without running tests / checking the browser | AP-14, AP-22 → PP-20 |
| About to ask the user something DOC3 already specifies | AP-17 → PP-11 |
| A bug appears | PP-12 before any fix |
| Session about to end / context filling | PP-14 |
| Resuming after any break | PP-02 |
| Stuck after 3+ attempts on same problem | AP-13 → PP-13 |
| Two docs seem to conflict (DOC3 wins over DOC1/DOC2) | PP-17 |
| Session completely off track | PP-18 |

## Quick Reference
```
docs/DOC1.md  → Features F1–F12 (MVP), S5 live mode; presentation-driven priorities
docs/DOC2.md  → Stack: Vite + React + TS, frontend-only, hand-SVG map, Vitest
docs/DOC3.md  → Modules: domain/graph, domain/routing, simulation, ui, data; tiers T1–T4;
                network + 4 scenarios with expected results (§3.6)
CONTROLLER.md → 10 steps. Current: see Session State
docs/vibe-antipatterns.md, docs/prompt-patterns.md → via Triggers only
```
