import { Router } from "express";
import * as usersController from "../controllers/users.controller.ts";
import { checkRoles } from "../middlewares/access-control-middleware.ts";
export const router = Router();

router.get("/users", checkRoles(["admin"]), usersController.getAllUsers);
