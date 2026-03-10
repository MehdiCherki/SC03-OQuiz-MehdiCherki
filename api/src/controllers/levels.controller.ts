import type { Request, Response } from "express";
import z from "zod";
import { prisma } from "../models/index.ts";
import { ConflictError, NotFoundError } from "../lib/errors.ts";
import { parseIdFromParams } from "./utils.ts";

export async function getAllLevels(req: Request, res: Response) {
  // Récupérer tous les levels en BDD
  const levels = await prisma.level.findMany();

  // Les renvoyer
  res.json(levels);
}

export async function getOneLevel(req: Request, res: Response) {
  const levelId = await parseIdFromParams(req.params.id);
  
  const level = await prisma.level.findUnique({ where: { id: levelId } });
  if (!level) { throw new NotFoundError("Level not found"); }

  res.json(level);
}

export async function createLevel(req: Request, res: Response) {
  // Valider le body (NEVER TRUST USER INPUT)
  const createLevelBodySchema = z.object({
    name: z.string().min(1)
  });
  
  // Si le body ne respect pas, une erreur Zod est levée : le code s'arrête + l'erreur est transmise au global erreur handle pour gestion (400)
  const data = await createLevelBodySchema.parseAsync(req.body); 

  // Vérifie s'il n'existe pas déjà un level avec le même nom
  const alreadyExistingLevel = await prisma.level.findFirst({ where: { name: data.name } });
  if (alreadyExistingLevel) { throw new ConflictError(`Tag name already taken : ${data.name}`); }

  // Insérer en base de données
  const createdLevel = await prisma.level.create({ data });

  // Réponse au client
  res.status(201).json(createdLevel);
}

export async function updateLevel(req: Request, res: Response) {
  // Récupérer l'ID de level à mettre à jour
  const levelId = await parseIdFromParams(req.params.id);
  
  // Valider le body (name string non nulle) --> sinon 400
  const updateLevelBodySchema = z.object({
    name: z.string().min(1)
  });
  const { name } = await updateLevelBodySchema.parseAsync(req.body);

  // Récupérer le level (par son Id) à mettre à jour en BDD --> sinon 404
  const foundLevel = await prisma.level.findUnique({ where: { id : levelId } });
  if (!foundLevel){
    throw new NotFoundError(`Level not found: ${levelId}`);
  }

  // Vérifier si un level du même nom n'existe pas déjà (en excluant le level courant) --> sinon 409
  const alreadyExistingLevel = await prisma.level.findFirst({ where: { name, id: { not: levelId } } });
  if (alreadyExistingLevel) {
    throw new ConflictError(`Tag name already taken : ${name}`);
  }

  // Mettre à jour le level en BDD et récupérer directement le résultat
  const updatedLevel = await prisma.level.update({
    where: { id: levelId },
    data: { name, updated_at: new Date() },
  });

  res.json(updatedLevel);
}

export async function deleteLevel(req: Request, res: Response) {
  const levelId = await parseIdFromParams(req.params.id);

  const level = await prisma.level.findUnique({ where: { id: levelId } });
  if (!level) { throw new NotFoundError("Level not found"); }

  await prisma.level.delete({ where: { id: levelId } });

  res.status(204).end();
}
