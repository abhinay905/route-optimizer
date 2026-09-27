import { describe, expect, it } from "vitest";
import { buildGraph } from "../graph/buildGraph";
import type { Conditions, RoadCondition, RoadId } from "../graph/types";
import { LOCATIONS, ROADS } from "../../data/network";
import { dijkstra, dijkstraSteps } from "./dijkstra";

function allLow(): Conditions {
  const conditions: Conditions = {};
  for (const road of ROADS) {
    conditions[road.id] = { kind: "traffic", level: "low" };
  }
  return conditions;
}

function withOverrides(overrides: Record<RoadId, RoadCondition>): Conditions {
  return { ...allLow(), ...overrides };
}

describe("dijkstra scenarios", () => {
  it("normal day: COL -> HOSP via Market, 11 minutes", () => {
    const graph = buildGraph(LOCATIONS, ROADS, allLow());
    const result = dijkstra(graph, "COL", "HOSP");
    expect(result).toEqual({
      status: "found",
      path: ["COL", "MKT", "HOSP"],
      roadIds: ["COL-MKT", "MKT-HOSP"],
      totalMinutes: 11,
    });
  });

  it("rush hour at Market: COL -> HOSP via Station, 12 minutes", () => {
    const conditions = withOverrides({ "MKT-HOSP": { kind: "traffic", level: "severe" } });
    const graph = buildGraph(LOCATIONS, ROADS, conditions);
    const result = dijkstra(graph, "COL", "HOSP");
    expect(result).toEqual({
      status: "found",
      path: ["COL", "STN", "HOSP"],
      roadIds: ["COL-STN", "STN-HOSP"],
      totalMinutes: 12,
    });
  });

  it("accident near Station: COL -> HOSP via Park, 20 minutes", () => {
    const conditions = withOverrides({
      "MKT-HOSP": { kind: "traffic", level: "severe" },
      "STN-HOSP": { kind: "accident" },
    });
    const graph = buildGraph(LOCATIONS, ROADS, conditions);
    const result = dijkstra(graph, "COL", "HOSP");
    expect(result).toEqual({
      status: "found",
      path: ["COL", "MKT", "PARK", "HOSP"],
      roadIds: ["COL-MKT", "MKT-PARK", "PARK-HOSP"],
      totalMinutes: 20,
    });
  });

  it("airport cut off: COL -> AIR is unreachable", () => {
    const conditions = withOverrides({
      "SCH-AIR": { kind: "closed" },
      "POL-AIR": { kind: "closed" },
      "TECH-AIR": { kind: "closed" },
    });
    const graph = buildGraph(LOCATIONS, ROADS, conditions);
    const result = dijkstra(graph, "COL", "AIR");
    expect(result).toEqual({ status: "unreachable" });
  });

  it("same location: COL -> COL", () => {
    const graph = buildGraph(LOCATIONS, ROADS, allLow());
    const result = dijkstra(graph, "COL", "COL");
    expect(result).toEqual({ status: "same-location" });
  });

  it("stepper's final done.result equals dijkstra() for all 4 scenarios", () => {
    const scenarios: { source: string; target: string; conditions: Conditions }[] = [
      { source: "COL", target: "HOSP", conditions: allLow() },
      {
        source: "COL",
        target: "HOSP",
        conditions: withOverrides({ "MKT-HOSP": { kind: "traffic", level: "severe" } }),
      },
      {
        source: "COL",
        target: "HOSP",
        conditions: withOverrides({
          "MKT-HOSP": { kind: "traffic", level: "severe" },
          "STN-HOSP": { kind: "accident" },
        }),
      },
      {
        source: "COL",
        target: "AIR",
        conditions: withOverrides({
          "SCH-AIR": { kind: "closed" },
          "POL-AIR": { kind: "closed" },
          "TECH-AIR": { kind: "closed" },
        }),
      },
    ];

    for (const scenario of scenarios) {
      const graph = buildGraph(LOCATIONS, ROADS, scenario.conditions);
      const instant = dijkstra(graph, scenario.source, scenario.target);

      let stepped;
      for (const step of dijkstraSteps(graph, scenario.source, scenario.target)) {
        if (step.type === "done") stepped = step.result;
      }

      expect(stepped).toEqual(instant);
    }
  });
});
