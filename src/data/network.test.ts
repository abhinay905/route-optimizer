import { describe, expect, it } from "vitest";
import { LOCATIONS, ROADS } from "./network";

describe("network data sanity", () => {
  it("has 11 locations and 19 roads", () => {
    expect(LOCATIONS).toHaveLength(11);
    expect(ROADS).toHaveLength(19);
  });

  it("every road references existing locations", () => {
    const ids = new Set(LOCATIONS.map((location) => location.id));
    for (const road of ROADS) {
      expect(ids.has(road.from)).toBe(true);
      expect(ids.has(road.to)).toBe(true);
    }
  });

  it("every road's baseMinutes is a positive integer", () => {
    for (const road of ROADS) {
      expect(Number.isInteger(road.baseMinutes)).toBe(true);
      expect(road.baseMinutes).toBeGreaterThan(0);
    }
  });
});
