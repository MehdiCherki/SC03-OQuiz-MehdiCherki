import type { Request, Response } from "express";
import { prisma } from "../models/index.ts";
import z from "zod";
import { ForbiddenError, NotFoundError } from "../lib/errors.ts";
import { parseIdFromParams } from "./utils.ts";

export async function getAllUsers(req: Request, res: Response) {
  // Optional query params
  const queryParamsSchema = z.object({
    limit: z.coerce.number().nullable().optional().default(null), // ?limit=5
  });
  const { limit } = await queryParamsSchema.parseAsync(req.query);

  // Appel la BDD
  const users = await prisma.user.findMany({
    omit: { password: true },
    ...(limit && { take: limit }), // Sucre syntaxique
  });

  // Réponse au client
  res.json(users);
}

export async function getUserProfile(req: Request, res: Response) {
  const userId = await parseIdFromParams(req.params.id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { password: true },
  });
  if (!user) {
    throw new NotFoundError("User not found");
  }

  const nb_quiz_played = await prisma.attempt.count({
    where: { user_id: userId },
  });

  res.json({ ...user, nb_quiz_played });
}

export async function getUserAttempts(req: Request, res: Response) {
  const userId = await parseIdFromParams(req.params.id);

  if (req.user!.role !== "admin" && req.user!.id !== userId) {
    throw new ForbiddenError(
      "Vous ne pouvez consulter que vos propres tentatives",
    );
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) {
    throw new NotFoundError("User not found");
  }

  const attempts = await prisma.attempt.findMany({
    where: { user_id: userId },
    include: { quiz: true },
    orderBy: { created_at: "desc" },
  });

  res.json(attempts);
}
