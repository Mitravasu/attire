import { apiRequest } from "api/client";
import { InventoryItem, InventoryStatus, InventoryType } from "types/inventory";

export type UpdateInventoryPayload = {
  title: string;
  tags: string[];
  color: string;
  type: InventoryType;
  status: InventoryStatus;
  frontImageUrl: string;
  backImageUrl?: string;
};

export function updateInventoryItem(id: string, payload: UpdateInventoryPayload) {
  return apiRequest<InventoryItem>(`/inventory/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

