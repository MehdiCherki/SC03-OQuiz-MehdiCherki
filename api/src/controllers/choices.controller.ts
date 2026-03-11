import type { Request, Response } from "express";
import z from "zod";
import { prisma } from "../models/index.ts";
import { ForbiddenError, NotFoundError } from "../lib/errors.ts";
import { parseIdFromParams } from "./utils.ts";

function assertQuizAuthor(quizAuthorId: number, userId: number) {
  if (quizAuthorId !== userId) {
    throw new ForbiddenError("Vous ne pouvez modifier que les choix de vos propres quizzes");
  }
}

export async function updateChoice(req: Request, res: Response) {
  const choiceId = await parseIdFromParams(req.params.id);

  const choice = await prisma.choice.findUnique({
    where: { id: choiceId },
    include: { question: { include: { quiz: true } } },
  });
  if (!choice) { throw new NotFoundError("Choice not found"); }

  if (req.user!.role !== "admin") { assertQuizAuthor(choice.question.quiz.author_id, req.user!.id); }

  const schema = z.object({
    description: z.string().min(1).optional(),
    is_valid: z.boolean().optional(),
  });
  const { description, is_valid } = await schema.parseAsync(req.body);

  const updatedChoice = await prisma.choice.update({
    where: { id: choiceId },
    data: { description, is_valid },
  });

  res.json(updatedChoice);
}

export async function deleteChoice(req: Request, res: Response) {
  const choiceId = await parseIdFromParams(req.params.id);

  const choice = await prisma.choice.findUnique({
    where: { id: choiceId },
    include: { question: { include: { quiz: true } } },
  });
  if (!choice) { throw new NotFoundError("Choice not found"); }

  if (req.user!.role !== "admin") { assertQuizAuthor(choice.question.quiz.author_id, req.user!.id); }

  await prisma.choice.delete({ where: { id: choiceId } });

  res.status(204).end();
}
