const CONDITION_LEGEND: { label: string; colour: string; width: number; dash?: string }[] = [
  { label: "Low traffic", colour: "var(--low)", width: 3 },
  { label: "Medium traffic", colour: "var(--medium)", width: 5 },
  { label: "High traffic", colour: "var(--high)", width: 7 },
  { label: "Severe traffic", colour: "var(--severe)", width: 9 },
  { label: "Accident (⚠)", colour: "url(#accident-hatch)", width: 9 },
  { label: "Closed (✕)", colour: "var(--closed)", width: 3, dash: "6 6" },
];

export function Legend() {
  return (
    <div className="legend">
      <h3>Legend</h3>
      <ul className="legend-conditions">
        {CONDITION_LEGEND.map((item) => (
          <li key={item.label}>
            <svg width="40" height="14" aria-hidden="true">
              <line
                x1={2}
                y1={7}
                x2={38}
                y2={7}
                stroke="var(--road-casing)"
                strokeWidth={item.width + 4}
                strokeLinecap="round"
              />
              <line
                x1={2}
                y1={7}
                x2={38}
                y2={7}
                stroke={item.colour}
                strokeWidth={item.width}
                strokeDasharray={item.dash}
                strokeLinecap="round"
              />
            </svg>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
      <ul className="legend-secondary">
        <li>
          <svg width="40" height="14" aria-hidden="true">
            <line x1={2} y1={7} x2={38} y2={7} stroke="var(--route-halo)" strokeWidth={13} strokeLinecap="round" />
            <line x1={2} y1={7} x2={38} y2={7} stroke="var(--route)" strokeWidth={7} strokeLinecap="round" />
          </svg>
          Current route
        </li>
        <li>
          <span className="legend-swatch legend-blocking" /> Blocking closure
        </li>
        <li>
          <span className="legend-dot legend-visited" /> Visited (stepper)
        </li>
        <li>
          <span className="legend-dot legend-current" /> Current node (stepper)
        </li>
      </ul>
    </div>
  );
}
