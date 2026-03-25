import { apiRequest } from "api/client";
import { InventoryItem } from "types/inventory";

export function deleteInventoryItem(id: string) {
  return apiRequest<InventoryItem>(`/inventory/${id}`, {
    method: "DELETE",
  });
}

