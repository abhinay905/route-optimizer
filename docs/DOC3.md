# DOC 3 — Module & Coding Architecture
**Project:** Traffic-Aware Route Optimizer
**Builds on:** DOC1.md (features) · DOC2.md (stack: Vite + React + TS, frontend-only)
**Status:** ✅ Signed off · **Presentation: tomorrow** · Build is driven by CONTROLLER.md

---

## 3.0 — Reality Check: Scope for One Night

DOC 2 assumed 2–3 weeks. With one evening, solo (AI-assisted: Antigravity / Gemini / Claude), scope is ordered by **priority tiers**. Build strictly in order; stop wherever time runs out. Every tier ends in a working, demo-able app. Time estimates below are for hand-coding; with agents T1–T3 are realistic tonight.

| Tier | Features | Est. time | If you stop here… |
|---|---|---|---|
| **T1 — Core** | F1 network, F2 select, F3 Dijkstra, F4 traffic, F5 reroute, F6 accident/close, F7 unreachable, F8 reset, F9 hand-written heap | ~3 h | Fully meets the proposal. Presentable. |
| **T2 — Demo safety** | F11 presets, F12 explainer | ~1 h | Rehearsable demo + "why it changed" slide moment. |
| **T3 — Marks-earner** | F10 step visualiser + dist table | ~1.5 h | Shows Dijkstra working step by step. |
| **T4 — Bonus** | S5 live mode (seeded random traffic ticks) | ~0.5 h with agent | Only if T1–T3 are committed and rehearsed once. |
| **CUT** | S3 distance vs time, deployment, CI | — | Mention as "future scope" on your last slide. |

**Hard rule:** stop coding with ≥ 1.5 h left for slides + 2 full demo rehearsals. A rehearsed T2 beats an unrehearsed T3.

`[KNOWN RISK: blockingClosures (F7 detail) is simple but optional — if short on time, show just "unreachable" without listing causes.]`

---

## 3.1 — Folder Structure (Screaming Architecture)

```
src/
├── domain/                      ← pure TS. NO React, NO DOM imports.
│   ├── graph/
│   │   ├── types.ts             Location, Road, RoadCondition, Graph, ids
│   │   ├── weights.ts           multipliers + effectiveMinutes()
│   │   └── buildGraph.ts        roads + conditions → adjacency list
│   └── routing/
│       ├── minHeap.ts           hand-written binary min-heap
│       ├── dijkstra.ts          dijkstraSteps() generator + dijkstra()
│       ├── reachability.ts      findBlockingClosures()          (T1, optional)
│       └── explainRouteChange.ts                                (T2)
├── data/
│   ├── network.ts               11 locations, 19 roads (given below)
│   └── scenarios.ts             4 presets (given below)            (T2)
├── simulation/
│   ├── state.ts                 SimulationState, Action types, initialState
│   └── reducer.ts               simulationReducer + recompute()
├── ui/
│   ├── CityMap.tsx              SVG: roads + locations + highlights
│   ├── RoadConditionPicker.tsx  Low/Med/High/Severe/Accident/Closed buttons
│   ├── ControlPanel.tsx         source/destination selects, presets, reset
│   ├── RoutePanel.tsx           route result / unreachable message
│   ├── ExplainerPanel.tsx       (T2)
│   ├── StepperPanel.tsx         (T3)
│   ├── conditionStyle.ts        condition → colour / width / dash
│   └── styles.css
├── App.tsx                      useReducer + layout
└── main.tsx
tests live next to files: minHeap.test.ts, dijkstra.test.ts
```

**Dependency direction:** `ui → simulation → domain ← data`. Nothing imports "upward".

---

## 3.2 — Module: `domain/graph`

### types.ts
```ts
export type LocationId = string;
export type RoadId = string;

export type LocationKind = "college" | "market" | "station" | "hospital"
  | "bus" | "park" | "mall" | "itpark" | "school" | "police" | "airport";

export interface Location { id: LocationId; name: string; kind: LocationKind; x: number; y: number; }
export interface Road { id: RoadId; from: LocationId; to: LocationId; baseMinutes: number; }
// All roads two-way (oneWay cut for tonight — add `oneWay?: boolean` later if needed).

export type TrafficLevel = "low" | "medium" | "high" | "severe";
export type RoadCondition =
  | { kind: "traffic"; level: TrafficLevel }
  | { kind: "accident" }
  | { kind: "closed" };

export type Conditions = Record<RoadId, RoadCondition>;   // every road has an entry
export interface Edge { to: LocationId; roadId: RoadId; minutes: number; }
export type Graph = Map<LocationId, Edge[]>;             // adjacency list
```

