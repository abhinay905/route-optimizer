import { describe, expect, it } from "vitest";
import { simulationReducer } from "../simulation/reducer";
import { initialState } from "../simulation/state";
import { SCENARIOS } from "./scenarios";

function loadScenario(scenarioId: string) {
  return simulationReducer(initialState, { type: "loadScenario", scenarioId });
}

describe("scenarios", () => {
  it("normal: COL -> HOSP via Market, 11 minutes", () => {
    const state = loadScenario("normal");
    expect(state.route).toEqual({
      status: "found",
      path: ["COL", "MKT", "HOSP"],
      roadIds: ["COL-MKT", "MKT-HOSP"],
      totalMinutes: 11,
    });
  });

  it("rush: COL -> HOSP via Station, 12 minutes", () => {
    const state = loadScenario("rush");
    expect(state.route).toEqual({
      status: "found",
      path: ["COL", "STN", "HOSP"],
      roadIds: ["COL-STN", "STN-HOSP"],
      totalMinutes: 12,
    });
  });

  it("accident: COL -> HOSP via Park, 20 minutes", () => {
    const state = loadScenario("accident");
    expect(state.route).toEqual({
      status: "found",
      path: ["COL", "MKT", "PARK", "HOSP"],
      roadIds: ["COL-MKT", "MKT-PARK", "PARK-HOSP"],
      totalMinutes: 20,
    });
  });

  it("cutoff: COL -> AIR unreachable, all 3 airport roads are blocking closures", () => {
    const state = loadScenario("cutoff");
    expect(state.route).toEqual({ status: "unreachable" });
    expect(new Set(state.blockingClosures)).toEqual(new Set(["SCH-AIR", "POL-AIR", "TECH-AIR"]));
  });

  it("loading a preset never sets lastChange (not a route change)", () => {
    for (const scenario of SCENARIOS) {
      const state = loadScenario(scenario.id);
      expect(state.lastChange).toBeNull();
    }
  });
});
