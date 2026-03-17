import { ObjectId } from "mongodb";
import { getClient } from "../lib/db.ts";
import type { LogDocument, CreateLoqRequest } from "../validations/logs.ts";

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

  const logs = await collection
    .find<LogDocument>({})
    .sort({ timestamp: -1 })
    .toArray();

  return logs;
}

export async function getLogById(id: string): Promise<LogDocument | null> {
  const client = await getClient();
  const collection = await client.db().collection("logs");

  const log = collection.findOne<LogDocument>({ _id: new ObjectId(id) });
  if (!log) return null;
  return log;
}
