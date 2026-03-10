import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";

import { router as levelsRouter } from "./levels.router.ts";
import { router as usersRouter } from "./users.router.ts";
import { router as authRouter } from "./auth.router.ts";

export const router = Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  // console.log(`${req.cookies}`);
  // console.log(`${req.method}:${req.path}`);
  next();
});
router.use(levelsRouter);
router.use(usersRouter);
router.use(authRouter);
