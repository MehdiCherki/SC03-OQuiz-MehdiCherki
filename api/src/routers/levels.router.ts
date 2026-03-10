import { Router } from "express";
import { checkRoles } from "../middlewares/access-control-middleware.ts";
import * as levelsController from "../controllers/levels.controller.ts";

export const router = Router();

router.get(
  "/levels",
  checkRoles(["admin", "author", "member"]),
  levelsController.getAllLevels,
);

router.get(
  "/levels/:id",
  checkRoles(["admin", "author", "member"]),
  levelsController.getOneLevel,
);

router.post("/levels", checkRoles(["admin"]), levelsController.createLevel);

router.patch(
  "/levels/:id",
  checkRoles(["admin"]),
  levelsController.updateLevel,
);

router.delete(
  "/levels/:id",
  checkRoles(["admin"]),
  levelsController.deleteLevel,
);
