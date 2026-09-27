import { LOCATIONS } from "../data/network";
import type { DijkstraStep } from "../domain/routing/dijkstra";
import type { Action, SimulationState } from "../simulation/state";

interface StepperPanelProps {
  state: SimulationState;
  dispatch: (action: Action) => void;
}

const NAME_BY_ID = new Map(LOCATIONS.map((location) => [location.id, location.name]));

function nodeName(id: string): string {
  return NAME_BY_ID.get(id) ?? id;
}

export function findLatestVisit(steps: DijkstraStep[], index: number) {
  for (let i = index; i >= 0; i--) {
    const step = steps[i];
    if (step.type === "visit") return step;
  }
  return null;
}

function describeStep(step: DijkstraStep): string {
  switch (step.type) {
    case "visit":
      return `Visit ${nodeName(step.node)} (dist ${step.dist[step.node]})`;
    case "relax": {
      const oldText = step.oldDist === Infinity ? "∞" : step.oldDist;
      const verdict = step.improved ? "— improved" : "— no change";
      return `Relax ${step.roadId}: ${nodeName(step.from)} -> ${nodeName(step.to)} (${oldText} -> ${step.newDist}) ${verdict}`;
    }
    case "skip-stale":
      return `Skip stale entry for ${nodeName(step.node)}`;
    case "done":
      if (step.result.status === "found") {
        return `Done: ${step.result.path.map(nodeName).join(" → ")} (${step.result.totalMinutes} min)`;
      }
      if (step.result.status === "unreachable") return "Done: unreachable";
      return "Done: same location";
  }
}

export function StepperPanel({ state, dispatch }: StepperPanelProps) {
  if (!state.stepper) {
    if (!state.source || !state.destination) return null;
    return (
      <div className="stepper-panel">
        <button type="button" onClick={() => dispatch({ type: "startStepper" })}>
          Step through Dijkstra
        </button>
      </div>
    );
  }

  const { steps, index } = state.stepper;
  const currentStep = steps[index];
  const visit = findLatestVisit(steps, index);

  return (
    <div className="stepper-panel">
      <div className="stepper-controls">
        <button type="button" onClick={() => dispatch({ type: "stepPrev" })} disabled={index === 0}>
          Prev
        </button>
        <span>
          Step {index + 1} / {steps.length}
        </span>
        <button
          type="button"
          onClick={() => dispatch({ type: "stepNext" })}
          disabled={index === steps.length - 1}
        >
          Next
        </button>
        <button type="button" onClick={() => dispatch({ type: "exitStepper" })}>
          Exit
        </button>
      </div>
      <p className="stepper-current">{describeStep(currentStep)}</p>
      {visit && (
        <table className="dist-table">
          <thead>
            <tr>
              <th>Node</th>
              <th>Dist</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(visit.dist).map(([node, dist]) => (
              <tr key={node}>
                <td>{nodeName(node)}</td>
                <td>{dist === Infinity ? "∞" : dist}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {visit && (
        <ul className="queue-list">
          {visit.queue.map((entry) => (
            <li key={`${entry.node}-${entry.dist}-${entry.hops}`}>
              {nodeName(entry.node)}: {entry.dist} ({entry.hops} hops)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
