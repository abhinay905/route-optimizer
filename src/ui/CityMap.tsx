import { LOCATIONS, ROADS } from "../data/network";
import type { LocationId, RoadId } from "../domain/graph/types";
import type { Action, SimulationState } from "../simulation/state";
import { conditionStyle } from "./conditionStyle";

interface CityMapProps {
  state: SimulationState;
  dispatch: (action: Action) => void;
}

const LOCATION_BY_ID = new Map(LOCATIONS.map((location) => [location.id, location]));

export function CityMap({ state, dispatch }: CityMapProps) {
  const routeRoadIds = new Set<RoadId>(state.route?.status === "found" ? state.route.roadIds : []);
  const blockingSet = new Set(state.blockingClosures);

  function handleLocationClick(id: LocationId) {
    if (state.source === null) {
      dispatch({ type: "setSource", id });
    } else if (state.destination === null) {
      dispatch({ type: "setDestination", id });
    } else {
      dispatch({ type: "setSource", id });
    }
  }

  function handleRoadClick(id: RoadId) {
    dispatch({ type: "selectRoad", id: state.selectedRoadId === id ? null : id });
  }

  return (
    <svg viewBox="0 0 1000 600" role="img" aria-label="City road network" className="city-map">
      {ROADS.map((road) => {
        const from = LOCATION_BY_ID.get(road.from)!;
        const to = LOCATION_BY_ID.get(road.to)!;
        const condition = state.conditions[road.id];
        const style = conditionStyle(condition);
        const minutes = state.weightsAtRoute[road.id];
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const isOnRoute = routeRoadIds.has(road.id);
        const isBlocking = blockingSet.has(road.id);
        const isSelected = state.selectedRoadId === road.id;

        return (
          <g key={road.id} className="road">
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="transparent"
              strokeWidth={20}
              onClick={() => handleRoadClick(road.id)}
              className="road-hit-area"
            />
            {isOnRoute && (
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#2563eb"
                strokeWidth={style.width + 6}
                strokeLinecap="round"
                opacity={0.5}
              />
            )}
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={isBlocking ? "#dc2626" : style.colour}
              strokeWidth={style.width}
              strokeDasharray={style.dash ?? undefined}
              strokeLinecap="round"
              className={isSelected ? "road-line road-selected" : "road-line"}
            />
            <text x={midX} y={midY - 10} textAnchor="middle" className="road-label">
              {minutes === null || minutes === undefined ? "✕" : Math.round(minutes)}
              {style.label ? ` ${style.label}` : ""}
            </text>
          </g>
        );
      })}

      {LOCATIONS.map((location) => {
        const isSource = state.source === location.id;
        const isDestination = state.destination === location.id;

        return (
          <g
            key={location.id}
            onClick={() => handleLocationClick(location.id)}
            className="location"
          >
            <circle
              cx={location.x}
              cy={location.y}
              r={18}
              className={
                isSource ? "location-dot location-source" : isDestination ? "location-dot location-destination" : "location-dot"
              }
            />
            <text x={location.x} y={location.y + 32} textAnchor="middle" className="location-label">
              {location.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
