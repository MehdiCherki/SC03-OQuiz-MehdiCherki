import type { Request, Response } from "express";
import z from "zod";
import { prisma } from "../models/index.ts";
import { ForbiddenError, NotFoundError } from "../lib/errors.ts";
import { parseIdFromParams } from "./utils.ts";

function assertQuizAuthor(quizAuthorId: number, userId: number) {
  if (quizAuthorId !== userId) {
    throw new ForbiddenError(
      "Vous ne pouvez modifier que les questions de vos propres quizzes",
    );
  }
}

export async function createQuestion(req: Request, res: Response) {
  const quizId = await parseIdFromParams(req.params.id);

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) {
    throw new NotFoundError("Quiz not found");
  }

  if (req.user!.role !== "admin") {
    assertQuizAuthor(quiz.author_id, req.user!.id);
  }

  const schema = z.object({
    description: z.string().min(1),
    level_id: z.number().int().positive().optional(),
  });
  const { description, level_id } = await schema.parseAsync(req.body);

  const question = await prisma.question.create({
    data: { description, level_id, quiz_id: quizId },
  });

  res.status(201).json(question);
}

export async function updateQuestion(req: Request, res: Response) {
  const questionId = await parseIdFromParams(req.params.id);

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { quiz: true },
  });
  if (!question) {
    throw new NotFoundError("Question not found");
  }

  if (req.user!.role !== "admin") {
    assertQuizAuthor(question.quiz.author_id, req.user!.id);
  }

  const schema = z.object({
    description: z.string().min(1).optional(),
    level_id: z.number().int().positive().nullable().optional(),
  });
  const { description, level_id } = await schema.parseAsync(req.body);

  const updatedQuestion = await prisma.question.update({
    where: { id: questionId },
    data: { description, level_id },
  });

  res.json(updatedQuestion);
}

export async function deleteQuestion(req: Request, res: Response) {
  const questionId = await parseIdFromParams(req.params.id);

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { quiz: true },
  });
  if (!question) {
    throw new NotFoundError("Question not found");
  }

  if (req.user!.role !== "admin") {
    assertQuizAuthor(question.quiz.author_id, req.user!.id);
  }

  await prisma.question.delete({ where: { id: questionId } });

  res.status(204).end();
}

export async function createChoice(req: Request, res: Response) {
  const questionId = await parseIdFromParams(req.params.id);

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { quiz: true },
  });
  if (!question) {
    throw new NotFoundError("Question not found");
  }

  if (req.user!.role !== "admin") {
    assertQuizAuthor(question.quiz.author_id, req.user!.id);
  }

  const schema = z.object({
    description: z.string().min(1),
    is_valid: z.boolean(),
  });
  const { description, is_valid } = await schema.parseAsync(req.body);

  const choice = await prisma.choice.create({
    data: { description, is_valid, question_id: questionId },
  });

  res.status(201).json(choice);
}
