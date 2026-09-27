import { describe, expect, it } from "vitest";
import { simulationReducer } from "./reducer";
import { initialState } from "./state";

describe("simulationReducer", () => {
  it("setCondition on MKT-HOSP severe reroutes COL -> HOSP via Station", () => {
    let state = simulationReducer(initialState, { type: "setSource", id: "COL" });
    state = simulationReducer(state, { type: "setDestination", id: "HOSP" });

    expect(state.route).toEqual({
      status: "found",
      path: ["COL", "MKT", "HOSP"],
      roadIds: ["COL-MKT", "MKT-HOSP"],
      totalMinutes: 11,
    });

    state = simulationReducer(state, {
      type: "setCondition",
      roadId: "MKT-HOSP",
      condition: { kind: "traffic", level: "severe" },
    });

    expect(state.route).toEqual({
      status: "found",
      path: ["COL", "STN", "HOSP"],
      roadIds: ["COL-STN", "STN-HOSP"],
      totalMinutes: 12,
    });
  });
});
