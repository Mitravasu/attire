import { Request, Response } from "express";
import { CreateOutfitInput, UpdateOutfitInput } from "../models/outfit.js";
import {
  createOutfit,
  deleteOutfit,
  listOutfits,
  updateOutfit,
} from "../services/outfitService.js";

export function listOutfitsController(_request: Request, response: Response) {
  const q =
    typeof _request.query.q === "string" ? _request.query.q : undefined;
  const page = Number(_request.query.page ?? 1);
  const pageSize = Number(_request.query.pageSize ?? 12);

  response.json(
    listOutfits({
      q,
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 12,
    }),
  );
}

export function createOutfitController(request: Request, response: Response) {
  const body = request.body as Partial<CreateOutfitInput>;
  const validation = validateOutfitPayload(body);

  if ("error" in validation) {
    response.status(400).json({ error: validation.error });
    return;
  }

  response.status(201).json(createOutfit(validation.value));
}

function validateOutfitPayload(
  body: Partial<CreateOutfitInput | UpdateOutfitInput>,
) {
  const name = body.name?.trim();
  const itemIds =
    Array.isArray(body.itemIds) &&
    body.itemIds.every((itemId) => typeof itemId === "string" && itemId.trim())
      ? body.itemIds
      : [];

  if (!name) {
    return { error: "Outfit name is required." };
  }

  if (!itemIds.length) {
    return { error: "At least one inventory item is required." };
  }

  return {
    value: {
      name,
      itemIds,
    },
  };
}

export function updateOutfitController(request: Request, response: Response) {
  const id = request.params.id;

  if (typeof id !== "string") {
    response.status(400).json({ error: "Outfit id is required." });
    return;
  }

  const body = request.body as Partial<UpdateOutfitInput>;
  const validation = validateOutfitPayload(body);

  if ("error" in validation) {
    response.status(400).json({ error: validation.error });
    return;
  }

  const outfit = updateOutfit(id, validation.value);

  if (!outfit) {
    response.status(404).json({ error: "Outfit not found." });
    return;
  }

  response.json(outfit);
}

export function deleteOutfitController(request: Request, response: Response) {
  const id = request.params.id;

  if (typeof id !== "string") {
    response.status(400).json({ error: "Outfit id is required." });
    return;
  }

  const outfit = deleteOutfit(id);

  if (!outfit) {
    response.status(404).json({ error: "Outfit not found." });
    return;
  }

  response.json(outfit);
}
