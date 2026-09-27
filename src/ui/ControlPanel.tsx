import { LOCATIONS } from "../data/network";
import type { Action, SimulationState } from "../simulation/state";

interface ControlPanelProps {
  state: SimulationState;
  dispatch: (action: Action) => void;
}

export function ControlPanel({ state, dispatch }: ControlPanelProps) {
  return (
    <div className="control-panel">
      <label>
        Source
        <select
          value={state.source ?? ""}
          onChange={(event) => dispatch({ type: "setSource", id: event.target.value })}
        >
          <option value="" disabled>
            Select source
          </option>
          {LOCATIONS.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Destination
        <select
          value={state.destination ?? ""}
          onChange={(event) => dispatch({ type: "setDestination", id: event.target.value })}
        >
          <option value="" disabled>
            Select destination
          </option>
          {LOCATIONS.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </label>
      <button type="button" onClick={() => dispatch({ type: "reset" })}>
        Reset
      </button>
    </div>
  );
}
