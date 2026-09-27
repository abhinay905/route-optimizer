import { LOCATIONS } from "../data/network";
import type { SimulationState } from "../simulation/state";

interface RoutePanelProps {
  state: SimulationState;
}

const NAME_BY_ID = new Map(LOCATIONS.map((location) => [location.id, location.name]));

export function RoutePanel({ state }: RoutePanelProps) {
  if (!state.source || !state.destination) {
    return <p className="route-panel">Select a source and a destination.</p>;
  }

  const route = state.route;
  if (!route) {
    return <p className="route-panel">Select a destination.</p>;
  }

  switch (route.status) {
    case "same-location":
      return <p className="route-panel">You're already there (0 min).</p>;
    case "unreachable":
      return (
        <div className="route-panel">
          <p>No route available.</p>
          {state.blockingClosures.length > 0 && (
            <p className="blocking-closures">
              Reopening any of these roads would help: {state.blockingClosures.join(", ")}
            </p>
          )}
        </div>
      );
    case "found":
      return (
        <div className="route-panel">
          <p className="route-path">{route.path.map((id) => NAME_BY_ID.get(id)).join(" → ")}</p>
          <p className="route-minutes">{route.totalMinutes} min</p>
        </div>
      );
  }
}
