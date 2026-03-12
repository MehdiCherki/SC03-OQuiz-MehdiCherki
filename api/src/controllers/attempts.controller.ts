import type { Request, Response } from "express";
import z from "zod";
import { prisma } from "../models/index.ts";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../lib/errors.ts";
import { parseIdFromParams } from "./utils.ts";

export async function createAttempt(req: Request, res: Response) {
  const quizId = await parseIdFromParams(req.params.id);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: { include: { choices: true } },
    },
  });
  if (!quiz) {
    throw new NotFoundError("Quiz not found");
  }

  const answersSchema = z.array(
    z.object({
      question_id: z.number().int().positive(),
      user_choice_id: z.number().int().positive(),
    }),
  );
  const answers = await answersSchema.parseAsync(req.body);

  // Calcul du score
  const results = answers.map(({ question_id, user_choice_id }) => {
    const question = quiz.questions.find((q) => q.id === question_id);
    if (!question) {
      throw new BadRequestError(
        `La question ${question_id} n'appartient pas à ce quiz`,
      );
    }

    const userChoice = question.choices.find((c) => c.id === user_choice_id);
    if (!userChoice) {
      throw new BadRequestError(
        `Le choix ${user_choice_id} n'appartient pas à la question ${question_id}`,
      );
    }

    const goodChoice = question.choices.find((c) => c.is_valid);
    return {
      question_id,
      user_choice_id,
      good_choice_id: goodChoice?.id ?? null,
      is_correct: goodChoice?.id === user_choice_id,
    };
  });

  const score = results.filter((r) => r.is_correct).length;
  const max_score = answers.length;

  const attempt = await prisma.attempt.create({
    data: {
      score,
      max_score,
      user_id: req.user!.id,
      quiz_id: quizId,
    },
  });

  res.status(201).json({ attempt, results });
}

export async function getQuizAttempts(req: Request, res: Response) {
  const quizId = await parseIdFromParams(req.params.id);

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) {
    throw new NotFoundError("Quiz not found");
  }

  // Seul l'admin ou l'auteur du quiz peut voir les tentatives
  if (req.user!.role !== "admin" && quiz.author_id !== req.user!.id) {
    throw new ForbiddenError(
      "Vous ne pouvez consulter que les tentatives de vos propres quizzes",
    );
  }

  const attempts = await prisma.attempt.findMany({
    where: { quiz_id: quizId },
    include: { user: { omit: { password: true } } },
    orderBy: { created_at: "desc" },
  });

  res.json(attempts);
}
