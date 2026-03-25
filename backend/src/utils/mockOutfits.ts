import { Outfit } from "../models/outfit.js";
import { mockInventory } from "./mockInventory.js";

const seededOutfitDefinitions = [
  {
    name: "Monday Office Uniform",
    itemIds: ["item-1", "item-3", "item-2", "item-8"],
  },
  {
    name: "Weekend Coffee Run",
    itemIds: ["item-5", "item-7", "item-4"],
  },
  {
    name: "Carry-On Capsule",
    itemIds: ["item-10", "item-3", "item-6", "item-8", "item-9"],
  },
];

export const mockOutfits: Outfit[] = seededOutfitDefinitions
  .map((definition, index) => {
    const createdAt = new Date(2026, 2, index + 1).toISOString();
    const updatedAt = new Date(2026, 2, index + 6).toISOString();
    const itemIds = definition.itemIds.filter((itemId) =>
      mockInventory.some((item) => item.id === itemId),
    );

    return {
      id: `outfit-seed-${index + 1}`,
      name: definition.name,
      itemIds,
      createdAt,
      updatedAt,
    };
  })
  .filter((outfit) => outfit.itemIds.length > 0);
