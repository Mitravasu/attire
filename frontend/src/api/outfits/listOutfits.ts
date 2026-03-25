import { apiRequest } from "api/client";
import { PaginatedResponse } from "types/api";
import { Outfit } from "types/outfit";

type ListOutfitsParams = {
  q?: string;
  page?: number;
  pageSize?: number;
};

export function listOutfits({
  q,
  page = 1,
  pageSize = 12,
}: ListOutfitsParams = {}) {
  return apiRequest<PaginatedResponse<Outfit>>("/outfits", {
    query: {
      q,
      page,
      pageSize,
    },
  });
}
