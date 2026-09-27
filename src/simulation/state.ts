import type { Conditions, LocationId, RoadCondition, RoadId } from "../domain/graph/types";
import type { DijkstraStep, RouteResult } from "../domain/routing/dijkstra";
import type { RouteChange } from "../domain/routing/explainRouteChange";
import { currentWeights } from "../domain/graph/buildGraph";
import { ROADS } from "../data/network";

export interface SimulationState {
  conditions: Conditions;
  source: LocationId | null;
  destination: LocationId | null;
  selectedRoadId: RoadId | null;
  route: RouteResult | null;
  weightsAtRoute: Record<RoadId, number | null>;
  lastChange: RouteChange | null;
  blockingClosures: RoadId[];
  stepper: { steps: DijkstraStep[]; index: number } | null;
  activeScenarioId: string | null;
}

export type Action =
  | { type: "setSource"; id: LocationId }
  | { type: "setDestination"; id: LocationId }
  | { type: "selectRoad"; id: RoadId | null }
  | { type: "setCondition"; roadId: RoadId; condition: RoadCondition }
  | { type: "loadScenario"; scenarioId: string }
  | { type: "reset" }
  | { type: "startStepper" }
  | { type: "stepNext" }
  | { type: "stepPrev" }
  | { type: "exitStepper" };

export function defaultConditions(): Conditions {
  const conditions: Conditions = {};
  for (const road of ROADS) {
    conditions[road.id] = { kind: "traffic", level: "low" };
  }
  return conditions;
}

const initialConditions = defaultConditions();

export const initialState: SimulationState = {
  conditions: initialConditions,
  source: null,
  destination: null,
  selectedRoadId: null,
  route: null,
  weightsAtRoute: currentWeights(ROADS, initialConditions),
  lastChange: null,
  blockingClosures: [],
  stepper: null,
  activeScenarioId: null,
};
