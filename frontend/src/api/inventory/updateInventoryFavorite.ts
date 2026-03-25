import { apiRequest } from "api/client";
import { InventoryItem } from "types/inventory";

export function updateInventoryFavorite(id: string, favorite: boolean) {
  return apiRequest<InventoryItem>(`/inventory/${id}/favorite`, {
    method: "PATCH",
    body: JSON.stringify({ favorite }),
  });
}
