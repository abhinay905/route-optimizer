# DOC 2 — System & Technical Architecture
**Project:** Traffic-Aware Route Optimizer
**Builds on:** DOC1.md (F1–F12)
**Status:** Draft — awaiting sign-off before DOC 3

> Context that drives every decision below: solo build · browser-only simulation · Dijkstra + heap written by hand · live presentation is graded.
> **Data source:** simulated network + user/seeded-random traffic changes — no real traffic API (per project scope). "Real-time" = instant recomputation in the browser on every change.
> `[ASSUMPTION: deadline is a few weeks away — scope below fits ~2–3 weeks of evening work. Tell me the date and DOC 4 will be sized to it.]`

---

## 2.0 — Context Snapshot

```
Frontend-only single-page app (Vite + React + TypeScript), no backend, no database.
Pure TypeScript "algorithm core" (graph, heap, Dijkstra, stepper, explainer) with zero
framework imports, driven by a React UI that renders the map as hand-drawn SVG.
Tested with Vitest. Deployed as static files (Vercel / GitHub Pages) + runs offline for the demo.
```

### Non-functional requirements (derived from "presentation is graded")

| NFR | Target | Why |
|---|---|---|
| Recompute latency | < 50 ms after any click | Route change must feel instant on stage. ~20 nodes → Dijkstra is microseconds; trivially met. |
| Determinism | Same input → same route, always | Rehearsed demo must never surprise you. Tie-breaking is defined (see 2.3). |
| Offline | Works with no internet | College Wi-Fi during presentations is unreliable. Vite bundles everything; no CDN, no API. |
| Projector readability | Readable from the back row | Large labels, thick edges, high contrast. |
| Colour-blind safe | Traffic readable without colour | Encode level by colour **and** edge thickness / dash pattern. |

---

## 2.1 — Architecture Overview

```
ARCHITECTURE STYLE: Layered, frontend-only monolith (Clean Architecture dependency rule)
RATIONALE: Solo, small, no server state → Monolith-First Rule applies. But the algorithm
           is the thing being graded, so it gets its own framework-free inner layer that
           can be unit-tested and shown in the presentation independently of the UI.

LAYER DIAGRAM (dependencies point DOWN only):

  [Presentation]   React components + SVG map         | renders state, dispatches actions
        ↓
  [Application]    Simulation state (useReducer)      | "what happens when user clicks X"
        ↓
  [Domain]         Graph, weights, MinHeap, Dijkstra, | pure TypeScript, no React,
                   stepper, reachability, explainer   | no DOM — the discrete-math core
        ↑
  [Data]           Network + scenario definitions     | plain typed constants (JSON-like)
                   (consumed by Application, typed by Domain)

  [Infrastructure] Vite build → static files → Vercel / GitHub Pages / local laptop
```

**The one rule that matters most:** nothing in `domain/` imports from `ui/`, `simulation/` or React. If you can't run the Dijkstra tests without a browser, the rule has been broken.

---

## 2.2 — Technology Stack Decisions

**Decision: App type**
- Chosen: Single-page web app, no backend
- Reason: Everything is a simulation over ~20 nodes; no data to persist or share. A server would add deploy/debug cost with zero benefit.
- Alternatives: Express/Next.js API doing Dijkstra server-side — rejected: network latency on every click, extra failure point during demo, nothing gained. Desktop app (Python/Tkinter, Java Swing) — rejected: weaker visuals, harder to share a link with evaluators.
- Trade-offs accepted: No saving scenarios across devices (not needed).
- Future migration risk: Low — domain layer is pure TS and could be moved to a server unchanged.

**Decision: Language**
- Chosen: TypeScript (strict)
- Reason: The graph model has several shapes that are easy to confuse (node id vs road id, closed vs weighted edge, step event types). Types catch those at compile time. Also directly aligned with your JS → MERN/Next.js learning path.
- Alternatives: Plain JS — rejected: step-event union types and `RouteResult` status variants are exactly where JS bugs hide. Python/Java/C++ — rejected: no browser UI without extra tooling.
- Trade-offs accepted: Slight upfront typing effort.
- Future migration risk: Low.

