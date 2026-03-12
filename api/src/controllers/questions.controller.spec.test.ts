import { beforeEach, describe, it } from "node:test";
import { prisma } from "../models/index.ts";
import assert from "node:assert";
import argon2 from "argon2";
import { authedRequester, buildAuthedRequester } from "../../test/index.ts";
import type { User } from "../models/index.ts";

describe("questions & choices", () => {
  let author: User;
  let authorRequester: ReturnType<typeof buildAuthedRequester>;
  let quizId: number;

  beforeEach(async () => {
    author = await prisma.user.create({
      data: {
        firstname: "Alice",
        lastname: "Author",
        email: "alice-questions@oclock.io",
        password: await argon2.hash("password"),
        role: "author",
      },
    });
    authorRequester = buildAuthedRequester(author);

    const quiz = await prisma.quiz.create({
      data: { title: "Quiz de test", author_id: author.id },
    });
    quizId = quiz.id;
  });

  // ─── POST /quizzes/:id/questions ─────────────────────────────────────

  describe("[POST] /api/quizzes/:id/questions", () => {
    it("should create a question in the database", async () => {
      // Act
      const { status, data: question } = await authorRequester.post(
        `/quizzes/${quizId}/questions`,
        { description: "Quelle est la capitale de la France ?" },
      );

      // Assert
      assert.strictEqual(status, 201);
      assert.ok(question.id);
      assert.strictEqual(question.quiz_id, quizId);
      assert.strictEqual(
        question.description,
        "Quelle est la capitale de la France ?",
      );
    });

    it("should create a question with a level", async () => {
      // Arrange
      const level = await prisma.level.create({ data: { name: "Facile" } });

      // Act
      const { data: question } = await authorRequester.post(
        `/quizzes/${quizId}/questions`,
        { description: "Question avec niveau", level_id: level.id },
      );

      // Assert
      assert.strictEqual(question.level_id, level.id);
    });

    it("should return 404 when the quiz does not exist", async () => {
      const { status } = await authorRequester.post("/quizzes/9999/questions", {
        description: "Question orpheline",
      });
      assert.strictEqual(status, 404);
    });

    it("should return 403 when an author tries to add a question to another author's quiz", async () => {
      // Arrange
      const otherAuthor = await prisma.user.create({
        data: {
          firstname: "Bob",
          lastname: "Other",
          email: "bob-questions@oclock.io",
          password: await argon2.hash("password"),
          role: "author",
        },
      });
      const otherRequester = buildAuthedRequester(otherAuthor);

      // Act
      const { status } = await otherRequester.post(
        `/quizzes/${quizId}/questions`,
        {
          description: "Tentative de piratage",
        },
      );

      // Assert
      assert.strictEqual(status, 403);
    });

    it("should return 403 when a member tries to create a question", async () => {
      // Arrange
      const member = await prisma.user.create({
        data: {
          firstname: "Carol",
          lastname: "Member",
          email: "carol-questions@oclock.io",
          password: await argon2.hash("password"),
          role: "member",
        },
      });
      const memberRequester = buildAuthedRequester(member);

      // Act
      const { status } = await memberRequester.post(
        `/quizzes/${quizId}/questions`,
        {
          description: "Question interdite",
        },
      );

      // Assert
      assert.strictEqual(status, 403);
    });

    it("should allow an admin to create a question in any quiz", async () => {
      const { status } = await authedRequester.post(
        `/quizzes/${quizId}/questions`,
        {
          description: "Question de l'admin",
        },
      );
      assert.strictEqual(status, 201);
    });
  });

  // ─── PATCH /questions/:id ─────────────────────────────────────────────

  describe("[PATCH] /api/questions/:id", () => {
    it("should update the question description", async () => {
      // Arrange
      const question = await prisma.question.create({
        data: { description: "Ancienne description", quiz_id: quizId },
      });

      // Act
      const { status, data: updated } = await authorRequester.patch(
        `/questions/${question.id}`,
        { description: "Nouvelle description" },
      );

      // Assert
      assert.strictEqual(status, 200);
      assert.strictEqual(updated.description, "Nouvelle description");
    });

    it("should return 404 when the question does not exist", async () => {
      const { status } = await authorRequester.patch("/questions/9999", {
        description: "N'existe pas",
      });
      assert.strictEqual(status, 404);
    });

    it("should return 403 when an author tries to update a question from another author's quiz", async () => {
      // Arrange
      const otherAuthor = await prisma.user.create({
        data: {
          firstname: "Dave",
          lastname: "Other",
          email: "dave-questions@oclock.io",
          password: await argon2.hash("password"),
          role: "author",
        },
      });
      const question = await prisma.question.create({
        data: { description: "Question de Dave", quiz_id: quizId },
      });
      const otherRequester = buildAuthedRequester(otherAuthor);

      // Act
      const { status } = await otherRequester.patch(
        `/questions/${question.id}`,
        {
          description: "Piraté",
        },
      );

      // Assert
      assert.strictEqual(status, 403);
    });

    it("should allow an admin to update any question", async () => {
      // Arrange
      const question = await prisma.question.create({
        data: { description: "Question d'Alice", quiz_id: quizId },
      });

      // Act
      const { status } = await authedRequester.patch(
        `/questions/${question.id}`,
        {
          description: "Modifiée par l'admin",
        },
      );

      // Assert
      assert.strictEqual(status, 200);
    });
  });

  // ─── DELETE /questions/:id ────────────────────────────────────────────

  describe("[DELETE] /api/questions/:id", () => {
    it("should delete the question from the database", async () => {
      // Arrange
      const question = await prisma.question.create({
        data: { description: "À supprimer", quiz_id: quizId },
      });

      // Act
      const { status } = await authorRequester.delete(
        `/questions/${question.id}`,
      );

      // Assert
      assert.strictEqual(status, 204);
      assert.strictEqual(await prisma.question.count(), 0);
    });

    it("should delete the question along with its choices (cascade)", async () => {
      // Arrange
      const question = await prisma.question.create({
        data: { description: "Question avec choix", quiz_id: quizId },
      });
      await prisma.choice.createMany({
        data: [
          { description: "Choix A", is_valid: true, question_id: question.id },
          { description: "Choix B", is_valid: false, question_id: question.id },
        ],
      });

      // Act
      await authorRequester.delete(`/questions/${question.id}`);

      // Assert
      assert.strictEqual(await prisma.choice.count(), 0);
    });

    it("should return 404 when the question does not exist", async () => {
      const { status } = await authorRequester.delete("/questions/9999");
      assert.strictEqual(status, 404);
    });

    it("should return 403 when an author tries to delete a question from another author's quiz", async () => {
      // Arrange
      const otherAuthor = await prisma.user.create({
        data: {
          firstname: "Eve",
          lastname: "Other",
          email: "eve-questions@oclock.io",
          password: await argon2.hash("password"),
          role: "author",
        },
      });
      const question = await prisma.question.create({
        data: { description: "Question d'Alice", quiz_id: quizId },
      });
      const otherRequester = buildAuthedRequester(otherAuthor);

      // Act
      const { status } = await otherRequester.delete(
        `/questions/${question.id}`,
      );

      // Assert
      assert.strictEqual(status, 403);
    });
  });

  // ─── POST /questions/:id/choices ─────────────────────────────────────

  describe("[POST] /api/questions/:id/choices", () => {
    it("should create a choice for a question", async () => {
      // Arrange
      const question = await prisma.question.create({
        data: { description: "Quelle est la capitale ?", quiz_id: quizId },
      });

      // Act
      const { status, data: choice } = await authorRequester.post(
        `/questions/${question.id}/choices`,
        { description: "Paris", is_valid: true },
      );

      // Assert
      assert.strictEqual(status, 201);
      assert.ok(choice.id);
      assert.strictEqual(choice.question_id, question.id);
      assert.strictEqual(choice.description, "Paris");
      assert.strictEqual(choice.is_valid, true);
    });

    it("should return 404 when the question does not exist", async () => {
      const { status } = await authorRequester.post("/questions/9999/choices", {
        description: "Choix orphelin",
        is_valid: false,
      });
      assert.strictEqual(status, 404);
    });

    it("should return 403 when an author tries to add a choice to another author's question", async () => {
      // Arrange
      const otherAuthor = await prisma.user.create({
        data: {
          firstname: "Frank",
          lastname: "Other",
          email: "frank-questions@oclock.io",
          password: await argon2.hash("password"),
          role: "author",
        },
      });
      const question = await prisma.question.create({
        data: { description: "Question d'Alice", quiz_id: quizId },
      });
      const otherRequester = buildAuthedRequester(otherAuthor);

      // Act
      const { status } = await otherRequester.post(
        `/questions/${question.id}/choices`,
        {
          description: "Choix piraté",
          is_valid: false,
        },
      );

      // Assert
      assert.strictEqual(status, 403);
    });
  });
});
