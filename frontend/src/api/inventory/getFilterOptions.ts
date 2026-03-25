import { apiRequest } from "api/client";
import { FilterOptions } from "types/filterOptions";

export function getFilterOptions() {
  return apiRequest<FilterOptions>("/inventory/filters");
}

