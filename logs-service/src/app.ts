import express from "express";
import { router } from "./routers/index.router.ts"

export const app = express();

app.use(express.json());
app.use(router);