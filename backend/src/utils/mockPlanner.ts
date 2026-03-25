import { PlannerEntryRecord } from "../models/planner.js";

export const mockPlannerEntries: PlannerEntryRecord[] = [
  {
    id: "planner-seed-1",
    date: "2026-03-23",
    outfitId: "outfit-seed-1",
    notes: "Client presentation",
    createdAt: "2026-03-20T10:00:00.000Z",
    updatedAt: "2026-03-20T10:00:00.000Z",
  },
  {
    id: "planner-seed-2",
    date: "2026-03-24",
    outfitId: "outfit-seed-3",
    notes: "Travel day",
    createdAt: "2026-03-20T11:00:00.000Z",
    updatedAt: "2026-03-20T11:00:00.000Z",
  },
  {
    id: "planner-seed-3",
    date: "2026-03-27",
    outfitId: "outfit-seed-2",
    createdAt: "2026-03-21T09:00:00.000Z",
    updatedAt: "2026-03-21T09:00:00.000Z",
  },
];

