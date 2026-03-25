import { apiRequest } from "api/client";
import { PlannerEntry } from "types/planner";

export function deletePlannerEntry(id: string) {
  return apiRequest<PlannerEntry>(`/planner/${id}`, {
    method: "DELETE",
  });
}

