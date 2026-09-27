import { useReducer } from "react";
import { simulationReducer } from "./simulation/reducer";
import { initialState } from "./simulation/state";
import { CityMap } from "./ui/CityMap";
import { ControlPanel } from "./ui/ControlPanel";
import { ExplainerPanel } from "./ui/ExplainerPanel";
import { Legend } from "./ui/Legend";
import { RoadConditionPicker } from "./ui/RoadConditionPicker";
import { RoutePanel } from "./ui/RoutePanel";
import { StepperPanel } from "./ui/StepperPanel";
import "./ui/styles.css";

function App() {
  const [state, dispatch] = useReducer(simulationReducer, initialState);

  return (
    <div className="app">
      <main className="map-area">
        <CityMap state={state} dispatch={dispatch} />
        <Legend />
      </main>
      <aside className="panels">
        <ControlPanel state={state} dispatch={dispatch} />
        <RoadConditionPicker state={state} dispatch={dispatch} />
        <RoutePanel state={state} />
        <ExplainerPanel state={state} />
        <StepperPanel state={state} dispatch={dispatch} />
      </aside>
    </div>
  );
}

export default App;