### weights.ts
```ts
export const TRAFFIC_MULTIPLIER: Record<TrafficLevel, number> =
  { low: 1, medium: 1.5, high: 2.5, severe: 4 };
export const ACCIDENT_MULTIPLIER = 6;

/** w(e) = w₀(e) × m.  Returns null when the road is closed (edge removed: E' = E \ {e}). */
export function effectiveMinutes(road: Road, c: RoadCondition): number | null
```
SRP: this is the **only** place multipliers are applied.

### buildGraph.ts
```ts
/** Builds the adjacency list for the current conditions. Closed roads are skipped;
 *  each two-way road becomes two directed edges. Every location gets an entry (even isolated). */
export function buildGraph(locations: Location[], roads: Road[], conditions: Conditions): Graph

/** Snapshot of every road's current minutes (null = closed). Used by the explainer. */
export function currentWeights(roads: Road[], conditions: Conditions): Record<RoadId, number | null>
```

---

## 3.3 — Module: `domain/routing`

### minHeap.ts — hand-written (F9)
```ts
export class MinHeap<T> {
  constructor(private compare: (a: T, b: T) => number) {}
  push(item: T): void      // append, sift up
  pop(): T | undefined     // swap root with last, remove, sift down
  get size(): number
}
```
- Array layout: parent `(i-1)>>1`, children `2i+1`, `2i+2`.
- Hides: array, sift logic. Knows nothing about graphs (SRP).
- **Lazy deletion:** Dijkstra pushes a new entry on every improvement instead of decrease-key; stale entries are skipped on pop. Say this in the presentation — it's why the heap stays simple.

### dijkstra.ts
```ts
interface QueueEntry { node: LocationId; dist: number; hops: number; }
// Priority: dist, then hops, then node id → deterministic tie-breaking.

export type DijkstraStep =
  | { type: "visit"; node: LocationId; dist: DistTable; visited: LocationId[]; queue: QueueEntry[] }
  | { type: "relax"; from: LocationId; to: LocationId; roadId: RoadId;
      oldDist: number; newDist: number; improved: boolean }
  | { type: "skip-stale"; node: LocationId }
  | { type: "done"; result: RouteResult };

export type RouteResult =
  | { status: "found"; path: LocationId[]; roadIds: RoadId[]; totalMinutes: number }
  | { status: "unreachable" }
  | { status: "same-location" };

export function* dijkstraSteps(graph: Graph, source: LocationId, target: LocationId): Generator<DijkstraStep>
export function dijkstra(graph: Graph, source: LocationId, target: LocationId): RouteResult
// dijkstra() = run the generator to the end, return the "done" result.
// → Stepper and instant run can never disagree (single code path).
```

**Algorithm (pseudocode for `dijkstraSteps`):**
```
if source == target: yield done(same-location); return
dist[v] = ∞ for all v;  dist[source] = 0;  hops[source] = 0
prev[v] = null (stores {node, roadId})
heap.push({source, 0, 0})
while heap not empty:
    {node, d} = heap.pop()
    if node in visited: yield skip-stale; continue
    visited.add(node);  yield visit(snapshot)
    if node == target: break                       // early exit — standard, fewer steps on stage
    for edge in graph[node]:
        if edge.to in visited: continue
        nd = d + edge.minutes;  nh = hops[node] + 1
        improved = nd < dist[edge.to] || (nd == dist[edge.to] && nh < hops[edge.to])
        yield relax(node, edge.to, edge.roadId, dist[edge.to], nd, improved)
        if improved: dist/hops/prev update; heap.push({edge.to, nd, nh})
if target not visited: yield done(unreachable)
else: walk prev from target → build path + roadIds; yield done(found)
```
Snapshots in `visit` steps must be **copies** (`{...dist}`, `[...visited]`), not references — otherwise every stored step shows the final state.

### reachability.ts (T1, optional detail)
```ts
/** Closed roads whose reopening (alone) would make target reachable again. */
export function findBlockingClosures(locations, roads, conditions, source, target): RoadId[]
// For each closed road: copy conditions with that road set to low, BFS/dijkstra, keep if reachable.
// ≤ 19 roads → brute force is fine (don't optimise).
```

