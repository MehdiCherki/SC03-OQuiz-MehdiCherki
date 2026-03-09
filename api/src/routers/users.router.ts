import { Router } from "express";
import * as usersController from "../controllers/users.controller.ts";

export const router = Router();

router.get("/users", usersController.getAllUsers);

