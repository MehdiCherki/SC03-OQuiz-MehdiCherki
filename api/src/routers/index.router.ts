import { Router } from "express";

import { router as levelsRouter } from "./levels.router.ts";
import { router as usersRouter } from "./users.router.ts";

export const router = Router();

router.use(levelsRouter);
router.use(usersRouter);
