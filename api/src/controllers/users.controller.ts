import type { Request, Response } from "express";
import { prisma } from "../models/index.ts";
import z from "zod";

export async function getAllUsers(req: Request, res: Response) {
  // Optional query params
  const queryParamsSchema = z.object({
    limit: z.coerce.number().nullable().optional().default(null) // ?limit=5
  });
  const { limit } = await queryParamsSchema.parseAsync(req.query);

  // Appel la BDD
  const users = await prisma.user.findMany({
    omit: { password: true },
    ...(limit && { take: limit }) // Sucre syntaxique
  });

  // Réponse au client
  res.json(users);
}
