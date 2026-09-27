import { LOCATIONS, ROADS } from "../data/network";
import { buildGraph, currentWeights } from "../domain/graph/buildGraph";
import { dijkstra } from "../domain/routing/dijkstra";
import { findBlockingClosures } from "../domain/routing/reachability";
import type { Action, SimulationState } from "./state";
import { initialState } from "./state";

function recompute(state: SimulationState): SimulationState {
  const weightsAtRoute = currentWeights(ROADS, state.conditions);

  if (!state.source || !state.destination) {
    return {
      ...state,
      route: null,
      weightsAtRoute,
      lastChange: null,
      blockingClosures: [],
      stepper: null,
    };
  }

  const graph = buildGraph(LOCATIONS, ROADS, state.conditions);
  const route = dijkstra(graph, state.source, state.destination);
  const blockingClosures =
    route.status === "unreachable"
      ? findBlockingClosures(LOCATIONS, ROADS, state.conditions, state.source, state.destination)
      : [];

  return {
    ...state,
    route,
    weightsAtRoute,
    lastChange: null, // wired up in Step 7 (explainRouteChange)
    blockingClosures,
    stepper: null, // conditions changed -> any in-flight stepper is stale
  };
}

export function simulationReducer(state: SimulationState, action: Action): SimulationState {
  switch (action.type) {
    case "setSource":
      return recompute({ ...state, source: action.id });
    case "setDestination":
      return recompute({ ...state, destination: action.id });
    case "selectRoad":
      return { ...state, selectedRoadId: action.id };
    case "setCondition":
      return recompute({
        ...state,
        conditions: { ...state.conditions, [action.roadId]: action.condition },
        activeScenarioId: null,
      });
    case "loadScenario":
      // implemented in Step 7 alongside data/scenarios.ts
      return state;
    case "reset":
      return initialState;
    case "startStepper":
    case "stepNext":
    case "stepPrev":
    case "exitStepper":
      // implemented in Step 8 (StepperPanel)
      return state;
  }
}