### explainRouteChange.ts (T2 — F12)
```ts
export interface RouteChange {
  before: { path: LocationId[]; totalMinutesNow: number | null };  // null = old route now blocked
  after: RouteResult;
  causes: { roadId: RoadId; oldMinutes: number | null; newMinutes: number | null }[];
}
/** Returns null if the path is unchanged. Causes = roads on the old OR new path whose weight changed. */
export function explainRouteChange(
  prev: RouteResult, next: RouteResult,
  prevWeights: Record<RoadId, number | null>, nowWeights: Record<RoadId, number | null>
): RouteChange | null
```
Re-costing the old path with **current** weights is what produces `5 + 24 = 29 vs 12`.

---

## 3.4 — Module: `simulation`

### state.ts
```ts
export interface SimulationState {
  conditions: Conditions;
  source: LocationId | null;
  destination: LocationId | null;
  selectedRoadId: RoadId | null;                   // road whose picker is open
  route: RouteResult | null;                       // null until both selected
  weightsAtRoute: Record<RoadId, number | null>;   // snapshot for the explainer
  lastChange: RouteChange | null;                  // T2
  blockingClosures: RoadId[];
  stepper: { steps: DijkstraStep[]; index: number } | null;   // T3
  activeScenarioId: string | null;
}

export type Action =
  | { type: "setSource"; id: LocationId }
  | { type: "setDestination"; id: LocationId }
  | { type: "selectRoad"; id: RoadId | null }
  | { type: "setCondition"; roadId: RoadId; condition: RoadCondition }
  | { type: "loadScenario"; scenarioId: string }                   // T2
  | { type: "reset" }
  | { type: "startStepper" } | { type: "stepNext" } | { type: "stepPrev" } | { type: "exitStepper" }; // T3
```

