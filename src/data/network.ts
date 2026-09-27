import type { Location, Road } from "../domain/graph/types";

export const LOCATIONS: Location[] = [
  { id: "COL", name: "AIT College", kind: "college", x: 100, y: 300 },
  { id: "MKT", name: "Market", kind: "market", x: 300, y: 180 },
  { id: "STN", name: "Railway Station", kind: "station", x: 300, y: 420 },
  { id: "HOSP", name: "City Hospital", kind: "hospital", x: 520, y: 300 },
  { id: "BUS", name: "Bus Depot", kind: "bus", x: 100, y: 90 },
  { id: "PARK", name: "Central Park", kind: "park", x: 520, y: 80 },
  { id: "MALL", name: "City Mall", kind: "mall", x: 750, y: 160 },
  { id: "TECH", name: "IT Park", kind: "itpark", x: 920, y: 300 },
  { id: "SCH", name: "School", kind: "school", x: 750, y: 440 },
  { id: "POL", name: "Police Station", kind: "police", x: 520, y: 520 },
  { id: "AIR", name: "Airport", kind: "airport", x: 920, y: 520 },
];

// 19 roads, base minutes — DOC3 §3.6. Never change these numbers: tests and the demo script depend on them.
export const ROADS: Road[] = [
  { id: "COL-MKT", from: "COL", to: "MKT", baseMinutes: 5 },
  { id: "MKT-HOSP", from: "MKT", to: "HOSP", baseMinutes: 6 },
  { id: "COL-STN", from: "COL", to: "STN", baseMinutes: 8 },
  { id: "STN-HOSP", from: "STN", to: "HOSP", baseMinutes: 4 },
  { id: "COL-BUS", from: "COL", to: "BUS", baseMinutes: 6 },
  { id: "BUS-MKT", from: "BUS", to: "MKT", baseMinutes: 7 },
  { id: "BUS-PARK", from: "BUS", to: "PARK", baseMinutes: 12 },
  { id: "MKT-PARK", from: "MKT", to: "PARK", baseMinutes: 8 },
  { id: "PARK-HOSP", from: "PARK", to: "HOSP", baseMinutes: 7 },
  { id: "PARK-MALL", from: "PARK", to: "MALL", baseMinutes: 9 },
  { id: "HOSP-MALL", from: "HOSP", to: "MALL", baseMinutes: 10 },
  { id: "HOSP-SCH", from: "HOSP", to: "SCH", baseMinutes: 9 },
  { id: "HOSP-POL", from: "HOSP", to: "POL", baseMinutes: 7 },
  { id: "STN-POL", from: "STN", to: "POL", baseMinutes: 9 },
  { id: "MALL-TECH", from: "MALL", to: "TECH", baseMinutes: 6 },
  { id: "SCH-TECH", from: "SCH", to: "TECH", baseMinutes: 8 },
  { id: "SCH-AIR", from: "SCH", to: "AIR", baseMinutes: 7 },
  { id: "POL-AIR", from: "POL", to: "AIR", baseMinutes: 12 },
  { id: "TECH-AIR", from: "TECH", to: "AIR", baseMinutes: 10 },
];
