import { Router } from "express";
import * as authController from "../controllers/auth.controller.ts";

export const router = Router();

router.post("/auth/register", authController.registerUser);
router.post("/auth/login", authController.loginUser);
