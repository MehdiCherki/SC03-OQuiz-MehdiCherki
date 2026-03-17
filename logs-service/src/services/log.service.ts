
import { z } from "zod";
import { getClient } from "../lib/db.ts";
import { ObjectId } from "mongodb";

// Schema Zod — definit les champs et leurs types
export const logSchema = z.object({
  // Champs obligatoires
  level:   z.enum(["info", "warn", "error", "debug", "http"]),
  message: z.string(),
  service: z.string(),

  // Champs optionnels
  version:     z.string().optional(),
  environment: z.string().default("development"),  // enrichi automatiquement
  userId:      z.string().optional(),
  requestId:   z.string().optional(),
  sessionId:   z.string().optional(),
  hostname:    z.string().optional(),
  ip:          z.string().optional(),
  userAgent:   z.string().optional(),
  metadata:    z.record(z.unknown()).optional(),
  stackTrace:  z.string().optional(),
  timestamp:   z.coerce.date().optional(),
}).passthrough(); // accepte les champs non prevus


export type Log = z.infer<typeof logSchema>;

export async function createLog(data: unknown) {
  const logData = logSchema.parse({
    ...data,
    timestamp: new Date(),
  });

  const client = await getClient();
  const result = await client.db().collection("logs").insertOne(logData);
  return result;
}

export async function getLogs(): Promise<Log[]> {
  const client = await getClient();
  const logs = await client.db().collection("logs").find().toArray();
  return logs as Log[];
}

export async function getLogById(id: string): Promise<Log | null> {
  const client = await getClient();
  const log = await client
    .db()
    .collection("logs")
    .findOne({ _id: new ObjectId(id) });
  return log as Log | null;
}
