import cors from "cors";
import express from "express";
import { config } from "../config.ts";
import cookieParser from "cookie-parser";
import { router as apiRouter } from "./routers/index.router.ts";
import { globalErrorHandler } from "./middlewares/global-error-handler.ts";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.ts";
import { infoMiddleware } from "./middlewares/info.middleware.ts";

// Créer une app Express
export const app = express();

// Autoriser les requêtes cross-origin
app.use(cors({ origin: config.allowedOrigins }));

app.use(cookieParser());

// Body parser pour récupérer les body "application/json" dans req.body
app.use(express.json());

// Brancher le routeur de l'API
app.use("/api", apiRouter);

// Info route
app.get("/info", infoMiddleware);

// Not found middleware
app.use(notFoundMiddleware);

// Global error middleware
app.use(globalErrorHandler);
