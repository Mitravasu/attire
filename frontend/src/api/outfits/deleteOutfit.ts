import { apiRequest } from "api/client";
import { Outfit } from "types/outfit";

export function deleteOutfit(id: string) {
  return apiRequest<Outfit>(`/outfits/${id}`, {
    method: "DELETE",
  });
}

