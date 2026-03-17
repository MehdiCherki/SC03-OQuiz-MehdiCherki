import { z } from "zod";

export const LogLevelSchema = z.enum([
    "error",
    "warn",
    "info",
    "http",
    "verbose",
    "debug",
    "silly"
]);

export const CreateLogSchema