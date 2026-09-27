export type LocationId = string;
export type RoadId = string;

export type LocationKind =
  | "college"
  | "market"
  | "station"
  | "hospital"
  | "bus"
  | "park"
  | "mall"
  | "itpark"
  | "school"
  | "police"
  | "airport";

export interface Location {
  id: LocationId;
  name: string;
  kind: LocationKind;
  x: number;
  y: number;
}

export interface Road {
  id: RoadId;
  from: LocationId;
  to: LocationId;
  baseMinutes: number;
}
// All roads two-way (oneWay cut for tonight — add `oneWay?: boolean` later if needed).

export type TrafficLevel = "low" | "medium" | "high" | "severe";

export type RoadCondition =
  | { kind: "traffic"; level: TrafficLevel }
  | { kind: "accident" }
  | { kind: "closed" };

export type Conditions = Record<RoadId, RoadCondition>; // every road has an entry

export interface Edge {
  to: LocationId;
  roadId: RoadId;
  minutes: number;
}

export type Graph = Map<LocationId, Edge[]>; // adjacency list
