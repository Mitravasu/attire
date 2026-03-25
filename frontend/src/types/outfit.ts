import { InventoryItem } from "./inventory";

export type Outfit = {
  id: string;
  name: string;
  items: InventoryItem[];
  createdAt: string;
  updatedAt: string;
};

