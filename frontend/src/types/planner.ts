import { Outfit } from "./outfit";

export type PlannerEntry = {
  id: string;
  date: string;
  notes?: string;
  outfit: Outfit;
  createdAt: string;
  updatedAt: string;
};

