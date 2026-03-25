import { Router } from "express";
import { healthRouter } from "./health.js";
import { inventoryRouter } from "./inventory.js";
import { outfitsRouter } from "./outfits.js";
import { plannerRouter } from "./planner.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/inventory", inventoryRouter);
apiRouter.use("/outfits", outfitsRouter);
apiRouter.use("/planner", plannerRouter);
