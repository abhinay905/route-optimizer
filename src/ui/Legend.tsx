const CONDITION_LEGEND: { label: string; colour: string; width: number; dash?: string }[] = [
  { label: "Low traffic", colour: "#22c55e", width: 3 },
  { label: "Medium traffic", colour: "#eab308", width: 5 },
  { label: "High traffic", colour: "#f97316", width: 7 },
  { label: "Severe traffic", colour: "#ef4444", width: 9 },
  { label: "Accident (⚠)", colour: "#a855f7", width: 9 },
  { label: "Closed", colour: "#9ca3af", width: 3, dash: "6 6" },
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
          <span className="legend-swatch legend-route" /> Current route
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