**Decision: UI framework**
- Chosen: React 18 via Vite
- Reason: The UI is state-driven (selected nodes, conditions, current step, route result) → React's "UI = f(state)" fits exactly. Vite gives instant dev server and a zero-config static build.
- Alternatives: Next.js — rejected: routing, SSR and server components solve problems this app doesn't have; adds concepts without payoff. Vanilla JS + DOM — rejected: the step visualiser (F10) means many UI parts updating together; manual DOM syncing gets messy fast.
- Trade-offs accepted: React is a runtime dependency for a fairly small app (fine).
- Future migration risk: Low.

**Decision: Map / graph rendering**
- Chosen: Hand-written SVG in React (nodes = `<circle>`, roads = `<line>`/`<path>`), fixed x/y coordinates stored in the network data
- Reason: Full control over highlighting every step (visited node, relaxed edge, final path). Fixed coordinates = identical layout every demo. ~20 nodes is small enough that no library is needed.
- Alternatives: Cytoscape.js / React Flow — rejected: auto-layout moves nodes around, heavier API for the custom per-step highlighting, and extra library to learn. Leaflet / real map tiles — rejected (DOC 1 WON'T: realistic map adds nothing to the math). Canvas — rejected: click handling on edges is harder than SVG.
- Trade-offs accepted: You position nodes by hand in the data file (one-time, ~20 entries).
- Future migration risk: Low.

**Decision: State management**
- Chosen: React `useReducer` with a single typed `SimulationState` + action union
- Reason: All changes go through one pure reducer → predictable, testable, and every action (set traffic, close road, load preset, step) is explicit. Good fundamentals practice.
- Alternatives: Redux/Zustand — rejected: overkill for one screen. Scattered `useState` — rejected: route, conditions and stepper state must stay in sync.
- Trade-offs accepted: Slightly more boilerplate than `useState`.
- Future migration risk: Low.

**Decision: Styling**
- Chosen: Plain CSS (one CSS file + CSS variables for the traffic palette)
- Reason: The visual is mostly SVG; little layout. CSS variables keep colours in one place.
- Alternatives: Tailwind — acceptable if you prefer it; not needed. Component libraries — rejected: unnecessary.
- Future migration risk: Low.

**Decision: Algorithm libraries**
- Chosen: **None.** MinHeap, Dijkstra, reachability (BFS), and the route explainer are written by hand.
- Reason: Confirmed requirement; the implementation is what's evaluated.

**Decision: Testing**
- Chosen: Vitest (unit tests on the domain layer only)
- Reason: Native to Vite, Jest-compatible API, fast. The domain is pure functions → very easy to test.
- Alternatives: Jest — works but needs extra config with Vite. Playwright E2E — rejected: slow to set up, low value for a single-screen demo; manual demo rehearsal covers it.
- Trade-offs accepted: UI is verified manually against presets.

**Decision: Deployment**
- Chosen: Vercel (or GitHub Pages) for a shareable link + `npm run build && npm run preview` on your laptop as the offline fallback
- Reason: Static hosting is free and one-command. A link in your slides lets evaluators try it.
- Future migration risk: None.

**Decision: Live mode randomness (S5)**
- Chosen: Hand-written seeded PRNG (mulberry32, ~10 lines) in `domain/`; `setInterval` timer lives in the UI and dispatches `randomTrafficTick` actions.
- Reason: `Math.random()` can't replay; a seed makes any "live" run reproducible for rehearsal. Keeping the timer in UI and randomness in domain keeps the reducer pure and testable.
- Alternatives: Unseeded `Math.random()` — rejected (non-reproducible demo).

**Decision: Backend**
- Chosen: None for MVP.
- Reason: No persistence, no heavy compute, no secrets/external APIs. A backend would add a network hop per click and a second point of failure during the presentation.
- Future path: domain layer is framework-free, so an Express API (e.g. saved/shareable scenarios) can wrap it later without changes. `[KNOWN TRADE-OFF: less MERN practice from this project — accepted to keep focus on graph theory.]`

**Decision: CI / Monitoring**
- Chosen: Optional GitHub Action running `vitest` on push. No monitoring.
- Reason: Nice-to-have only; no production users.

---

## 2.3 — Data Architecture

No database. All data is typed constants loaded at startup; runtime state lives in the reducer.

### Core entities

```
Location
  id: LocationId (string, e.g. "HOSP")   — stable key used everywhere
  name: string                            — "City Hospital"
  kind: "hospital" | "college" | "station" | "market" | "junction" | ...
  x, y: number                            — fixed SVG coordinates

Road
  id: RoadId (string, e.g. "HOSP-MKT")
  from: LocationId
  to: LocationId
  baseMinutes: number (> 0)               — w₀
  oneWay: boolean                         — false = usable both directions

RoadCondition  (discriminated union — one per road)
  { kind: "traffic", level: "low" | "medium" | "high" | "severe" }
  { kind: "accident" }
  { kind: "closed" }

Scenario (preset, F11)
  id, name, description
  source: LocationId, destination: LocationId
  conditions: Partial<Record<RoadId, RoadCondition>>   — unlisted roads = low traffic

RouteResult  (discriminated union)
  { status: "found", path: LocationId[], roads: RoadId[], totalMinutes, dist, prev }
  { status: "unreachable", blockingClosures: RoadId[], dist, prev }
  { status: "same-location" }

DijkstraStep  (discriminated union — the stepper's event stream, F10)
  { type: "init", dist, queue }
  { type: "visit", node, dist, queue, visited }
  { type: "relax", from, to, road, oldDist, newDist, improved: boolean }
  { type: "skip-stale", node }            — lazy-deletion heap entry discarded
  { type: "done", result: RouteResult }

RouteChange  (F12)
  before: { path, totalMinutesNow }       — old route re-costed with CURRENT weights
  after:  { path, totalMinutes }
  causes: { road, oldMinutes, newMinutes }[]
```

### Weight model (the discrete-math heart)

```
TRAFFIC_MULTIPLIER = { low: 1, medium: 1.5, high: 2.5, severe: 4 }
ACCIDENT_MULTIPLIER = 6                     (decided: multiplier, not flat penalty — keeps
                                             every condition a single rule: w = w₀ × m)

effectiveMinutes(road, condition):
  closed   → null        (edge removed from E)
  accident → base × 6
  traffic  → base × TRAFFIC_MULTIPLIER[level]
```

- **Why `null` for closed, not `Infinity`:** removing the edge is the correct graph-theory model (E' = E \ {e}) and makes "unreachable" a genuine connectivity result, not a huge number. Slide-worthy point.
- **Floating point:** integer base × {1, 1.5, 2.5, 4, 6} always gives multiples of 0.5, which are exact in binary floating point → no rounding errors in comparisons. Keep base times as integers to preserve this.
- **Dijkstra validity:** every weight is > 0, satisfying Dijkstra's non-negative-weight precondition. Mention this explicitly in the presentation.

### Graph representation

The adjacency list is **derived**, never stored: `buildGraph(locations, roads, conditions)` produces `Map<LocationId, {to, road, minutes}[]>`, skipping closed roads and expanding two-way roads into both directions. Rebuilt on every change (~microseconds at this size).
Why derived: single source of truth = roads + conditions. No chance of the graph and the UI disagreeing.

Directed support note: DOC 1 assumed directed edges per direction. Decision here: roads are the unit of condition (one condition per road, applies to both directions if two-way); `oneWay` covers one-way streets. Per-direction traffic is cut — it doubles UI complexity for little teaching value.

### Tie-breaking (determinism NFR)

Heap priority = `(distance, hops, locationId)` compared lexicographically. Equal-time routes resolve to fewer roads, then alphabetical → identical result every run.

### Data flow — primary use case (user sets B→D to Severe)

```
1. User clicks road B→D, picks "Severe"      → UI dispatches { type: "setCondition", roadId, condition }
2. Reducer stores new condition               → state.conditions updated (immutable)
3. Reducer calls domain: buildGraph → dijkstra(graph, source, destination)
4. Reducer compares new result with previous  → explainRouteChange(prev, next, weights)
5. New state: { conditions, route, lastChange }
6. React re-renders SVG: edge colour/thickness, highlighted path, explainer panel (F12)
```

Stepper (F10) uses the same `dijkstraSteps()` generator the instant run uses — the instant run is just "consume all steps and take `done`". This makes F10's acceptance criterion (step result = instant result) true **by construction**.

### Sensitive data
None. No users, no personal data, no secrets, no API keys.

---

## 2.4 — API Design

Not applicable — no backend. The equivalent contract is the domain module's public functions (`buildGraph`, `dijkstra`, `dijkstraSteps`, `findBlockingClosures`, `explainRouteChange`) — fully specified in DOC 3.

---

## 2.5 — Clean Architecture & Engineering Principles

**MODULARITY & COHESION**
Four cohesive areas, named by what they do (Screaming Architecture — folders say "routing", not "utils"):
`domain/graph` (model + weights + adjacency), `domain/routing` (heap, Dijkstra, stepper, reachability, explainer), `simulation` (state + reducer), `ui` (components). Plus `data/` for network and scenarios. They talk only through exported typed functions.

**SINGLE RESPONSIBILITY PRINCIPLE**
- `MinHeap` only orders items. It knows nothing about graphs.
- `dijkstraSteps` only computes shortest paths. It doesn't know about traffic levels — it receives final numeric weights.
- `effectiveMinutes` only turns (road, condition) into a weight.
- Tempting violation: putting the multiplier logic or colour choice inside Dijkstra or the SVG component. Guard: weights come in pre-computed; colours come from a `conditionStyle()` helper in `ui/`.

**SEPARATION OF CONCERNS**
Business logic (weights, algorithm, reachability, explanation) lives only in `domain/`. React components render and dispatch — no `if (level === "severe") minutes * 4` inside JSX.

**DEPENDENCY INVERSION**
Dijkstra depends on an abstraction — an adjacency list of `{to, minutes}` — not on `Road`, `RoadCondition`, or traffic levels. The high-level algorithm doesn't depend on the low-level traffic model; both depend on the "weighted graph" abstraction. That's also the correct mathematical framing: Dijkstra works on *any* positively weighted graph.

**OPEN/CLOSED PRINCIPLE**
- New condition types (e.g. "construction work") = add a variant to `RoadCondition` + one case in `effectiveMinutes`. Dijkstra, stepper, and explainer don't change.
- New scenarios = add an entry to `data/scenarios.ts`. No code changes.
- New map = swap `data/network.ts`.

**INFORMATION HIDING (Ousterhout)**
- `MinHeap` hides the array-based binary-tree layout and the lazy-deletion strategy. Interface: `push`, `pop`, `size`.
- `dijkstra()` is a deep module: one call `dijkstra(graph, s, t) → RouteResult` hides the heap, the dist/prev arrays, tie-breaking, stale-entry skipping, and path reconstruction.
- "Define errors out of existence": `RouteResult` has explicit `unreachable` and `same-location` variants, so callers can't forget those cases (TypeScript forces a `switch` over `status`).

**TESTABILITY**
The whole domain is pure functions with no I/O → unit tests need zero mocks. Planned test targets:
- MinHeap: pops in sorted order; tie-break order; empty pop.
- Dijkstra: proposal example (11 → switch to A→C→D), hand-verified 6-node textbook graph, unreachable, same-location, equal-cost tie.
- Stepper: final `done` result equals `dijkstra()` for every scenario (property-style loop over all presets).
- Reachability: `findBlockingClosures` returns exactly the closures whose reopening restores a path.
- Explainer: proposal example names B→D and correct totals.
- Data sanity: every road references existing locations; every base time is a positive integer; every scenario's source/destination exist.

**NAMING & READABILITY (Clean Code)**
- Domain terms used consistently everywhere (Ubiquitous Language): **Location** (not node/place), **Road** (not edge/street) in app code; **vertex/edge** only in comments tying code to the math.
- Units in names: `baseMinutes`, `totalMinutes` — never bare `weight` or `time`.
- Files: `camelCase.ts` for modules, `PascalCase.tsx` for components.
- Comments only where they explain *why* (e.g. lazy deletion, tie-breaking, why closed = removed edge). Each key domain function gets a short comment mapping it to the math (these double as presentation notes).

**12-FACTOR (relevant parts only)**
- Config: none needed (no secrets, no env). Multipliers live in one constants file.
- Build/run separation: `npm run build` produces immutable static output; deploy that.
- Dev/prod parity: same static bundle locally and on Vercel.

---

## Decisions log

- Frontend-only, simulated data — confirmed.
- TypeScript + React (Vite) — decided.
- Accident = ×6 multiplier — decided.
- Live mode (S5) with seeded PRNG — added.
- Still open: presentation / deadline date (needed for DOC 4 sizing).

---

**⛔ Gate:** Does the architecture align with your vision? Any layer, technology choice, or principle to revisit before DOC 3 (module-level design)?
