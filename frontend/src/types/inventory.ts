export type InventoryStatus = "clean" | "laundry" | "archived";

export type InventoryType =
  | "top"
  | "bottom"
  | "outerwear"
  | "shoes"
  | "accessory";

export type InventoryItem = {
  id: string;
  title: string;
  tags: string[];
  color: string;
  type: InventoryType;
  status: InventoryStatus;
  favorite: boolean;
  frontImageUrl: string;
  backImageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type InventoryFilters = {
  status: InventoryStatus | "";
  color: string;
  type: InventoryType | "";
  favorite: boolean;
};

