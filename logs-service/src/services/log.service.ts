import { ObjectId } from "mongodb";
import { getClient } from "../lib/db.ts";
import type { CreateLoqRequest, LogLevel } from "../validations/logs.ts";

// type pour les logs provenant de mongo
export interface LogDocument {
  _id: ObjectId;
  timestamp: Date;
  level: LogLevel;
  message: string;
  service: string;
  environment: string;
  version?: string;
  userId?: string;
  requestId?: string;
  sessionId?: string;
  hostname?: string;
  ip?: string;
  userAgent?: string;
  metadata?: any; // éventuellement object
  stackTrace?: string;
}

export async function createLog(data: CreateLoqRequest) {
  const logData = {
    ...data,
    timestamp: new Date(),
    environment: data.environment || "developement",
  };

  const client = await getClient();
  await client.db().collection("logs").insertOne(logData);
}

export async function getLogs(): Promise<LogDocument[]> {
  const client = await getClient();
  const collection = await client.db().collection("logs");

  const logs = await collection.find();

  return logs;
}

export async function getLogById(id: string): Promise<LogDocument | null> {
  const client = await getClient();
  const collection = await client.db().collection("logs");

  const log = collection.findOne<LogDocument>({ _id: new ObjectId(id) });
  if (!log) return null;
  return log;
}
