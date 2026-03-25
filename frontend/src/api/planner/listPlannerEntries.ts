import { apiRequest } from "api/client";
import { PlannerEntry } from "types/planner";

type ListPlannerEntriesParams = {
  start: string;
  end: string;
};

export function listPlannerEntries({
  start,
  end,
}: ListPlannerEntriesParams) {
  return apiRequest<PlannerEntry[]>("/planner", {
    query: {
      start,
      end,
    },
  });
}

