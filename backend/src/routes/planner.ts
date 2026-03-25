import { Router } from "express";
import {
  createPlannerEntryController,
  deletePlannerEntryController,
  listPlannerEntriesController,
} from "../controllers/plannerController.js";

export const plannerRouter = Router();

plannerRouter.get("/", listPlannerEntriesController);
plannerRouter.post("/", createPlannerEntryController);
plannerRouter.delete("/:id", deletePlannerEntryController);
