import { Router } from "express";
import {
  createInventoryController,
  deleteInventoryController,
  inventoryFilterOptionsController,
  listInventoryController,
  updateInventoryController,
  updateInventoryFavoriteController,
} from "../controllers/inventoryController.js";

export const inventoryRouter = Router();

inventoryRouter.get("/filters", inventoryFilterOptionsController);
inventoryRouter.get("/", listInventoryController);
inventoryRouter.post("/", createInventoryController);
inventoryRouter.delete("/:id", deleteInventoryController);
inventoryRouter.put("/:id", updateInventoryController);
inventoryRouter.patch("/:id/favorite", updateInventoryFavoriteController);
