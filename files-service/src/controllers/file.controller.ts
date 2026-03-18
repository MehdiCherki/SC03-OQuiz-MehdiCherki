import type { Request, Response } from "express";
import { formParser } from "../lib/upload.ts";

export async function uploadFile(req: Request, res: Response): Promise<void> {
  const [fields, files] = await formParser.parse(req);
  /*
  files est un objet avec des propriétés contenant le/les fichier(s) uploadés
  ex : {file:[{...}]}
  */
  const filesToSave = Object.entries(files)
    .map(([key, files]) => files || [])
    .flat();

  res.json(filesToSave);
}
