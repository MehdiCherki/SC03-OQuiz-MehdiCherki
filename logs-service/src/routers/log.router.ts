import { Router } from "express";
import {
  createLog,
  getLogs,
  getLogById,
  createMultipleLogs,
} from "../controllers/logs.controller.ts";

export const router = Router();

// Création de logs
router.post("/logs", createLog);
router.post("/logs/batch", createMultipleLogs);

// Récupération des logs
router.get("/logs", getLogs);

// Récupération d'un log par son id
router.get("/logs/:logId", getLogById);
