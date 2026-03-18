import { ObjectId } from "mongodb";
import { getClient } from "../lib/db.ts";
import type {
  LogDocument,
  CreateLoqRequest,
  LogFilterRequest,
  LogStatsFilterRequest,
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

export interface LogStats {
  totalLogs: number;
  logsByLevel: {
    error?: number;
    warn?: number;
    info?: number;
    http?: number;
  };
  logsByService: {
    oquiz?: number;
  };
  logsByEnvironment: {
    development?: number;
    production?: number;
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

export async function getLogsStats(
  filters: LogStatsFilterRequest,
): Promise<LogStats> {
  const client = await getClient();
  const collection = await client.db().collection("logs");

  const mongoFilter: any = {};

  if (filters.service) mongoFilter.service = filters.service;
  if (filters.environment) mongoFilter.environment = filters.environment;

  if (filters.startDate || filters.endDate) {
    mongoFilter.timestamp = {};
    if (filters.startDate) mongoFilter.timestamp.$gte = filters.startDate;
    if (filters.endDate) mongoFilter.timestamp.$lt = filters.endDate;
  }

  const [totalLogs, logsByLevel, logsByService, logsByEnvironment] =
    await Promise.all([
      // nombre total de logs
      collection.countDocuments(mongoFilter),
      // répartition par niveau
      collection
        .aggregate([
          { $match: mongoFilter },
          { $group: { _id: "$level", count: { $sum: 1 } } },
        ])
        .toArray(),
      // répartition par service
      collection
        .aggregate([
          { $match: mongoFilter },
          { $group: { _id: "$service", count: { $sum: 1 } } },
        ])
        .toArray(),
      // répartition par environment
      collection
        .aggregate([
          { $match: mongoFilter },
          { $group: { _id: "$environment", count: { $sum: 1 } } },
        ])
        .toArray(),
    ]);

  const stats: LogStats = {
    totalLogs,
    logsByLevel: logsByLevel.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {} as Record<string, number>,
    ),
    logsByService: logsByService.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {} as Record<string, number>,
    ),
    logsByEnvironment: logsByEnvironment.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {} as Record<string, number>,
    ),
  };

  return stats;
}
