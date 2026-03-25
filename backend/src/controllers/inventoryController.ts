import { Request, Response } from "express";
import {
  createInventoryItem,
  deleteInventoryItem,
  getInventoryFilterOptions,
  listInventory,
  updateInventoryFavorite,
  updateInventoryItem,
} from "../services/inventoryService.js";
import {
  CreateInventoryInput,
  InventoryStatus,
  InventoryType,
  UpdateInventoryInput,
} from "../models/inventory.js";

export function listInventoryController(request: Request, response: Response) {
  const page = Number(request.query.page ?? 1);
  const pageSize = Number(request.query.pageSize ?? 6);
  const favorite = request.query.favorite;
  const status = request.query.status;
  const color = request.query.color;
  const type = request.query.type;

  response.json(
    listInventory({
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 6,
      favorite:
        favorite === "true" ? true : favorite === "false" ? false : undefined,
      status: typeof status === "string" ? (status as InventoryStatus) : undefined,
      color: typeof color === "string" ? color : undefined,
      type: typeof type === "string" ? (type as InventoryType) : undefined,
    }),
  );
}

export function inventoryFilterOptionsController(
  _request: Request,
  response: Response,
) {
  response.json(getInventoryFilterOptions());
}

function isImageDataUrl(value: unknown) {
  return typeof value === "string" && value.startsWith("data:image/");
}

function validateInventoryPayload(
  body: Partial<CreateInventoryInput | UpdateInventoryInput>,
) {
  const title = body.title?.trim();
  const color = body.color?.trim();
  const tags =
    Array.isArray(body.tags) &&
    body.tags.every((tag) => typeof tag === "string" && tag.trim().length > 0)
      ? body.tags.map((tag) => tag.trim())
      : [];

  if (!title) {
    return { error: "Title is required." };
  }

  if (!tags.length) {
    return { error: "At least one tag is required." };
  }

  if (!color) {
    return { error: "Color is required." };
  }

  if (
    body.type !== "top" &&
    body.type !== "bottom" &&
    body.type !== "outerwear" &&
    body.type !== "shoes" &&
    body.type !== "accessory"
  ) {
    return { error: "Type is invalid." };
  }

  if (
    body.status !== "clean" &&
    body.status !== "laundry" &&
    body.status !== "archived"
  ) {
    return { error: "Status is invalid." };
  }

  if (!isImageDataUrl(body.frontImageUrl)) {
    return { error: "Front image is required." };
  }

  if (body.backImageUrl && !isImageDataUrl(body.backImageUrl)) {
    return { error: "Back image must be an image." };
  }

  const frontImageUrl = body.frontImageUrl as string;
  const type = body.type as InventoryType;
  const status = body.status as InventoryStatus;
  const backImageUrl =
    typeof body.backImageUrl === "string" ? body.backImageUrl : undefined;

  return {
    value: {
      title,
      tags,
      color,
      type,
      status,
      frontImageUrl,
      backImageUrl,
    },
  };
}

export function createInventoryController(request: Request, response: Response) {
  const body = request.body as Partial<CreateInventoryInput>;
  const validation = validateInventoryPayload(body);

  if ("error" in validation) {
    response.status(400).json({ error: validation.error });
    return;
  }

  const item = createInventoryItem(validation.value);

  response.status(201).json(item);
}

export function updateInventoryFavoriteController(
  request: Request,
  response: Response,
) {
  const favorite = request.body?.favorite;
  const id = request.params.id;

  if (typeof id !== "string") {
    response.status(400).json({ error: "Inventory item id is required." });
    return;
  }

  if (typeof favorite !== "boolean") {
    response.status(400).json({ error: "Favorite must be a boolean." });
    return;
  }

  const item = updateInventoryFavorite(id, favorite);

  if (!item) {
    response.status(404).json({ error: "Inventory item not found." });
    return;
  }

  response.json(item);
}

export function updateInventoryController(request: Request, response: Response) {
  const id = request.params.id;

  if (typeof id !== "string") {
    response.status(400).json({ error: "Inventory item id is required." });
    return;
  }

  const body = request.body as Partial<UpdateInventoryInput>;
  const validation = validateInventoryPayload(body);

  if ("error" in validation) {
    response.status(400).json({ error: validation.error });
    return;
  }

  const item = updateInventoryItem(id, validation.value);

  if (!item) {
    response.status(404).json({ error: "Inventory item not found." });
    return;
  }

  response.json(item);
}

export function deleteInventoryController(request: Request, response: Response) {
  const id = request.params.id;

  if (typeof id !== "string") {
    response.status(400).json({ error: "Inventory item id is required." });
    return;
  }

  const item = deleteInventoryItem(id);

  if (!item) {
    response.status(404).json({ error: "Inventory item not found." });
    return;
  }

  response.json(item);
}
