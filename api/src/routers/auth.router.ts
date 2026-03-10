import { Router } from "express";
import * as authController from "../controllers/auth.controller.ts";
import { checkRoles } from "../middlewares/access-control-middleware.ts";

export const router = Router();

router.post("/auth/register", authController.registerUser);
router.post("/auth/login", authController.loginUser);
router.post("/auth/logout", authController.logoutUser);
router.post("/auth/refresh", authController.refreshAccessToken);
router.get(
  "/auth/me",
  checkRoles(["member", "author", "admin"]),
  authController.getAuthenticatedUser,
);
