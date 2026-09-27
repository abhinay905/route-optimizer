# DOC 1 — Project Brief & Feature Specification
**Project:** Traffic-Aware Route Optimizer
**Type:** Course project — Discrete Mathematics (Graph Theory)
**Status:** ✅ Signed off

> Assumptions are marked `[ASSUMPTION: ...]`. Correct any that are wrong before we move on.
> `[ASSUMPTION: web app, runs fully in the browser, no backend, no real traffic API]`
> **Confirmed:** team project, built solo by Yashraj · no stack preference (decided in DOC 2) · Dijkstra + priority queue implemented by hand · presentation is part of evaluation.

---

## 1.1 — Design Thinking Foundation

```
PROJECT NAME: Traffic-Aware Route Optimizer
TAGLINE: An interactive city-map simulator that shows how changing traffic changes
         graph edge weights — and watches Dijkstra re-find the fastest route live.

PROBLEM STATEMENT
  Who:           (1) Primary: the evaluator / fellow students learning graph theory.
                 (2) Framed persona: a commuter in a city whose roads change condition.
  Pain:          Shortest-path algorithms are taught on static textbook graphs, so it's
                 hard to *see* why the "shortest" route isn't always the fastest, or how
                 one edge change can flip the whole answer.
  Current state: Hand-traced Dijkstra tables on paper; static diagrams; Google Maps
                 (which hides the algorithm completely).
  Root insight:  The interesting part isn't the shortest path itself — it's the moment
                 the path *changes*. Making weight changes interactive turns an abstract
                 algorithm into a cause-and-effect demonstration.

POINT OF VIEW
  A student learning graph theory needs to see a shortest path react to changing edge
  weights, because the algorithm only becomes intuitive when you can break the network
  and watch it adapt.

HOW MIGHT WE
  HMW-1 (amplify): How might we keep the familiar "pick A, pick B, get a route" map
                   interaction while exposing the graph underneath it?
  HMW-2 (eliminate): How might we remove the need to type numbers, so traffic changes
                   are one click?
  HMW-3 (reframe):  How might we make the *change in route* the hero, not the route?
  HMW-4 (question): How might we show that "shortest distance" and "fastest time" are
                   different optimisation targets on the same graph?
  HMW-5 (goal behind goal): How might a viewer leave able to explain Dijkstra, not just
                   having seen its output?

CORE VALUE PROPOSITION
  A self-contained simulation that maps a real-world situation (traffic, accidents,
  closures) onto precise discrete-math operations (edge-weight update, edge deletion,
  connectivity check) and recomputes the optimal path instantly. Unlike Google Maps it
  shows the algorithm; unlike a textbook it shows the algorithm reacting.
```

### Discrete-math concept mapping (the core of the evaluation)

| Real world | Graph theory |
|---|---|
| Location / intersection | Vertex `v ∈ V` |
| Road | Edge `(u, v) ∈ E` |
| Base travel time | Base weight `w₀(u,v) > 0` |
| Traffic level | Weight multiplier `m ∈ {1, 1.5, 2.5, 4}` |
| Current travel time | `w(u,v) = w₀(u,v) × m` |
| Accident | Large temporary weight increase |
| Road closure | Edge removal `E' = E \ {(u,v)}` |
| Destination unreachable | No path exists → graph not connected (between s and t) |
| Fastest route | Minimum-weight path via Dijkstra (valid since all `w > 0`) |

`[ASSUMPTION: directed graph — each two-way road is two directed edges, so traffic/closures can apply per direction and one-way roads are possible]`

⚠️ **Fix in the write-up:** In the example, B→D goes from 6 to 18 min (×3). ×3 isn't one of the defined levels (×1, ×1.5, ×2.5, ×4). Use either 6 → 15 (High) or 6 → 24 (Severe) so the example matches the model. Both still flip the route to A → C → D.

---

## 1.2 — Feature Set (MoSCoW)

### MUST HAVE (MVP)

**F1. Predefined city network**
- Description: A hard-coded simulated map of ~12–20 named locations (Hospital, College, Railway Station, Market, etc.) and roads with base travel times, drawn as a graph.
- Why load-bearing: Everything operates on this graph.
- Acceptance criteria: Graph renders with labelled vertices and edges; each edge shows its current weight; data lives in one config file, not scattered in UI code.

