import {
  CreateOutfitInput,
  OutfitListResponse,
  Outfit,
  OutfitView,
  UpdateOutfitInput,
} from "../models/outfit.js";
import { mockInventory } from "../utils/mockInventory.js";
import { mockOutfits } from "../utils/mockOutfits.js";

function toOutfitView(outfit: Outfit): OutfitView {
  return {
    id: outfit.id,
    name: outfit.name,
    items: outfit.itemIds
      .map((itemId) => mockInventory.find((item) => item.id === itemId))
      .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    createdAt: outfit.createdAt,
    updatedAt: outfit.updatedAt,
  };
}

export function createOutfit(input: CreateOutfitInput): Outfit {
  const timestamp = new Date().toISOString();
  const outfit: Outfit = {
    id: `outfit-${Date.now()}`,
    name: input.name,
    itemIds: input.itemIds,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  mockOutfits.unshift(outfit);

  return outfit;
}

type ListOutfitsOptions = {
  q?: string;
  page?: number;
  pageSize?: number;
};

export function listOutfits({
  q = "",
  page = 1,
  pageSize = 12,
}: ListOutfitsOptions = {}): OutfitListResponse {
  const query = q.trim().toLowerCase();
  const filteredItems = mockOutfits
    .map(toOutfitView)
    .filter((outfit) => {
      if (!query) {
        return true;
      }

      const outfitMatches = outfit.name.toLowerCase().includes(query);
      const inventoryMatches = outfit.items.some((item) => {
        const titleMatch = item.title.toLowerCase().includes(query);
        const tagMatch = item.tags.some((tag) => tag.toLowerCase().includes(query));
        return titleMatch || tagMatch;
      });

      return outfitMatches || inventoryMatches;
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

export function updateOutfit(
  id: string,
  input: UpdateOutfitInput,
): OutfitView | null {
  const outfit = mockOutfits.find((entry) => entry.id === id);

  if (!outfit) {
    return null;
  }

  outfit.name = input.name;
  outfit.itemIds = input.itemIds;
  outfit.updatedAt = new Date().toISOString();

  return toOutfitView(outfit);
}

export function deleteOutfit(id: string): OutfitView | null {
  const index = mockOutfits.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return null;
  }

  const [outfit] = mockOutfits.splice(index, 1);
  return outfit ? toOutfitView(outfit) : null;
}
