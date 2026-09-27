import { LOCATIONS, ROADS } from "../data/network";
import { SCENARIOS } from "../data/scenarios";
import { buildGraph, currentWeights } from "../domain/graph/buildGraph";
import { dijkstra, dijkstraSteps } from "../domain/routing/dijkstra";
import { explainRouteChange } from "../domain/routing/explainRouteChange";
import { findBlockingClosures } from "../domain/routing/reachability";
import type { Action, SimulationState } from "./state";
import { defaultConditions, initialState } from "./state";

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
  const lastChange = state.route
    ? explainRouteChange(state.route, route, state.weightsAtRoute, weightsAtRoute)
    : null;
  const blockingClosures =
    route.status === "unreachable"
      ? findBlockingClosures(LOCATIONS, ROADS, state.conditions, state.source, state.destination)
      : [];

  return {
    ...state,
    route,
    weightsAtRoute,
    lastChange,
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
    case "loadScenario": {
      const scenario = SCENARIOS.find((candidate) => candidate.id === action.scenarioId);
      if (!scenario) return state;
      const next = recompute({
        ...state,
        conditions: { ...defaultConditions(), ...scenario.overrides },
        source: scenario.source,
        destination: scenario.destination,
        activeScenarioId: scenario.id,
      });
      return { ...next, lastChange: null }; // loading a preset is not a "route change"
    }
    case "reset":
      return initialState;
    case "startStepper": {
      if (!state.source || !state.destination) return state;
      const graph = buildGraph(LOCATIONS, ROADS, state.conditions);
      const steps = Array.from(dijkstraSteps(graph, state.source, state.destination));
      return { ...state, stepper: { steps, index: 0 } };
    }
    case "stepNext": {
      if (!state.stepper) return state;
      const index = Math.min(state.stepper.index + 1, state.stepper.steps.length - 1);
      return { ...state, stepper: { ...state.stepper, index } };
    }
    case "stepPrev": {
      if (!state.stepper) return state;
      const index = Math.max(state.stepper.index - 1, 0);
      return { ...state, stepper: { ...state.stepper, index } };
    }
    case "exitStepper":
      return { ...state, stepper: null };
  }
}
