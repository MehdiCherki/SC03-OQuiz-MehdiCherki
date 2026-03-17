import { Router } from "express";

import { router as levelsRouter } from "./levels.router.ts";
import { router as tagsRouter } from "./tags.router.ts";
import { router as quizzesRouter } from "./quizzes.router.ts";
import { router as questionsRouter } from "./questions.router.ts";
import { router as choicesRouter } from "./choices.router.ts";
import { router as usersRouter } from "./users.router.ts";
import { router as authRouter } from "./auth.router.ts";

export const router = Router();

router.use(levelsRouter);
router.use(tagsRouter);
router.use(quizzesRouter);
router.use(questionsRouter);
router.use(choicesRouter);
router.use(usersRouter);
router.use(authRouter);
