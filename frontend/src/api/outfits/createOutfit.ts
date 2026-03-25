import { apiRequest } from "api/client";
import { Outfit } from "types/outfit";

type CreateOutfitPayload = {
  name: string;
  itemIds: string[];
};

export function createOutfit(payload: CreateOutfitPayload) {
  return apiRequest<Outfit>("/outfits", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