### reducer.ts
- `simulationReducer(state, action)` — pure, returns new state, never mutates.
- Every action that changes source / destination / conditions calls **one** helper:
```ts
function recompute(state): SimulationState
  // weights = currentWeights(...);  graph = buildGraph(...)
  // route = dijkstra(graph, source, destination)
  // lastChange = explainRouteChange(oldRoute, route, state.weightsAtRoute, weights)
  // blockingClosures = route.status === "unreachable" ? findBlockingClosures(...) : []
  // exits stepper (steps would be stale)
```
- `setCondition` also clears `activeScenarioId` (you've left the preset).
- `loadScenario` resets conditions to all-low, applies scenario overrides, sets source/destination, and sets `lastChange = null` (loading a preset is not a "route change").
- `startStepper`: `steps = Array.from(dijkstraSteps(graph, s, t))`, `index = 0`. Precomputing makes Prev/Next trivial.

---

## 3.5 — Module: `ui`

| Component | Owns | Does NOT |
|---|---|---|
| `App` | `useReducer`, layout (map left, panels right) | compute anything |
| `CityMap` | SVG drawing; click location → set source (1st click) / destination (2nd click); click road → `selectRoad` | know multipliers |
| `RoadConditionPicker` | 6 buttons for the selected road | apply weights |
| `ControlPanel` | source/destination `<select>`s (fallback to map clicks), preset buttons, reset | — |
| `RoutePanel` | path as `College → Station → Hospital`, total minutes; unreachable/same-location messages | — |
| `ExplainerPanel` | old vs new with sums, cause roads | — |
| `StepperPanel` | Prev/Next, current step text, dist table, queue list | — |

**CityMap rendering rules**
- Road label at midpoint: current minutes (e.g. `24`), or `✕` if closed.
- `conditionStyle(condition)` → `{ colour, width, dash }`: low green/3px, medium yellow/5px, high orange/7px, severe red/9px, accident purple/9px + `⚠` label, closed grey dashed. Width + dash make it readable without colour (DOC 2 NFR).
- Route: thick blue overlay on route roads. Stepper mode: visited nodes filled, current node ringed, relaxed edge flashed (improved = green, not improved = grey).
- `viewBox="0 0 1000 600"`, labels ≥ 16px for the projector.

---

## 3.6 — Data (ready to paste)

### network.ts — 11 locations
| id | name | kind | x | y |
|---|---|---|---|---|
| COL | AIT College | college | 100 | 300 |
| MKT | Market | market | 300 | 180 |
| STN | Railway Station | station | 300 | 420 |
| HOSP | City Hospital | hospital | 520 | 300 |
| BUS | Bus Depot | bus | 100 | 90 |
| PARK | Central Park | park | 520 | 80 |
| MALL | City Mall | mall | 750 | 160 |
| TECH | IT Park | itpark | 920 | 300 |
| SCH | School | school | 750 | 440 |
| POL | Police Station | police | 520 | 520 |
| AIR | Airport | airport | 920 | 520 |


### 19 roads (base minutes)
```
COL–MKT 5   MKT–HOSP 6   COL–STN 8   STN–HOSP 4      ← the proposal's A-B-D / A-C-D diamond
COL–BUS 6   BUS–MKT 7    BUS–PARK 12 MKT–PARK 8   PARK–HOSP 7
PARK–MALL 9 HOSP–MALL 10 HOSP–SCH 9  HOSP–POL 7   STN–POL 9
MALL–TECH 6 SCH–TECH 8   SCH–AIR 7   POL–AIR 12   TECH–AIR 10
```
Mapping to the proposal: **A = College, B = Market, C = Station, D = Hospital.**
Verified College → Hospital at all-low: via Market **11** (optimal), via Station 12, via Park 20, via Bus 19, via Police 24.

### scenarios.ts — 4 presets
| id | Name | Source → Dest | Overrides | Expected result |
|---|---|---|---|---|
| normal | Normal day | COL → HOSP | none | COL→MKT→HOSP, **11** |
| rush | Rush hour at Market | COL → HOSP | MKT–HOSP severe (24) | COL→STN→HOSP, **12** (the proposal's switch) |
| accident | Accident near Station | COL → HOSP | MKT–HOSP severe, STN–HOSP accident (24) | COL→MKT→PARK→HOSP, **20** |
| cutoff | Airport cut off | COL → AIR | SCH–AIR, POL–AIR, TECH–AIR closed | Unreachable; each of the 3 is a blocking closure |

Demo script = load these four in order. Then do one live click-change to show it's not canned.

---

## 3.7 — Error Handling & Edge Cases

| Case | Handling |
|---|---|
| Source == destination | `same-location` → "You're already there (0 min)" |
| Only one of source/destination set | `route = null` → "Select a destination" prompt; no compute |
| All paths closed | `unreachable` + list blocking closures, highlight them on map |
| Old route now uses a closed road | explainer shows old route as "blocked" (`totalMinutesNow = null`) |
| Equal-cost routes | tie-break by hops, then id — deterministic |
| Conditions changed while stepping | reducer exits stepper (steps would be stale) |
| Bad data (typo in road endpoint) | one test asserts every road references existing locations |

No `try/catch` needed in the domain — no I/O, and invalid states are unrepresentable via the union types.

---

## 3.8 — Testing Plan (minimum for tonight: ~20 min)

`minHeap.test.ts`
- pops `[5,1,4,2,3]` as `[1,2,3,4,5]`; `pop()` on empty → `undefined`

`dijkstra.test.ts`
- normal → `COL,MKT,HOSP` / 11
- rush → `COL,STN,HOSP` / 12
- accident → `COL,MKT,PARK,HOSP` / 20
- cutoff → `unreachable`
- same location → `same-location`
- stepper's final `done.result` equals `dijkstra()` for all 4 scenarios
- data sanity: every road's endpoints exist, every `baseMinutes` is a positive integer

UI is verified by running the 4 presets by hand (that's your rehearsal).

---

## 3.9 — Tonight's Build Order (DOC 4 folded in)

1. `npm create vite@latest route-optimizer -- --template react-ts` → run it. *(10 min)*
2. `types.ts`, `weights.ts`, `network.ts`, `buildGraph.ts`. *(30 min)*
3. `minHeap.ts` + test. *(30 min)*
4. `dijkstra.ts` (generator + wrapper) + tests passing on the 4 cases. *(60 min)*
5. `state.ts`, `reducer.ts` with `recompute`. *(30 min)*
6. `CityMap`, `RoadConditionPicker`, `ControlPanel`, `RoutePanel`. → **T1 done, commit.** *(60 min)*
7. `scenarios.ts` + preset buttons, `explainRouteChange` + `ExplainerPanel`. → **T2 done, commit.** *(60 min)*
8. Stepper actions + `StepperPanel` + map highlights. → **T3 done, commit.** *(90 min)*
9. Slides + 2 rehearsals. *(≥ 90 min, non-negotiable)*

Commit after every step — keeps a working fallback (and your streak).

---

DOC 4 is folded into §3.9 above; CONTROLLER.md holds the agent-facing version of it.
