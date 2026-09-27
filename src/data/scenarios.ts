import type { LocationId, RoadCondition, RoadId } from "../domain/graph/types";

export interface Scenario {
  id: string;
  name: string;
  source: LocationId;
  destination: LocationId;
  overrides: Record<RoadId, RoadCondition>;
}

// 4 presets, DOC3 §3.6. Never change these numbers: tests and the demo script depend on them.
export const SCENARIOS: Scenario[] = [
  {
    id: "normal",
    name: "Normal day",
    source: "COL",
    destination: "HOSP",
    overrides: {},
  },
  {
    id: "rush",
    name: "Rush hour at Market",
    source: "COL",
    destination: "HOSP",
    overrides: {
      "MKT-HOSP": { kind: "traffic", level: "severe" },
    },
  },
  {
    id: "accident",
    name: "Accident near Station",
    source: "COL",
    destination: "HOSP",
    overrides: {
      "MKT-HOSP": { kind: "traffic", level: "severe" },
      "STN-HOSP": { kind: "accident" },
    },
  },
  {
    id: "cutoff",
    name: "Airport cut off",
    source: "COL",
    destination: "AIR",
    overrides: {
      "SCH-AIR": { kind: "closed" },
      "POL-AIR": { kind: "closed" },
      "TECH-AIR": { kind: "closed" },
    },
  },
];
