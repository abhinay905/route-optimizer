import { describe, expect, it } from "vitest";
import { simulationReducer } from "../../simulation/reducer";
import { initialState } from "../../simulation/state";

describe("explainRouteChange", () => {
  it("rush hour: old route re-costs to 5 + 24 = 29 vs new route 12, cause MKT-HOSP", () => {
    let state = simulationReducer(initialState, { type: "setSource", id: "COL" });
    state = simulationReducer(state, { type: "setDestination", id: "HOSP" });

    state = simulationReducer(state, {
      type: "setCondition",
      roadId: "MKT-HOSP",
      condition: { kind: "traffic", level: "severe" },
    });

    expect(state.lastChange).not.toBeNull();
    const change = state.lastChange!;

    expect(change.before.path).toEqual(["COL", "MKT", "HOSP"]);
    expect(change.before.totalMinutesNow).toBe(5 + 24);

    expect(change.after).toEqual({
      status: "found",
      path: ["COL", "STN", "HOSP"],
      roadIds: ["COL-STN", "STN-HOSP"],
      totalMinutes: 12,
    });

    expect(change.causes).toEqual([{ roadId: "MKT-HOSP", oldMinutes: 6, newMinutes: 24 }]);
  });
});
