import { LOCATIONS, ROADS } from "../data/network";
import type { LocationId, RoadId } from "../domain/graph/types";
import type { Action, SimulationState } from "../simulation/state";
import { conditionStyle } from "./conditionStyle";
import { findLatestVisit } from "./StepperPanel";

interface CityMapProps {
  state: SimulationState;
  dispatch: (action: Action) => void;
}

const LOCATION_BY_ID = new Map(LOCATIONS.map((location) => [location.id, location]));

function pillWidth(text: string, charWidth: number, padding: number): number {
  return Math.max(text.length * charWidth + padding, padding + charWidth);
}

function Badge({ x, y, text }: { x: number; y: number; text: string }) {
  const width = pillWidth(text, 9, 16);
  const height = 22;
  return (
    <g>
      <rect
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        rx={height / 2}
        className="road-badge"
      />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" className="road-label">
        {text}
      </text>
    </g>
  );
}

export function CityMap({ state, dispatch }: CityMapProps) {
  const routeRoadIds = new Set<RoadId>(state.route?.status === "found" ? state.route.roadIds : []);
  const routeKey = state.route?.status === "found" ? state.route.roadIds.join("-") : "none";
  const blockingSet = new Set(state.blockingClosures);

  const stepper = state.stepper;
  const currentStep = stepper ? stepper.steps[stepper.index] : null;
  const visit = stepper ? findLatestVisit(stepper.steps, stepper.index) : null;
  const visitedSet = new Set<LocationId>(visit?.visited ?? []);
  const currentNode: LocationId | null =
    currentStep?.type === "visit" || currentStep?.type === "skip-stale"
      ? currentStep.node
      : currentStep?.type === "relax"
        ? currentStep.from
        : null;
  const relaxStep = currentStep?.type === "relax" ? currentStep : null;

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
      <defs>
        <pattern
          id="accident-hatch"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="6" height="6" fill="var(--accident)" />
          <line x1="0" y1="0" x2="0" y2="6" stroke="#ffffff" strokeWidth="2" opacity="0.5" />
        </pattern>
      </defs>

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
        const coreColour = isBlocking ? "var(--severe)" : style.hatch ? "url(#accident-hatch)" : style.colour;
        const routeLength = Math.hypot(to.x - from.x, to.y - from.y);

        const badgeText =
          (minutes === null || minutes === undefined ? "✕" : String(Math.round(minutes))) +
          (style.label ? ` ${style.label}` : "");

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
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="var(--road-casing)"
              strokeWidth={style.width + 4}
              strokeLinecap="round"
            />
            <line
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={coreColour}
              strokeWidth={style.width}
              strokeDasharray={style.dash ?? undefined}
              strokeLinecap="round"
              className={isSelected ? "road-line road-selected" : "road-line"}
              onClick={() => handleRoadClick(road.id)}
            />
            {isOnRoute && (
              <g key={routeKey}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="var(--route-halo)"
                  strokeWidth={style.width + 10}
                  strokeLinecap="round"
                  opacity={0.9}
                />
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="var(--route)"
                  strokeWidth={style.width + 4}
                  strokeLinecap="round"
                  className="route-draw"
                  style={{ strokeDasharray: routeLength, strokeDashoffset: routeLength }}
                />
              </g>
            )}
            {relaxStep?.roadId === road.id && (
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={relaxStep.improved ? "var(--low)" : "var(--ink-soft)"}
                strokeWidth={style.width + 10}
                strokeLinecap="round"
                opacity={0.6}
                className="relax-flash"
              />
            )}
            <Badge x={midX} y={midY - 10} text={badgeText} />
          </g>
        );
      })}

      {LOCATIONS.map((location) => {
        const isSource = state.source === location.id;
        const isDestination = state.destination === location.id;
        const isVisited = visitedSet.has(location.id);
        const isCurrent = currentNode === location.id;
        const labelWidth = pillWidth(location.name, 7.5, 14);

        const classes = ["location-dot"];
        if (isVisited) classes.push("location-visited");
        if (isSource) classes.push("location-source");
        if (isDestination) classes.push("location-destination");
        if (isCurrent) classes.push("location-current");

        return (
          <g
            key={location.id}
            onClick={() => handleLocationClick(location.id)}
            className="location"
          >
            <circle cx={location.x} cy={location.y} r={18} className={classes.join(" ")} />
            {(isSource || isDestination) && (
              <text
                x={location.x}
                y={location.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="location-glyph"
              >
                {isSource ? "A" : "B"}
              </text>
            )}
            <rect
              x={location.x - labelWidth / 2}
              y={location.y + 22}
              width={labelWidth}
              height={20}
              rx={10}
              className="location-label-pill"
            />
            <text x={location.x} y={location.y + 32} textAnchor="middle" dominantBaseline="central" className="location-label">
              {location.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
