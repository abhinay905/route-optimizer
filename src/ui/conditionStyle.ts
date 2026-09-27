import type { RoadCondition } from "../domain/graph/types";

export interface ConditionStyle {
  colour: string;
  width: number;
  dash: string | null;
  label: string | null;
}

export function conditionStyle(condition: RoadCondition): ConditionStyle {
  if (condition.kind === "closed") {
    return { colour: "#9ca3af", width: 3, dash: "6 6", label: null };
  }
  if (condition.kind === "accident") {
    return { colour: "#a855f7", width: 9, dash: null, label: "⚠" };
  }
  switch (condition.level) {
    case "low":
      return { colour: "#22c55e", width: 3, dash: null, label: null };
    case "medium":
      return { colour: "#eab308", width: 5, dash: null, label: null };
    case "high":
      return { colour: "#f97316", width: 7, dash: null, label: null };
    case "severe":
      return { colour: "#ef4444", width: 9, dash: null, label: null };
  }
}
