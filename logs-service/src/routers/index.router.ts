import { Router } from "express";
import { createLog, getLogs } from "../controllers/logs.controller";

export const router = Router();

// Création de logs
router.post("/logs", createLog);

// Recuperation des logs
router.get("/logs", getLogs)