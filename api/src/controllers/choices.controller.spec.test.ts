import { beforeEach, describe, it } from "node:test";
import { prisma } from "../models/index.ts";
import assert from "node:assert";
import argon2 from "argon2";
import { authedRequester, buildAuthedRequester } from "../../test/index.ts";
import type { User } from "../models/index.ts";

describe("choices", () => {
  let author: User;
  let authorRequester: ReturnType<typeof buildAuthedRequester>;
  let questionId: number;

  beforeEach(async () => {
    author = await prisma.user.create({
      data: {
        firstname: "Alice",
        lastname: "Author",
        email: "alice-choices@oclock.io",
        password: await argon2.hash("password"),
        role: "author",
      },
    });
    authorRequester = buildAuthedRequester(author);

    const quiz = await prisma.quiz.create({
      data: { title: "Quiz de test", author_id: author.id },
    });
    const question = await prisma.question.create({
      data: { description: "Question de test", quiz_id: quiz.id },
    });
    questionId = question.id;
  });

  // ─── PATCH /choices/:id ───────────────────────────────────────────────

  describe("[PATCH] /api/choices/:id", () => {
    it("should update the choice description", async () => {
      // Arrange
      const choice = await prisma.choice.create({
        data: {
          description: "Ancien libellé",
          is_valid: false,
          question_id: questionId,
        },
      });

      // Act
      const { status, data: updated } = await authorRequester.patch(
        `/choices/${choice.id}`,
        { description: "Nouveau libellé" },
      );

      // Assert
      assert.strictEqual(status, 200);
      assert.strictEqual(updated.description, "Nouveau libellé");
      assert.strictEqual(updated.is_valid, false);
    });

    it("should update is_valid", async () => {
      // Arrange
      const choice = await prisma.choice.create({
        data: {
          description: "Paris",
          is_valid: false,
          question_id: questionId,
        },
      });

      // Act
      const { data: updated } = await authorRequester.patch(
        `/choices/${choice.id}`,
        {
          is_valid: true,
        },
      );

      // Assert
      assert.strictEqual(updated.is_valid, true);
    });

    it("should return 404 when the choice does not exist", async () => {
      const { status } = await authorRequester.patch("/choices/9999", {
        description: "N'existe pas",
      });
      assert.strictEqual(status, 404);
    });

    it("should return 403 when an author tries to update a choice from another author's quiz", async () => {
      // Arrange
      const otherAuthor = await prisma.user.create({
        data: {
          firstname: "Bob",
          lastname: "Other",
          email: "bob-choices@oclock.io",
          password: await argon2.hash("password"),
          role: "author",
        },
      });
      const choice = await prisma.choice.create({
        data: {
          description: "Choix d'Alice",
          is_valid: true,
          question_id: questionId,
        },
      });
      const otherRequester = buildAuthedRequester(otherAuthor);

      // Act
      const { status } = await otherRequester.patch(`/choices/${choice.id}`, {
        description: "Piraté",
      });

      // Assert
      assert.strictEqual(status, 403);
    });

    it("should allow an admin to update any choice", async () => {
      // Arrange
      const choice = await prisma.choice.create({
        data: {
          description: "Choix d'Alice",
          is_valid: false,
          question_id: questionId,
        },
      });

      // Act
      const { status } = await authedRequester.patch(`/choices/${choice.id}`, {
        description: "Modifié par l'admin",
      });

      // Assert
      assert.strictEqual(status, 200);
    });
  });

  // ─── DELETE /choices/:id ──────────────────────────────────────────────

  describe("[DELETE] /api/choices/:id", () => {
    it("should delete the choice from the database", async () => {
      // Arrange
      const choice = await prisma.choice.create({
        data: {
          description: "À supprimer",
          is_valid: false,
          question_id: questionId,
        },
      });

      // Act
      const { status } = await authorRequester.delete(`/choices/${choice.id}`);

      // Assert
      assert.strictEqual(status, 204);
      assert.strictEqual(await prisma.choice.count(), 0);
    });

    it("should return 404 when the choice does not exist", async () => {
      const { status } = await authorRequester.delete("/choices/9999");
      assert.strictEqual(status, 404);
    });

    it("should return 403 when an author tries to delete a choice from another author's quiz", async () => {
      // Arrange
      const otherAuthor = await prisma.user.create({
        data: {
          firstname: "Carol",
          lastname: "Other",
          email: "carol-choices@oclock.io",
          password: await argon2.hash("password"),
          role: "author",
        },
      });
      const choice = await prisma.choice.create({
        data: {
          description: "Choix d'Alice",
          is_valid: true,
          question_id: questionId,
        },
      });
      const otherRequester = buildAuthedRequester(otherAuthor);

      // Act
      const { status } = await otherRequester.delete(`/choices/${choice.id}`);

      // Assert
      assert.strictEqual(status, 403);
    });

    it("should allow an admin to delete any choice", async () => {
      // Arrange
      const choice = await prisma.choice.create({
        data: {
          description: "Choix d'Alice",
          is_valid: true,
          question_id: questionId,
        },
      });

      // Act
      const { status } = await authedRequester.delete(`/choices/${choice.id}`);

      // Assert
      assert.strictEqual(status, 204);
    });
  });
});
