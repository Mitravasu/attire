import { InventoryStatus, InventoryType } from "./inventory";

export type FilterOptions = {
  statuses: InventoryStatus[];
  colors: string[];
  types: InventoryType[];
};
