import type { LocationId, RoadId } from "../graph/types";
import type { RouteResult } from "./dijkstra";

export interface RouteChange {
  before: { path: LocationId[]; totalMinutesNow: number | null };
  after: RouteResult;
  causes: { roadId: RoadId; oldMinutes: number | null; newMinutes: number | null }[];
}

function pathsEqual(a: LocationId[], b: LocationId[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/** Returns null if the path is unchanged. Causes = roads on the old OR new path whose weight changed. */
export function explainRouteChange(
  prev: RouteResult,
  next: RouteResult,
  prevWeights: Record<RoadId, number | null>,
  nowWeights: Record<RoadId, number | null>,
): RouteChange | null {
  if (prev.status !== "found") return null;
  if (next.status === "found" && pathsEqual(prev.path, next.path)) return null;

  let totalMinutesNow: number | null = 0;
  for (const roadId of prev.roadIds) {
    const minutes = nowWeights[roadId];
    if (totalMinutesNow === null || minutes === null || minutes === undefined) {
      totalMinutesNow = null;
    } else {
      totalMinutesNow += minutes;
    }
  }

  const newRoadIds = next.status === "found" ? next.roadIds : [];
  const roadIds = new Set([...prev.roadIds, ...newRoadIds]);
  const causes: RouteChange["causes"] = [];
  for (const roadId of roadIds) {
    const oldMinutes = prevWeights[roadId] ?? null;
    const newMinutes = nowWeights[roadId] ?? null;
    if (oldMinutes !== newMinutes) {
      causes.push({ roadId, oldMinutes, newMinutes });
    }
  }

  return {
    before: { path: prev.path, totalMinutesNow },
    after: next,
    causes,
  };
}