**F2. Source & destination selection**
- Description: Click (or dropdown) to pick source and destination.
- Why load-bearing: Defines the shortest-path query.
- Acceptance criteria: Both can be changed anytime; selecting same node for both is handled gracefully.

**F3. Dijkstra route computation + display**
- Description: Compute the minimum-travel-time path and highlight it on the map with total time.
- Why load-bearing: The central algorithm of the project.
- Acceptance criteria: Highlighted route and total time match a hand-computed Dijkstra table on at least 3 test cases; path shown as ordered list (A → C → D).

**F4. Interactive traffic levels per road**
- Description: Click a road → choose Low / Medium / High / Severe. Colour-coded edge (green → red). Weight updates via `base × multiplier`.
- Why load-bearing: This is the "dynamic weights" half of the problem.
- Acceptance criteria: Changing a level updates the edge weight label and colour; no numeric input required.

**F5. Automatic re-routing**
- Description: Any change to traffic/accident/closure triggers recomputation; if the route changes, it is visibly flagged.
- Why load-bearing: The "route switches" moment is the demo.
- Acceptance criteria: Reproduces the A→B→D → A→C→D switch from the proposal on a live click.

**F6. Accidents & road closures**
- Description: Mark a road as Accident (heavy weight penalty) or Closed (edge removed from graph).
- Why load-bearing: Explicitly promised in the problem statement.
- Acceptance criteria: Closed edges are excluded from Dijkstra and drawn dashed/greyed; accident is visually distinct from Severe traffic.

**F7. Unreachable destination detection**
- Description: If closures disconnect source from destination, show a clear "No route — destination unreachable" message and indicate which closures caused it.
- Why load-bearing: Promised connectivity handling; also a great viva talking point.
- Acceptance criteria: Closing all paths to a node produces the message instead of a crash or stale route.

**F8. Reset**
- Description: Reset all roads to Low traffic / open.
- Acceptance criteria: One click restores the initial state.

**F9. Hand-written Dijkstra + min-heap** *(moved in: implement by hand)*
- Description: Own binary min-heap priority queue and Dijkstra — no graph/algorithm libraries. Pure functions, separate from UI.
- Why load-bearing: The algorithm is what's being evaluated; a library would hide it.
- Acceptance criteria: Unit tests pass for heap (insert / extract-min order) and Dijkstra (known graphs, unreachable node, source = destination).

**F10. Step-by-step Dijkstra visualiser + distance table** *(moved up from SHOULD: presentation is evaluated)*
- Description: "Step / Play / Reset" controls walking the algorithm — current node, visited set, `dist[]` / `prev[]` table, priority-queue contents, each edge relaxation highlighted on the map.
- Why load-bearing: In a presentation, this is how you *show* Dijkstra instead of claiming it. Strongest marks-earner.
- Acceptance criteria: Stepping through produces the same final table as the instant run; each step is readable on a projector.

**F11. Scenario presets** *(moved up from SHOULD: demo reliability)*
- Description: 3–4 one-click scenarios, incl. the exact A→B→D → A→C→D switch from the proposal and one unreachable case.
- Why load-bearing: A presentation needs a reproducible, rehearsed demo — no fumbling with clicks live.
- Acceptance criteria: Each preset loads a fixed state and always gives the same route.

