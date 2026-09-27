import { describe, expect, it } from "vitest";
import { simulationReducer } from "./reducer";
import { initialState } from "./state";

function loadNormalAndStart() {
  let state = simulationReducer(initialState, { type: "loadScenario", scenarioId: "normal" });
  state = simulationReducer(state, { type: "startStepper" });
  return state;
}

describe("stepper", () => {
  it("visits nodes in non-decreasing dist order", () => {
    const state = loadNormalAndStart();
    expect(state.stepper).not.toBeNull();

    const dists: number[] = [];
    for (const step of state.stepper!.steps) {
      if (step.type === "visit") dists.push(step.dist[step.node]);
    }

    for (let i = 1; i < dists.length; i++) {
      expect(dists[i]).toBeGreaterThanOrEqual(dists[i - 1]);
    }
  });

  it("final step's done.result equals the instant RoutePanel result", () => {
    const state = loadNormalAndStart();
    const steps = state.stepper!.steps;
    const last = steps[steps.length - 1];
    expect(last.type).toBe("done");
    if (last.type === "done") {
      expect(last.result).toEqual(state.route);
    }
  });

  it("stepNext/stepPrev move the index and clamp at the bounds", () => {
    let state = loadNormalAndStart();
    const total = state.stepper!.steps.length;

    state = simulationReducer(state, { type: "stepPrev" });
    expect(state.stepper!.index).toBe(0);

    for (let i = 0; i < total + 3; i++) {
      state = simulationReducer(state, { type: "stepNext" });
    }
    expect(state.stepper!.index).toBe(total - 1);

    state = simulationReducer(state, { type: "stepPrev" });
    expect(state.stepper!.index).toBe(total - 2);
  });

  it("exitStepper clears the stepper", () => {
    let state = loadNormalAndStart();
    state = simulationReducer(state, { type: "exitStepper" });
    expect(state.stepper).toBeNull();
  });

  it("changing a condition while stepping invalidates the stepper", () => {
    let state = loadNormalAndStart();
    expect(state.stepper).not.toBeNull();
    state = simulationReducer(state, {
      type: "setCondition",
      roadId: "MKT-HOSP",
      condition: { kind: "traffic", level: "severe" },
    });
    expect(state.stepper).toBeNull();
  });
});
