import type { Request, Response } from "express";
import { formParser } from "../lib/upload.ts";
import { prisma } from "../models/index.ts";
import {
  idParamsSchema,
  queryParamsGetFileSchema,
} from "../validations/utils.ts";

export async function uploadFile(req: Request, res: Response): Promise<void> {
  const [, files] = await formParser.parse(req);
  const filesToSave = Object.values(files).flatMap(files => files ?? []);

  const filesCreated = await prisma.file.createManyAndReturn({
    data: filesToSave.map(file => ({
      size: file.size,
      newFilename: file.newFilename,
      originalFilename: file.originalFilename || "",
      mimetype: file.mimetype || "",
    })),
  });

  res.json(filesCreated);
}
