import { Router } from "express";
import { uploadFile } from "../controllers/file.controller.ts";

export const router = Router();

router.post("/files", uploadFile);
