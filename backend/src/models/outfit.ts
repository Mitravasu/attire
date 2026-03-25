import { InventoryItem } from "./inventory.js";

export type Outfit = {
  id: string;
  name: string;
  itemIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateOutfitInput = {
  name: string;
  itemIds: string[];
};

export type UpdateOutfitInput = CreateOutfitInput;

export type OutfitView = {
  id: string;
  name: string;
  items: InventoryItem[];
  createdAt: string;
  updatedAt: string;
};

export type OutfitListResponse = {
  items: OutfitView[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};
