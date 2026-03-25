import { Request, Response } from "express";
import { CreatePlannerEntryInput } from "../models/planner.js";
import {
  createPlannerEntry,
  deletePlannerEntry,
  listPlannerEntries,
} from "../services/plannerService.js";

export function listPlannerEntriesController(
  request: Request,
  response: Response,
) {
  const start = request.query.start;
  const end = request.query.end;

  if (typeof start !== "string" || typeof end !== "string") {
    response.status(400).json({ error: "Both start and end dates are required." });
    return;
  }

  response.json(listPlannerEntries(start, end));
}

export function createPlannerEntryController(
  request: Request,
  response: Response,
) {
  const body = request.body as Partial<CreatePlannerEntryInput>;
  const date = body.date?.trim();
  const outfitId = body.outfitId?.trim();

  if (!date) {
    response.status(400).json({ error: "Planner date is required." });
    return;
  }

  if (!outfitId) {
    response.status(400).json({ error: "Outfit id is required." });
    return;
  }

  const entry = createPlannerEntry({ date, outfitId });

  if (!entry) {
    response.status(404).json({ error: "Outfit not found." });
    return;
  }

  response.status(201).json(entry);
}

export function deletePlannerEntryController(
  request: Request,
  response: Response,
) {
  const id = request.params.id;

  if (typeof id !== "string") {
    response.status(400).json({ error: "Planner entry id is required." });
    return;
  }

  const entry = deletePlannerEntry(id);

  if (!entry) {
    response.status(404).json({ error: "Planner entry not found." });
    return;
  }

  response.json(entry);
}
