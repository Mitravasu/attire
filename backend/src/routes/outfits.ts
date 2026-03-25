import { Router } from "express";
import {
  createOutfitController,
  deleteOutfitController,
  listOutfitsController,
  updateOutfitController,
} from "../controllers/outfitController.js";

export const outfitsRouter = Router();

outfitsRouter.get("/", listOutfitsController);
outfitsRouter.post("/", createOutfitController);
outfitsRouter.delete("/:id", deleteOutfitController);
outfitsRouter.put("/:id", updateOutfitController);
