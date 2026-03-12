import { beforeEach, describe, it } from "node:test";
import { prisma } from "../models/index.ts";
import assert from "node:assert";
import argon2 from "argon2";
import { authedRequester, buildAuthedRequester } from "../../test/index.ts";
import type { User } from "../models/index.ts";

describe("attempts", () => {
  let author: User;
  let authorRequester: ReturnType<typeof buildAuthedRequester>;
  let quizId: number;
  let questionId: number;
  let validChoiceId: number;
  let invalidChoiceId: number;

  beforeEach(async () => {
    author = await prisma.user.create({
      data: {
        firstname: "Alice",
        lastname: "Author",
        email: "alice-attempts@oclock.io",
        password: await argon2.hash("password"),
        role: "author",
      },
    });
    authorRequester = buildAuthedRequester(author);

    const quiz = await prisma.quiz.create({
      data: { title: "Quiz de test", author_id: author.id },
    });
    quizId = quiz.id;

    const question = await prisma.question.create({
      data: {
        description: "Quelle est la capitale de la France ?",
        quiz_id: quizId,
      },
    });
    questionId = question.id;

    const [validChoice, invalidChoice] = await Promise.all([
      prisma.choice.create({
        data: { description: "Paris", is_valid: true, question_id: questionId },
      }),
      prisma.choice.create({
        data: { description: "Lyon", is_valid: false, question_id: questionId },
      }),
    ]);
    validChoiceId = validChoice.id;
    invalidChoiceId = invalidChoice.id;
  });

  // ─── POST /quizzes/:id/attempts ───────────────────────────────────────

  describe("[POST] /api/quizzes/:id/attempts", () => {
    it("should create an attempt and return the score", async () => {
      // Arrange
      const member = await prisma.user.create({
        data: {
          firstname: "Bob",
          lastname: "Member",
          email: "bob-attempts@oclock.io",
          password: await argon2.hash("password"),
          role: "member",
        },
      });
      const memberRequester = buildAuthedRequester(member);

      // Act
      const { status, data } = await memberRequester.post(
        `/quizzes/${quizId}/attempts`,
        [{ question_id: questionId, user_choice_id: validChoiceId }],
      );

      // Assert
      assert.strictEqual(status, 201);
      assert.strictEqual(data.attempt.score, 1);
      assert.strictEqual(data.attempt.max_score, 1);
      assert.strictEqual(data.attempt.user_id, member.id);
      assert.strictEqual(data.attempt.quiz_id, quizId);
    });

    it("should return correct results for each answer", async () => {
      // Act
      const { data } = await authorRequester.post(
        `/quizzes/${quizId}/attempts`,
        [{ question_id: questionId, user_choice_id: validChoiceId }],
      );

      // Assert
      assert.strictEqual(data.results.length, 1);
      assert.strictEqual(data.results[0].question_id, questionId);
      assert.strictEqual(data.results[0].user_choice_id, validChoiceId);
      assert.strictEqual(data.results[0].good_choice_id, validChoiceId);
      assert.strictEqual(data.results[0].is_correct, true);
    });

    it("should score 0 when all answers are wrong", async () => {
      // Act
      const { data } = await authorRequester.post(
        `/quizzes/${quizId}/attempts`,
        [{ question_id: questionId, user_choice_id: invalidChoiceId }],
      );

      // Assert
      assert.strictEqual(data.attempt.score, 0);
      assert.strictEqual(data.results[0].is_correct, false);
      assert.strictEqual(data.results[0].good_choice_id, validChoiceId);
    });

    it("should persist the attempt in the database", async () => {
      // Act
      await authorRequester.post(`/quizzes/${quizId}/attempts`, [
        { question_id: questionId, user_choice_id: validChoiceId },
      ]);

      // Assert
      const attempt = await prisma.attempt.findFirst({
        where: { quiz_id: quizId },
      });
      assert.ok(attempt);
      assert.strictEqual(attempt.score, 1);
    });

    it("should return 404 when the quiz does not exist", async () => {
      const { status } = await authorRequester.post("/quizzes/9999/attempts", [
        { question_id: questionId, user_choice_id: validChoiceId },
      ]);
      assert.strictEqual(status, 404);
    });

    it("should return 401 when accessed without authentication", async () => {
      const response = await fetch(
        `http://localhost:7357/api/quizzes/${quizId}/attempts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([]),
        },
      );
      assert.strictEqual(response.status, 401);
    });
  });

  // ─── GET /quizzes/:id/attempts ────────────────────────────────────────

  describe("[GET] /api/quizzes/:id/attempts", () => {
    it("should return the attempts for a quiz (admin access)", async () => {
      // Arrange
      await prisma.attempt.create({
        data: { score: 1, max_score: 1, user_id: author.id, quiz_id: quizId },
      });

      // Act
      const { status, data: attempts } = await authedRequester.get(
        `/quizzes/${quizId}/attempts`,
      );

      // Assert
      assert.strictEqual(status, 200);
      assert.strictEqual(attempts.length, 1);
      assert.ok(attempts[0].user);
      assert.ok(!attempts[0].user.password);
    });

    it("should allow the quiz author to see their quiz attempts", async () => {
      // Arrange
      await prisma.attempt.create({
        data: { score: 1, max_score: 1, user_id: author.id, quiz_id: quizId },
      });

      // Act
      const { status, data: attempts } = await authorRequester.get(
        `/quizzes/${quizId}/attempts`,
      );

      // Assert
      assert.strictEqual(status, 200);
      assert.strictEqual(attempts.length, 1);
    });

    it("should return 403 when an author tries to see attempts for another author's quiz", async () => {
      // Arrange
      const otherAuthor = await prisma.user.create({
        data: {
          firstname: "Carol",
          lastname: "Other",
          email: "carol-attempts@oclock.io",
          password: await argon2.hash("password"),
          role: "author",
        },
      });
      const otherRequester = buildAuthedRequester(otherAuthor);

      // Act
      const { status } = await otherRequester.get(
        `/quizzes/${quizId}/attempts`,
      );

      // Assert
      assert.strictEqual(status, 403);
    });

    it("should return 403 when a member tries to access quiz attempts", async () => {
      // Arrange
      const member = await prisma.user.create({
        data: {
          firstname: "Dave",
          lastname: "Member",
          email: "dave-attempts@oclock.io",
          password: await argon2.hash("password"),
          role: "member",
        },
      });
      const memberRequester = buildAuthedRequester(member);

      // Act
      const { status } = await memberRequester.get(
        `/quizzes/${quizId}/attempts`,
      );

      // Assert
      assert.strictEqual(status, 403);
    });

    it("should return 404 when the quiz does not exist", async () => {
      const { status } = await authedRequester.get("/quizzes/9999/attempts");
      assert.strictEqual(status, 404);
    });
  });
});
