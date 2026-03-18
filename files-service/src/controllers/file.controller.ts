import path from "node:path";
import { existsSync } from "node:fs";
import type { Request, Response } from "express";
import sharp from "sharp";
import { formParser, uploadDir } from "../lib/upload.ts";
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

export async function getFile(req: Request, res: Response) {
  const { id } = idParamsSchema.parse(req.params);
  const queryParams = queryParamsGetFileSchema.parse(req.query);

  const file = await prisma.file.findUnique({
    where: { id },
  });

  if (!file) {
    // @TODO: gérer les erreurs de manière plus propre
    // On pourrait le remplacer par les erreurs custom fait dans la partie `api` de l'application
    // avec le handler d'erreurs global
    res.status(404).json({ error: "File not found" });
    return;
  }

  // Vérifier si le fichier existe sur le disque
  const filePath = path.join(uploadDir, file.newFilename);
  if (!existsSync(filePath)) {
    res.status(404).json({ error: "File not found on disk" });
    return;
  }

  // Si le fichier n'est pas une image
  // Ou si aucune transformation n'est demandée (queryParams vide)
  // On le renvoie tel quel
  if (
    !file.mimetype.startsWith("image/") ||
    Object.keys(queryParams).length === 0
  ) {
    res.sendFile(filePath);
    return;
  }

  const image = sharp(filePath);

  if (queryParams.resize) {
    image.resize(queryParams.resize.width, queryParams.resize.height);
  }

  if (queryParams.quality) {
    const format = file.mimetype.split("/")[1];
    image.toFormat(format as keyof sharp.FormatEnum, {
      quality: queryParams.quality,
    });
  }

  if (queryParams.rotate) {
    image.rotate(queryParams.rotate);
  }

  if (queryParams.blur) {
    image.blur(queryParams.blur);
  }

  if (queryParams.format) {
    image.toFormat(queryParams.format);
  }

  if (queryParams.negate) {
    image.negate();
  }

  if (queryParams.tint) {
    image.tint(queryParams.tint);
  }

  if (queryParams.crop) {
    image.extract(queryParams.crop);
  }

  const buffer = await image.toBuffer();

  res.setHeader(
    "Content-Type",
    queryParams.format ? `image/${queryParams.format}` : file.mimetype,
  );
  res.setHeader("Content-Length", buffer.length.toString());

  res.send(buffer);
}
