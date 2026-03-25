import { OutfitView } from "./outfit.js";

export type PlannerEntryRecord = {
  id: string;
  date: string;
  outfitId: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type PlannerEntryView = {
  id: string;
  date: string;
  notes?: string;
  outfit: OutfitView;
  createdAt: string;
  updatedAt: string;
};

export type CreatePlannerEntryInput = {
  date: string;
  outfitId: string;
};
