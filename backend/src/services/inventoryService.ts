import {
  CreateInventoryInput,
  InventoryFilterOptions,
  InventoryItem,
  InventoryListResponse,
  InventoryStatus,
  InventoryType,
  UpdateInventoryInput,
} from "../models/inventory.js";
import { mockInventory } from "../utils/mockInventory.js";

type ListInventoryOptions = {
  page: number;
  pageSize: number;
  status?: InventoryStatus;
  color?: string;
  type?: InventoryType;
  favorite?: boolean;
};

export function listInventory({
  page,
  pageSize,
  status,
  color,
  type,
  favorite,
}: ListInventoryOptions): InventoryListResponse {
  const filteredItems = mockInventory.filter((item) => {
    if (status && item.status !== status) {
      return false;
    }

    if (color && item.color !== color) {
      return false;
    }

    if (type && item.type !== type) {
      return false;
    }

    if (favorite !== undefined && item.favorite !== favorite) {
      return false;
    }

    return true;
  });

  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  const items = filteredItems.slice(start, start + pageSize);

  return {
    items,
    pagination: {
      page: safePage,
      pageSize,
      totalItems,
      totalPages,
    },
  };
}

export function getInventoryFilterOptions(): InventoryFilterOptions {
  const statuses = Array.from(
    new Set(mockInventory.map((item) => item.status)),
  ).sort() as InventoryStatus[];
  const colors = Array.from(new Set(mockInventory.map((item) => item.color))).sort();
  const types = Array.from(new Set(mockInventory.map((item) => item.type))).sort() as InventoryType[];

  return {
    statuses,
    colors,
    types,
  };
}

export function createInventoryItem(input: CreateInventoryInput): InventoryItem {
  const timestamp = new Date().toISOString();
  const item: InventoryItem = {
    id: `item-${Date.now()}`,
    title: input.title,
    tags: input.tags,
    color: input.color,
    type: input.type,
    status: input.status,
    favorite: false,
    frontImageUrl: input.frontImageUrl,
    backImageUrl: input.backImageUrl,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  mockInventory.unshift(item);

  return item;
}

export function updateInventoryFavorite(
  id: string,
  favorite: boolean,
): InventoryItem | null {
  const item = mockInventory.find((entry) => entry.id === id);

  if (!item) {
    return null;
  }

  item.favorite = favorite;
  item.updatedAt = new Date().toISOString();

  return item;
}

export function updateInventoryItem(
  id: string,
  input: UpdateInventoryInput,
): InventoryItem | null {
  const item = mockInventory.find((entry) => entry.id === id);

  if (!item) {
    return null;
  }

  item.title = input.title;
  item.tags = input.tags;
  item.color = input.color;
  item.type = input.type;
  item.status = input.status;
  item.frontImageUrl = input.frontImageUrl;
  item.backImageUrl = input.backImageUrl;
  item.updatedAt = new Date().toISOString();

  return item;
}

export function deleteInventoryItem(id: string): InventoryItem | null {
  const index = mockInventory.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return null;
  }

  const [removedItem] = mockInventory.splice(index, 1);
  return removedItem ?? null;
}
