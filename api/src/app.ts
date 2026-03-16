import cors from "cors";
import express from "express";
import { config } from "../config.ts";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { router as apiRouter } from "./routers/index.router.ts";
import { globalErrorHandler } from "./middlewares/global-error-handler.ts";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.ts";
import { infoMiddleware } from "./middlewares/info.middleware.ts";
import { xssSanitizer } from "./middlewares/xss-sanitizer.middleware.ts";
import { helmetMiddleware } from "./middlewares/helmet.middleware.ts";
import { swaggerSpec } from "./lib/swagger.ts";
import { logRequest } from "./middlewares/log-request.middleware.ts";

// Créer une app Express
export const app = express();

// Faire confiance au proxy nginx (nécessaire pour que req.secure soit correct derrière une terminaison SSL)
if (config.isProd) {
  app.set("trust proxy", 1);
}

app.use(logRequest);

// Sécuriser les headers HTTP
app.use(helmetMiddleware);

// Autoriser les requêtes cross-origin
app.use(cors({ origin: config.allowedOrigins }));

app.use(cookieParser());

// Body parser pour récupérer les body "application/json" dans req.body
app.use(express.json());

// Sanitizer XSS : nettoie les chaînes du body après parsing JSON
app.use(xssSanitizer);

// Documentation Swagger
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Brancher le routeur de l'API
app.use("/api", apiRouter);

// Info route
app.get("/info", infoMiddleware);

// Not found middleware
app.use(notFoundMiddleware);

// Global error middleware
app.use(globalErrorHandler);
