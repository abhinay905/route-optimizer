import { LOCATIONS, ROADS } from "../data/network";
import type { LocationId } from "../domain/graph/types";
import type { SimulationState } from "../simulation/state";

interface ExplainerPanelProps {
  state: SimulationState;
}

const NAME_BY_ID = new Map(LOCATIONS.map((location) => [location.id, location.name]));

function roadBetween(a: LocationId, b: LocationId) {
  return ROADS.find((road) => (road.from === a && road.to === b) || (road.from === b && road.to === a));
}

export function ExplainerPanel({ state }: ExplainerPanelProps) {
  const change = state.lastChange;
  if (!change) return null;

  const legMinutes: (number | null)[] = [];
  for (let i = 0; i < change.before.path.length - 1; i++) {
    const road = roadBetween(change.before.path[i], change.before.path[i + 1]);
    const minutes = road ? state.weightsAtRoute[road.id] : undefined;
    legMinutes.push(minutes === undefined ? null : minutes);
  }

  const oldBreakdown = legMinutes.map((m) => (m === null ? "✕" : Math.round(m))).join(" + ");
  const oldTotal = change.before.totalMinutesNow === null ? "blocked" : Math.round(change.before.totalMinutesNow);
  const oldPathText = change.before.path.map((id) => NAME_BY_ID.get(id)).join(" → ");

  const newText =
    change.after.status === "found"
      ? `${Math.round(change.after.totalMinutes)}`
      : change.after.status === "unreachable"
        ? "unreachable"
        : "same location (0)";

  return (
    <div className="explainer-panel">
      <p className="explainer-old">
        Old route ({oldPathText}): {oldBreakdown} = {oldTotal}
      </p>
      <p className="explainer-new">New route: {newText}</p>
      {change.causes.length > 0 && (
        <p className="explainer-causes">Cause: {change.causes.map((cause) => cause.roadId).join(", ")}</p>
      )}
    </div>
  );
}
