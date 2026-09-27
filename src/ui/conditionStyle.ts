import type { RoadCondition } from "../domain/graph/types";

export interface ConditionStyle {
  colour: string;
  width: number;
  dash: string | null;
  label: string | null;
  hatch: boolean;
}

export function conditionStyle(condition: RoadCondition): ConditionStyle {
  if (condition.kind === "closed") {
    return { colour: "var(--closed)", width: 3, dash: "6 6", label: null, hatch: false };
  }
  if (condition.kind === "accident") {
    return { colour: "var(--accident)", width: 9, dash: null, label: "⚠", hatch: true };
  }
  switch (condition.level) {
    case "low":
      return { colour: "var(--low)", width: 3, dash: null, label: null, hatch: false };
    case "medium":
      return { colour: "var(--medium)", width: 5, dash: null, label: null, hatch: false };
    case "high":
      return { colour: "var(--high)", width: 7, dash: null, label: null, hatch: false };
    case "severe":
      return { colour: "var(--severe)", width: 9, dash: null, label: null, hatch: false };
  }
}
