import type { Graph, LocationId, RoadId } from "../graph/types";
import { MinHeap } from "./minHeap";

interface QueueEntry {
  node: LocationId;
  dist: number;
  hops: number;
}
// Priority: dist, then hops, then node id -> deterministic tie-breaking.

export type DistTable = Record<LocationId, number>;

export type DijkstraStep =
  | { type: "visit"; node: LocationId; dist: DistTable; visited: LocationId[]; queue: QueueEntry[] }
  | {
      type: "relax";
      from: LocationId;
      to: LocationId;
      roadId: RoadId;
      oldDist: number;
      newDist: number;
      improved: boolean;
    }
  | { type: "skip-stale"; node: LocationId }
  | { type: "done"; result: RouteResult };

export type RouteResult =
  | { status: "found"; path: LocationId[]; roadIds: RoadId[]; totalMinutes: number }
  | { status: "unreachable" }
  | { status: "same-location" };

function compareEntries(a: QueueEntry, b: QueueEntry): number {
  if (a.dist !== b.dist) return a.dist - b.dist;
  if (a.hops !== b.hops) return a.hops - b.hops;
  if (a.node < b.node) return -1;
  if (a.node > b.node) return 1;
  return 0;
}

export function* dijkstraSteps(
  graph: Graph,
  source: LocationId,
  target: LocationId,
): Generator<DijkstraStep> {
  if (source === target) {
    yield { type: "done", result: { status: "same-location" } };
    return;
  }

  const dist: DistTable = {};
  const hops: Record<LocationId, number> = {};
  const prev: Record<LocationId, { node: LocationId; roadId: RoadId } | null> = {};
  for (const node of graph.keys()) {
    dist[node] = Infinity;
    prev[node] = null;
  }
  dist[source] = 0;
  hops[source] = 0;

  const visited: LocationId[] = [];
  const visitedSet = new Set<LocationId>();

  const heap = new MinHeap<QueueEntry>(compareEntries);
  const pending: QueueEntry[] = [];
  const pushEntry = (entry: QueueEntry) => {
    heap.push(entry);
    pending.push(entry);
  };
  pushEntry({ node: source, dist: 0, hops: 0 });

  while (heap.size > 0) {
    const entry = heap.pop()!;
    const { node } = entry;

    if (visitedSet.has(node)) {
      yield { type: "skip-stale", node };
      continue;
    }

    visitedSet.add(node);
    visited.push(node);
    yield {
      type: "visit",
      node,
      dist: { ...dist },
      visited: [...visited],
      queue: pending.filter((e) => !visitedSet.has(e.node)),
    };

    if (node === target) break;

    for (const edge of graph.get(node) ?? []) {
      if (visitedSet.has(edge.to)) continue;
      const newDist = entry.dist + edge.minutes;
      const newHops = hops[node] + 1;
      const improved =
        newDist < dist[edge.to] || (newDist === dist[edge.to] && newHops < hops[edge.to]);
      yield {
        type: "relax",
        from: node,
        to: edge.to,
        roadId: edge.roadId,
        oldDist: dist[edge.to],
        newDist,
        improved,
      };
      if (improved) {
        dist[edge.to] = newDist;
        hops[edge.to] = newHops;
        prev[edge.to] = { node, roadId: edge.roadId };
        pushEntry({ node: edge.to, dist: newDist, hops: newHops });
      }
    }
  }

  if (!visitedSet.has(target)) {
    yield { type: "done", result: { status: "unreachable" } };
    return;
  }

  const path: LocationId[] = [target];
  const roadIds: RoadId[] = [];
  let current = target;
  while (current !== source) {
    const step = prev[current];
    if (!step) break;
    roadIds.push(step.roadId);
    path.push(step.node);
    current = step.node;
  }
  path.reverse();
  roadIds.reverse();

  yield {
    type: "done",
    result: { status: "found", path, roadIds, totalMinutes: dist[target] },
  };
}

// dijkstra() = run the generator to the end, return the "done" result.
// -> Stepper and instant run can never disagree (single code path).
export function dijkstra(graph: Graph, source: LocationId, target: LocationId): RouteResult {
  let result: RouteResult = { status: "unreachable" };
  for (const step of dijkstraSteps(graph, source, target)) {
    if (step.type === "done") {
      result = step.result;
    }
  }
  return result;
}
