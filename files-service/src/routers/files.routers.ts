import { Router } from "express";
import { getFile, uploadFile } from "../controllers/file.controller.ts";

export const router = Router();

router.post("/files", uploadFile);
router.get("/files/:id", getFile);
