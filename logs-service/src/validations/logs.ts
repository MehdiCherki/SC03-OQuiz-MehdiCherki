import { z } from "zod";
import { ObjectId } from "mongodb";

export const LogLevelSchema = z.enum([
  "error",
  "warn",
  "info",
  "http",
  "verbose",
  "debug",
  "silly",
]);

export const CreateLogSchema = z.looseObject({
  level: LogLevelSchema,
  message: z
    .string()
    .min(3, "Le message est absent ou trop court")
    .max(1000, "Le message est trop long")
    .optional(),
  service: z
    .string()
    .min(3, "Le nom du service est absent ou trop court")
    .max(100, "Le nom du service est trop long"),
  version: z.string().max(20).optional(),
  environment: z.string().max(50).optional(),
  userId: z.number().optional(),
  requestId: z.string().max(100).optional(),
  sessionId: z.string().max(100).optional(),
  hostname: z.string().max(255).optional(),
  ip: z.string().max(50).optional(),
  userAgent: z.string().max(1000).optional(),
  stackTrace: z.string().max(10000).optional(),
  timestamp: z.coerce.date().default(new Date()),
});

export type LogDocument = z.infer<typeof CreateLogSchema> & {
  _id: ObjectId;
  metadata?: any;
};

export type CreateLoqRequest = z.infer<typeof CreateLogSchema>;
export type LogLevel = z.infer<typeof LogLevelSchema>;
