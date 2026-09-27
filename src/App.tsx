import { useReducer } from "react";
import { simulationReducer } from "./simulation/reducer";
import { initialState } from "./simulation/state";
import { CityMap } from "./ui/CityMap";
import { ControlPanel } from "./ui/ControlPanel";
import { RoadConditionPicker } from "./ui/RoadConditionPicker";
import { RoutePanel } from "./ui/RoutePanel";
import "./ui/styles.css";

function App() {
  const [state, dispatch] = useReducer(simulationReducer, initialState);

  return (
    <div className="app">
      <CityMap state={state} dispatch={dispatch} />
      <aside className="panels">
        <ControlPanel state={state} dispatch={dispatch} />
        <RoadConditionPicker state={state} dispatch={dispatch} />
        <RoutePanel state={state} />
      </aside>
    </div>
  );
}

export default App;
