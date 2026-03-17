import { Router } from "express";
import { logsRouter } from "./logs.routes.ts";

export const router = Router();

router.use(logsRouter);