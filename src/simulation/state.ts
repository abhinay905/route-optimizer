import type { Conditions, LocationId, RoadCondition, RoadId } from "../domain/graph/types";
import type { DijkstraStep, RouteResult } from "../domain/routing/dijkstra";
import { currentWeights } from "../domain/graph/buildGraph";
import { ROADS } from "../data/network";

// Canonical home is domain/routing/explainRouteChange.ts (built in Step 7); declared here
// because SimulationState needs the shape before that module exists.
export interface RouteChange {
  before: { path: LocationId[]; totalMinutesNow: number | null };
  after: RouteResult;
  causes: { roadId: RoadId; oldMinutes: number | null; newMinutes: number | null }[];
}

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

function defaultConditions(): Conditions {
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
