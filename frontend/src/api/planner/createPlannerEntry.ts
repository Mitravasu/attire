import { apiRequest } from "api/client";
import { PlannerEntry } from "types/planner";

type CreatePlannerEntryPayload = {
  date: string;
  outfitId: string;
};

export function createPlannerEntry(payload: CreatePlannerEntryPayload) {
  return apiRequest<PlannerEntry>("/planner", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

