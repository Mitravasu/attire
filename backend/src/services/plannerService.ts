import { OutfitView } from "../models/outfit.js";
import {
  CreatePlannerEntryInput,
  PlannerEntryView,
} from "../models/planner.js";
import { mockOutfits } from "../utils/mockOutfits.js";
import { mockPlannerEntries } from "../utils/mockPlanner.js";
import { mockInventory } from "../utils/mockInventory.js";

function toOutfitView(outfitId: string): OutfitView | null {
  const outfit = mockOutfits.find((entry) => entry.id === outfitId);

  if (!outfit) {
    return null;
  }

  return {
    id: outfit.id,
    name: outfit.name,
    items: outfit.itemIds
      .map((itemId) => mockInventory.find((item) => item.id === itemId))
      .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    createdAt: outfit.createdAt,
    updatedAt: outfit.updatedAt,
  };
}

export function listPlannerEntries(start: string, end: string): PlannerEntryView[] {
  const entries: PlannerEntryView[] = [];

  mockPlannerEntries
    .filter((entry) => entry.date >= start && entry.date <= end)
    .forEach((entry) => {
      const outfit = toOutfitView(entry.outfitId);

      if (!outfit) {
        return;
      }

      entries.push({
        id: entry.id,
        date: entry.date,
        notes: entry.notes,
        outfit,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      });
    });

  return entries;
}

export function createPlannerEntry(
  input: CreatePlannerEntryInput,
): PlannerEntryView | null {
  const outfit = toOutfitView(input.outfitId);

  if (!outfit) {
    return null;
  }

  const timestamp = new Date().toISOString();
  const entry = {
    id: `planner-${Date.now()}`,
    date: input.date,
    outfitId: input.outfitId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  mockPlannerEntries.unshift(entry);

  return {
    id: entry.id,
    date: entry.date,
    outfit,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

export function deletePlannerEntry(id: string): PlannerEntryView | null {
  const index = mockPlannerEntries.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return null;
  }

  const [entry] = mockPlannerEntries.splice(index, 1);

  if (!entry) {
    return null;
  }

  const outfit = toOutfitView(entry.outfitId);

  if (!outfit) {
    return null;
  }

  return {
    id: entry.id,
    date: entry.date,
    notes: entry.notes,
    outfit,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}
