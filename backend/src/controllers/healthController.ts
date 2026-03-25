import { Request, Response } from "express";
import { getHealthStatus } from "../services/healthService.js";

export function healthController(_request: Request, response: Response) {
  response.json(getHealthStatus());
}

