import { Router } from "express";
import * as levelsController from "../controllers/levels.controller.ts";

export const router = Router();

router.get("/levels", levelsController.getAllLevels);

router.get("/levels/:id", levelsController.getOneLevel);

router.post("/levels", levelsController.createLevel);

router.patch("/levels/:id", levelsController.updateLevel);

router.delete("/levels/:id", levelsController.deleteLevel);
