import { Router } from "express";
import { router as fileRouter } from "./files.routers.ts";

export const router = Router();

router.use(fileRouter);
