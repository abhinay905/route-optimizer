import { ROADS } from "../data/network";
import type { TrafficLevel } from "../domain/graph/types";
import type { Action, SimulationState } from "../simulation/state";

interface RoadConditionPickerProps {
  state: SimulationState;
  dispatch: (action: Action) => void;
}

const TRAFFIC_LEVELS: TrafficLevel[] = ["low", "medium", "high", "severe"];

export function RoadConditionPicker({ state, dispatch }: RoadConditionPickerProps) {
  const roadId = state.selectedRoadId;
  if (!roadId) {
    return <p className="hint">Click a road on the map to set its condition.</p>;
  }

  const road = ROADS.find((candidate) => candidate.id === roadId);
  if (!road) return null;

  return (
    <div className="road-condition-picker">
      <h3>
        {road.from} {"–"} {road.to}
      </h3>
      <div className="condition-buttons">
        {TRAFFIC_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => dispatch({ type: "setCondition", roadId, condition: { kind: "traffic", level } })}
          >
            {level}
          </button>
        ))}
        <button
          type="button"
          onClick={() => dispatch({ type: "setCondition", roadId, condition: { kind: "accident" } })}
        >
          accident
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "setCondition", roadId, condition: { kind: "closed" } })}
        >
          closed
        </button>
      </div>
    </div>
  );
}
