import type { Request, Response } from "express";
import * as logService from "../services/log.service.ts";
import { CreateLogSchema } from "../validations/logs.ts";
import { IdParamSchema } from "../validations/utils.ts";
import { NotFoundError } from "../lib/errors.ts";

export async function createLog(req: Request, res: Response): Promise<void> {
  const logData = CreateLogSchema.parse(req.body);
  await logService.createLog(logData);
  res.status(201).json({ message: "Log créé avec succès" });
}

export async function getLogs(req: Request, res: Response): Promise<void> {
  const logs = await logService.getLogs();

  res.json({
    data: logs,
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
