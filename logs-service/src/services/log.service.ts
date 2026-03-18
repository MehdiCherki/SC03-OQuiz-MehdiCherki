import { ObjectId } from "mongodb";
import { getClient } from "../lib/db.ts";
import type {
  LogDocument,
  CreateLoqRequest,
  LogFilterRequest,
} from "../validations/logs.ts";

export interface LogsWithPagination {
  logs: LogDocument[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
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

export async function getLogs(
  filters: LogFilterRequest,
): Promise<LogsWithPagination> {
  const client = await getClient();
  const collection = await client.db().collection("logs");

  const mongoFilter: any = {};

  if (filters.service) mongoFilter.service = filters.service;
  if (filters.level) mongoFilter.level = filters.level;
  if (filters.environment) mongoFilter.environment = filters.environment;
  if (filters.userId) mongoFilter.userId = filters.userId;
  if (filters.requestId) mongoFilter.requestId = filters.requestId;
  if (filters.sessionId) mongoFilter.sessionId = filters.sessionId;

  if (filters.startDate || filters.endDate) {
    mongoFilter.timestamp = {};
    if (filters.startDate) mongoFilter.timestamp.$gte = filters.startDate;
    if (filters.endDate) mongoFilter.timestamp.$lt = filters.endDate;
  }

  const [logs, total] = await Promise.all([
    collection
      .find<LogDocument>(mongoFilter)
      .sort({ timestamp: -1 })
      .skip(filters.offset)
      .limit(filters.limit)
      .toArray(),
    collection.countDocuments(mongoFilter),
  ]);

  const pagination: any = {
    total,
    limit: filters.limit,
    offset: filters.offset,
    hasPrevious: filters.offset !== 0,
    hasNext: filters.offset + filters.limit < total,
  };

  return { logs, pagination };
}

export async function getLogById(id: string): Promise<LogDocument | null> {
  const client = await getClient();
  const collection = await client.db().collection("logs");

  const log = collection.findOne<LogDocument>({ _id: new ObjectId(id) });
  if (!log) return null;
  return log;
}

export async function createMultipleLogs(logs: CreateLoqRequest[]) {
  const improvedLogs = logs.map(log => ({
    ...log,
    timestamp: new Date(),
    environment: log.environment || "developement",
  }));
  const client = await getClient();
  await client.db().collection("logs").insertMany(improvedLogs);
}
