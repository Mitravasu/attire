import { apiRequest } from "api/client";
import { InventoryItem } from "types/inventory";
import { PaginatedResponse } from "types/api";
import { InventoryFilters } from "types/inventory";

type ListInventoryParams = {
  page: number;
  pageSize?: number;
  filters?: InventoryFilters;
};

export function listInventory({
  page,
  pageSize = 6,
  filters,
}: ListInventoryParams) {
  return apiRequest<PaginatedResponse<InventoryItem>>("/inventory", {
    query: {
      page,
      pageSize,
      status: filters?.status || undefined,
      color: filters?.color || undefined,
      type: filters?.type || undefined,
      favorite: filters?.favorite ? true : undefined,
    },
  });
}

