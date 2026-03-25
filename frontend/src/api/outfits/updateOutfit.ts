import { apiRequest } from "api/client";
import { Outfit } from "types/outfit";

type UpdateOutfitPayload = {
  name: string;
  itemIds: string[];
};

export function updateOutfit(id: string, payload: UpdateOutfitPayload) {
  return apiRequest<Outfit>(`/outfits/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

