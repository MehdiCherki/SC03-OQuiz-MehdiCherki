import { beforeEach, describe, it } from "node:test";
import { prisma } from "../models/index.ts";
import assert from "node:assert";
import argon2 from "argon2";
import { authedRequester, buildAuthedRequester } from "../../test/index.ts";
import type { User } from "../models/index.ts";

describe("quiz tags", () => {
  let author: User;
  let authorRequester: ReturnType<typeof buildAuthedRequester>;
  let quizId: number;
  let tagId: number;

  beforeEach(async () => {
    author = await prisma.user.create({
      data: {
        firstname: "Alice",
        lastname: "Author",
        email: "alice-quiz-tags@oclock.io",
        password: await argon2.hash("password"),
        role: "author",
      },
    });
    authorRequester = buildAuthedRequester(author);

    const quiz = await prisma.quiz.create({
      data: { title: "Quiz de test", author_id: author.id },
    });
    quizId = quiz.id;

    const tag = await prisma.tag.create({ data: { name: "JavaScript" } });
    tagId = tag.id;
  });

  // ─── PUT /quizzes/:id/tags/:tagId ─────────────────────────────────────

  describe("[PUT] /api/quizzes/:id/tags/:tagId", () => {
    it("should add a tag to a quiz", async () => {
      // Act
      const { status } = await authorRequester.put(`/quizzes/${quizId}/tags/${tagId}`);

      // Assert
      assert.strictEqual(status, 204);
      const link = await prisma.quizHasTag.findUnique({
        where: { quiz_id_tag_id: { quiz_id: quizId, tag_id: tagId } },
      });
      assert.ok(link);
    });

    it("should be idempotent (adding the same tag twice does not fail)", async () => {
      // Act
      await authorRequester.put(`/quizzes/${quizId}/tags/${tagId}`);
      const { status } = await authorRequester.put(`/quizzes/${quizId}/tags/${tagId}`);

      // Assert
      assert.strictEqual(status, 204);
      const count = await prisma.quizHasTag.count({ where: { quiz_id: quizId } });
      assert.strictEqual(count, 1);
    });

    it("should return 404 when the quiz does not exist", async () => {
      const { status } = await authorRequester.put(`/quizzes/9999/tags/${tagId}`);
      assert.strictEqual(status, 404);
    });

    it("should return 404 when the tag does not exist", async () => {
      const { status } = await authorRequester.put(`/quizzes/${quizId}/tags/9999`);
      assert.strictEqual(status, 404);
    });

    it("should return 403 when an author tries to tag another author's quiz", async () => {
      // Arrange
      const otherAuthor = await prisma.user.create({
        data: {
          firstname: "Bob",
          lastname: "Other",
          email: "bob-quiz-tags@oclock.io",
          password: await argon2.hash("password"),
          role: "author",
        },
      });
      const otherRequester = buildAuthedRequester(otherAuthor);

      // Act
      const { status } = await otherRequester.put(`/quizzes/${quizId}/tags/${tagId}`);

      // Assert
      assert.strictEqual(status, 403);
    });

    it("should allow an admin to add a tag to any quiz", async () => {
      const { status } = await authedRequester.put(`/quizzes/${quizId}/tags/${tagId}`);
      assert.strictEqual(status, 204);
    });
  });

  // ─── DELETE /quizzes/:id/tags/:tagId ──────────────────────────────────

  describe("[DELETE] /api/quizzes/:id/tags/:tagId", () => {
    it("should remove a tag from a quiz", async () => {
      // Arrange
      await prisma.quizHasTag.create({ data: { quiz_id: quizId, tag_id: tagId } });

      // Act
      const { status } = await authorRequester.delete(`/quizzes/${quizId}/tags/${tagId}`);

      // Assert
      assert.strictEqual(status, 204);
      const link = await prisma.quizHasTag.findUnique({
        where: { quiz_id_tag_id: { quiz_id: quizId, tag_id: tagId } },
      });
      assert.strictEqual(link, null);
    });

    it("should return 404 when the quiz does not exist", async () => {
      const { status } = await authorRequester.delete(`/quizzes/9999/tags/${tagId}`);
      assert.strictEqual(status, 404);
    });

    it("should return 404 when the tag is not associated with the quiz", async () => {
      // Act — tag existe mais n'est pas lié au quiz
      const { status } = await authorRequester.delete(`/quizzes/${quizId}/tags/${tagId}`);
      assert.strictEqual(status, 404);
    });

    it("should return 403 when an author tries to remove a tag from another author's quiz", async () => {
      // Arrange
      const otherAuthor = await prisma.user.create({
        data: {
          firstname: "Carol",
          lastname: "Other",
          email: "carol-quiz-tags@oclock.io",
          password: await argon2.hash("password"),
          role: "author",
        },
      });
      await prisma.quizHasTag.create({ data: { quiz_id: quizId, tag_id: tagId } });
      const otherRequester = buildAuthedRequester(otherAuthor);

      // Act
      const { status } = await otherRequester.delete(`/quizzes/${quizId}/tags/${tagId}`);

      // Assert
      assert.strictEqual(status, 403);
    });

    it("should allow an admin to remove a tag from any quiz", async () => {
      // Arrange
      await prisma.quizHasTag.create({ data: { quiz_id: quizId, tag_id: tagId } });

      // Act
      const { status } = await authedRequester.delete(`/quizzes/${quizId}/tags/${tagId}`);
      assert.strictEqual(status, 204);
    });
  });
});
