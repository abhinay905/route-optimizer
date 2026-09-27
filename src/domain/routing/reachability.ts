import { buildGraph } from "../graph/buildGraph";
import type { Conditions, Location, LocationId, Road, RoadId } from "../graph/types";
import { dijkstra } from "./dijkstra";

/** Closed roads whose reopening (alone) would make target reachable again. */
export function findBlockingClosures(
  locations: Location[],
  roads: Road[],
  conditions: Conditions,
  source: LocationId,
  target: LocationId,
): RoadId[] {
  const blocking: RoadId[] = [];
  for (const road of roads) {
    if (conditions[road.id].kind !== "closed") continue;
    const testConditions: Conditions = {
      ...conditions,
      [road.id]: { kind: "traffic", level: "low" },
    };
    const graph = buildGraph(locations, roads, testConditions);
    const result = dijkstra(graph, source, target);
    if (result.status === "found") {
      blocking.push(road.id);
    }
  }
  return blocking;
}
