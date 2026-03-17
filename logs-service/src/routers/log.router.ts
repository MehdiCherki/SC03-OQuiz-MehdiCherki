import { Router } from "express";
import {
  createLog,
  getLogs,
  getLogById,
} from "../controllers/logs.controller.ts";

export const router = Router();

// Création de logs
router.post("/logs", createLog);

// Récupération des logs
router.get("/logs", getLogs);

// Récupération d'un log par son id
router.get("/logs/:logId", getLogById);
