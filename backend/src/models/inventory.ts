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

export type InventoryListResponse = {
  items: InventoryItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

export type InventoryFilterOptions = {
  statuses: InventoryStatus[];
  colors: string[];
  types: InventoryType[];
};

export type CreateInventoryInput = {
  title: string;
  tags: string[];
  color: string;
  type: InventoryType;
  status: InventoryStatus;
  frontImageUrl: string;
  backImageUrl?: string;
};

export type UpdateInventoryInput = CreateInventoryInput;
