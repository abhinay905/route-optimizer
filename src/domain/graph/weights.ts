import type { Road, RoadCondition, TrafficLevel } from "./types";

export const TRAFFIC_MULTIPLIER: Record<TrafficLevel, number> = {
  low: 1,
  medium: 1.5,
  high: 2.5,
  severe: 4,
};

export const ACCIDENT_MULTIPLIER = 6;

/** w(e) = w0(e) x m. Returns null when the road is closed (edge removed: E' = E \ {e}). */
export function effectiveMinutes(road: Road, condition: RoadCondition): number | null {
  if (condition.kind === "closed") return null;
  if (condition.kind === "accident") return road.baseMinutes * ACCIDENT_MULTIPLIER;
  return road.baseMinutes * TRAFFIC_MULTIPLIER[condition.level];
}
