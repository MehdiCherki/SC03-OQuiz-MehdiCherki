import { Router } from "express";
import { createLog, getLogs, getLogById } from "../controllers/log.controller";

export const logsRouter = Router();

logsRouter.post("/logs", createLog);
logsRouter.get("/logs", getLogs);
logsRouter.get("/logs/:id", getLogById);