**F12. "Why did the route change?" explainer** *(added from novel suggestion #1)*
- Description: After any reroute, show old vs. new route side by side with their totals under the *current* weights, and name the road(s) whose change caused the switch (e.g. `B→D: 6 → 24 min`).
- Why load-bearing: Turns the route switch into an explained cause → effect — the core message of the presentation.
- Acceptance criteria: On the proposal example, shows `A→B→D = 5 + 24 = 29` vs `A→C→D = 8 + 4 = 12` and names B→D as the cause. No panel shown when the route didn't change.

### SHOULD HAVE (v1.1)

**S3. Shortest distance vs. fastest time comparison**
- Description: Toggle showing the physically shortest route (base weights) next to the fastest (current weights).
- Why deferred: Needs a second weight (distance in km) per edge.


**S5. Live traffic simulation mode** *(promoted from C1)*
- Description: "Live" toggle — every few seconds a few random roads change traffic level; the route re-computes and the explainer (F12) shows why. Uses a **seeded** random generator, so the same seed replays the exact same sequence.
- Why deferred: MVP must work on manual clicks first; this reuses F4/F5/F12 with only a timer + PRNG on top.

### COULD HAVE (Backlog)

- **C2.** Top-2 routes (next-best alternative) using a simple Yen's-style approach.
- **C4.** Export the current graph as adjacency matrix / adjacency list for the report.

### WON'T HAVE (explicitly cut)

- **Real-time traffic / Google Maps API** — contradicts the stated scope (simulation, not real data) and adds API keys, cost, and failure points.
- **User accounts / database / backend** — no persistent users needed for a demo.
- **Real GPS / geographic coordinates** — a schematic map explains the concept better.
- **A\*, Bellman-Ford, Floyd-Warshall implementations** — out of scope; can be mentioned in the report as comparisons.
- **Mobile app** — web demo on a laptop/projector is the target.

### ⚠️ SCOPE CREEP FLAGS
- Making it look like a real map (tiles, Leaflet, OSM) — eats time, adds nothing to the math.
- Building a graph *editor* (add/drag nodes) before the MVP is done.
- Live mode (S5) with unseeded randomness — would make the demo non-reproducible. Always seeded; presets stay the main demo path.

---

## 1.3 — Novel Feature Suggestions (for consideration)

1. ✅ **Accepted → F12.** **"Why did the route change?" explainer** — *Lens: HMW-3 reframe.*
   After a reroute, show old vs. new route side by side with totals (`old: 5 + 24 = 29`, `new: 8 + 4 = 12`).
   *Hint:* keep the previous result in state and diff the two paths.

2. **Critical-road finder (bridges / cut edges)** — *Lens: SCAMPER – Combine (connectivity + routing).*
   Highlight roads whose closure would disconnect the network. Directly ties to the graph-connectivity chapter of DM.
   *Hint:* Tarjan's bridge algorithm on the undirected version, or brute-force (remove each edge, BFS) since the graph is small.

3. **Route robustness score** — *Lens: Analogous inspiration (network reliability in telecom).*
   For the current route, test each of its edges at Severe; report how much worse the trip gets. Shows which road is the route's weak point.
   *Hint:* rerun Dijkstra once per edge in the path — cheap on ~20 nodes.

4. **Emergency mode** — *Lens: Worst possible idea → reverse ("route that ignores urgency").*
   Destination fixed to nearest Hospital; runs Dijkstra from source and picks the minimum-time hospital among several.
   *Hint:* single-source Dijkstra already gives distances to all hospitals — pick the min. Nice demonstration that one run solves many queries.

5. **Manual-vs-algorithm challenge** — *Lens: HMW-5 goal behind the goal.*
   User clicks what they think the fastest route is; app reveals Dijkstra's answer and the difference.

My pick if you add only one: **#1** (small effort, big demo payoff). If you add two: **#1 + #2** (#2 adds a second DM concept).

---

## 1.4 — User Flow Overview

```
[Open app: city graph, all roads Low]
        ↓
[Select source + destination]
        ↓
[Dijkstra runs → fastest route highlighted + total time]
        ↓
[Click a road → set Traffic level / Accident / Closed]
        ↓
[Weights update → Dijkstra reruns automatically]
        ↓
[Route unchanged ──or── Route switches (flagged + explained)]   ← value moment
        ↓
[Reset / try another scenario]

Edge cases:
  • Source == destination     → "Already at destination", time 0
  • No path (closures)        → "Destination unreachable" + highlight blocking closures
  • Tie between two routes    → deterministic pick (e.g. fewer edges), note the tie
  • Source/destination not selected → route panel shows prompt, no computation
```

---

## Open questions (answer before DOC 2)

1. Deadline / presentation date? (Sizes the build plan — you're building solo.)
2. ~~Novel suggestions~~ → #1 accepted as F12.

---

**⛔ Gate:** Does this capture the project correctly? Any features to add, cut, or reframe before we move to DOC 2 (architecture)?
