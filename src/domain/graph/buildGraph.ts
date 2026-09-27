import type { Conditions, Graph, Location, Road, RoadId } from "./types";
import { effectiveMinutes } from "./weights";

/** Builds the adjacency list for the current conditions. Closed roads are skipped;
 *  each two-way road becomes two directed edges. Every location gets an entry (even isolated). */
export function buildGraph(locations: Location[], roads: Road[], conditions: Conditions): Graph {
  const graph: Graph = new Map();
  for (const location of locations) {
    graph.set(location.id, []);
  }
  for (const road of roads) {
    const minutes = effectiveMinutes(road, conditions[road.id]);
    if (minutes === null) continue;
    graph.get(road.from)!.push({ to: road.to, roadId: road.id, minutes });
    graph.get(road.to)!.push({ to: road.from, roadId: road.id, minutes });
  }
  return graph;
}

/** Snapshot of every road's current minutes (null = closed). Used by the explainer. */
export function currentWeights(roads: Road[], conditions: Conditions): Record<RoadId, number | null> {
  const weights: Record<RoadId, number | null> = {};
  for (const road of roads) {
    weights[road.id] = effectiveMinutes(road, conditions[road.id]);
  }
  return weights;
}
