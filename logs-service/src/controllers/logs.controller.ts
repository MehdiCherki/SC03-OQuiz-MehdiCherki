import type { Request, Response } from "express";
import * as logService from "../services/log.service.ts";
import {
  CreateLogSchema,
  CreateMultipleLogsSchema,
  LogFilterSchema,
  LogStatsFilterSchema,
} from "../validations/logs.ts";
import { IdParamSchema } from "../validations/utils.ts";
import { NotFoundError } from "../lib/errors.ts";

export async function createLog(req: Request, res: Response): Promise<void> {
  const logData = CreateLogSchema.parse(req.body);
  await logService.createLog(logData);
  res.status(201).json({ message: "Log créé avec succès" });
}

export async function getLogs(req: Request, res: Response): Promise<void> {
  const filters = LogFilterSchema.parse(req.query);

  const { logs, pagination } = await logService.getLogs(filters);

  res.json({
    data: logs,
    pagination,
  });
}

export async function getLogById(req: Request, res: Response): Promise<void> {
  // validation des données
  const { logId } = IdParamSchema.parse(req.params);
  const log = await logService.getLogById(logId);

  if (!log) throw new NotFoundError(`Le log avec l'ID ${logId} n'existe pas`);

  res.json({
    data: log,
  });
}

export async function createMultipleLogs(
  req: Request,
  res: Response,
): Promise<void> {
  const { logs } = CreateMultipleLogsSchema.parse(req.body);
  await logService.createMultipleLogs(logs);

  res.status(201).json({ message: `${logs.length} logs créées avec succès` });
}

export async function getLogsStats(req: Request, res: Response): Promise<void> {
  const filters = LogStatsFilterSchema.parse(req.query);
  const stats = await logService.getLogsStats(filters);
  res.json({ data: stats });
}
