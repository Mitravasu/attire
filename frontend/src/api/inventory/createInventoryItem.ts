import { apiRequest } from "api/client";
import { InventoryItem, InventoryStatus, InventoryType } from "types/inventory";

export type CreateInventoryPayload = {
  title: string;
  tags: string[];
  color: string;
  type: InventoryType;
  status: InventoryStatus;
  frontImageUrl: string;
  backImageUrl?: string;
};

export function createInventoryItem(payload: CreateInventoryPayload) {
  return apiRequest<InventoryItem>("/inventory", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
