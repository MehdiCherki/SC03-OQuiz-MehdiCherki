import type { Request, Response } from "express";
import z from "zod";
import { prisma } from "../models/index.ts";
import { ForbiddenError, NotFoundError } from "../lib/errors.ts";
import { parseIdFromParams } from "./utils.ts";

// Include commun pour getOneQuiz : questions avec leurs réponses
const quizWithQuestionsAndChoices = {
  questions: {
    include: {
      choices: true,
    },
  },
} as const;

export async function getAllQuizzes(_req: Request, res: Response) {
  const quizzes = await prisma.quiz.findMany();
  res.json(quizzes);
}

export async function getRecentQuizzes(_req: Request, res: Response) {
  const quizzes = await prisma.quiz.findMany({
    orderBy: { created_at: "desc" },
    take: 6,
  });
  res.json(quizzes);
}

export async function getQuizQuestions(req: Request, res: Response) {
  const quizId = await parseIdFromParams(req.params.id);

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) {
    throw new NotFoundError("Quiz not found");
  }

  const questions = await prisma.question.findMany({
    where: { quiz_id: quizId },
    include: { choices: true },
  });

  res.json(questions);
}

export async function getOneQuiz(req: Request, res: Response) {
  const quizId = await parseIdFromParams(req.params.id);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: quizWithQuestionsAndChoices,
  });
  if (!quiz) {
    throw new NotFoundError("Quiz not found");
  }

  res.json(quiz);
}

export async function createQuiz(req: Request, res: Response) {
  const createQuizBodySchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
  });

  const { title, description } = await createQuizBodySchema.parseAsync(
    req.body,
  );

  const createdQuiz = await prisma.quiz.create({
    data: {
      title,
      description,
      author_id: req.user!.id,
    },
  });

  res.status(201).json(createdQuiz);
}

export async function updateQuiz(req: Request, res: Response) {
  const quizId = await parseIdFromParams(req.params.id);

  const updateQuizBodySchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
  });
  const { title, description } = await updateQuizBodySchema.parseAsync(
    req.body,
  );

  const foundQuiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!foundQuiz) {
    throw new NotFoundError(`Quiz not found: ${quizId}`);
  }

  if (req.user!.role !== "admin" && foundQuiz.author_id !== req.user!.id) {
    throw new ForbiddenError("Vous ne pouvez modifier que vos propres quizzes");
  }

  const updatedQuiz = await prisma.quiz.update({
    where: { id: quizId },
    data: { title, description },
  });

  res.json(updatedQuiz);
}

export async function addTagToQuiz(req: Request, res: Response) {
  const quizId = await parseIdFromParams(req.params.id);
  const tagId = await parseIdFromParams(req.params.tagId);

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) {
    throw new NotFoundError("Quiz not found");
  }

  if (req.user!.role !== "admin" && quiz.author_id !== req.user!.id) {
    throw new ForbiddenError("Vous ne pouvez modifier que vos propres quizzes");
  }

  const tag = await prisma.tag.findUnique({ where: { id: tagId } });
  if (!tag) {
    throw new NotFoundError("Tag not found");
  }

  await prisma.quizHasTag.upsert({
    where: { quiz_id_tag_id: { quiz_id: quizId, tag_id: tagId } },
    create: { quiz_id: quizId, tag_id: tagId },
    update: {},
  });

  res.status(204).end();
}

export async function removeTagFromQuiz(req: Request, res: Response) {
  const quizId = await parseIdFromParams(req.params.id);
  const tagId = await parseIdFromParams(req.params.tagId);

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) {
    throw new NotFoundError("Quiz not found");
  }

  if (req.user!.role !== "admin" && quiz.author_id !== req.user!.id) {
    throw new ForbiddenError("Vous ne pouvez modifier que vos propres quizzes");
  }

  const link = await prisma.quizHasTag.findUnique({
    where: { quiz_id_tag_id: { quiz_id: quizId, tag_id: tagId } },
  });
  if (!link) {
    throw new NotFoundError("Ce tag n'est pas associé à ce quiz");
  }

  await prisma.quizHasTag.delete({
    where: { quiz_id_tag_id: { quiz_id: quizId, tag_id: tagId } },
  });

  res.status(204).end();
}

export async function deleteQuiz(req: Request, res: Response) {
  const quizId = await parseIdFromParams(req.params.id);

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) {
    throw new NotFoundError("Quiz not found");
  }

  if (req.user!.role !== "admin" && quiz.author_id !== req.user!.id) {
    throw new ForbiddenError(
      "Vous ne pouvez supprimer que vos propres quizzes",
    );
  }

  await prisma.quiz.delete({ where: { id: quizId } });

  res.status(204).end();
}
