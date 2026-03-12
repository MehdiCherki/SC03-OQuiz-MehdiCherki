import { beforeEach, describe, it } from "node:test";
import { prisma } from "../models/index.ts";
import assert from "node:assert";
import argon2 from "argon2";
import { authedRequester, buildAuthedRequester } from "../../test/index.ts";
import type { User } from "../models/index.ts";

// Wrap global pour scoper le beforeEach aux seuls tests quizzes
// (évite de polluer les autres fichiers de test avec --experimental-test-isolation=none)
describe("quizzes", () => {
  let author: User;
  let authorRequester: ReturnType<typeof buildAuthedRequester>;

  beforeEach(async () => {
    author = await prisma.user.create({
      data: {
        firstname: "Alice",
        lastname: "Author",
        email: "alice@oclock.io",
        password: await argon2.hash("password"),
        role: "author",
      },
    });
    authorRequester = buildAuthedRequester(author);
  });

  describe("[GET] /api/quizzes", () => {
    it("should return all quizzes from the database", async () => {
      // Arrange
      await prisma.quiz.createMany({
        data: [
          { title: "Quiz JS", author_id: author.id },
          { title: "Quiz TS", author_id: author.id },
        ],
      });

      // Act
      const { data: quizzes } = await authedRequester.get("/quizzes");

      // Assert
      assert.strictEqual(quizzes.length, 2);
      assert.strictEqual(quizzes[0].title, "Quiz JS");
      assert.strictEqual(quizzes[1].title, "Quiz TS");
    });

    it("should return an empty array when there are no quizzes", async () => {
      // Act
      const { data: quizzes } = await authedRequester.get("/quizzes");

      // Assert
      assert.deepStrictEqual(quizzes, []);
    });

    it("should return 401 when accessed without authentication", async () => {
      // Act — requête sans token
      const response = await fetch(`http://localhost:7357/api/quizzes`);

      // Assert
      assert.strictEqual(response.status, 401);
    });
  });

  describe("[GET] /api/quizzes/recent", () => {
    it("should return the 6 most recent quizzes without authentication", async () => {
      // Arrange
      for (let i = 1; i <= 8; i++) {
        await prisma.quiz.create({
          data: { title: `Quiz ${i}`, author_id: author.id },
        });
      }

      // Act — requête sans token
      const response = await fetch(`http://localhost:7357/api/quizzes/recent`);
      const quizzes = await response.json();

      // Assert
      assert.strictEqual(response.status, 200);
      assert.strictEqual(quizzes.length, 6);
    });

    it("should return less than 6 quizzes when fewer exist", async () => {
      // Arrange
      await prisma.quiz.create({
        data: { title: "Quiz unique", author_id: author.id },
      });

      // Act
      const { data: quizzes } = await authedRequester.get("/quizzes/recent");

      // Assert
      assert.strictEqual(quizzes.length, 1);
    });
  });

  describe("[GET] /api/quizzes/:id", () => {
    it("should return the quiz from the database", async () => {
      // Arrange
      const QUIZ = { title: "Quiz Node.js", description: "Un quiz sur Node" };
      const databaseQuiz = await prisma.quiz.create({
        data: { ...QUIZ, author_id: author.id },
      });

      // Act
      const { data: quiz } = await authedRequester.get(
        `/quizzes/${databaseQuiz.id}`,
      );

      // Assert
      assert.partialDeepStrictEqual(quiz, QUIZ);
    });

    it("should return the quiz with its questions and choices", async () => {
      // Arrange
      const quiz = await prisma.quiz.create({
        data: { title: "Quiz complet", author_id: author.id },
      });
      const question = await prisma.question.create({
        data: {
          description: "Quelle est la capitale de la France ?",
          quiz_id: quiz.id,
        },
      });
      await prisma.choice.createMany({
        data: [
          { description: "Paris", is_valid: true, question_id: question.id },
          { description: "Lyon", is_valid: false, question_id: question.id },
        ],
      });

      // Act
      const { data: returnedQuiz } = await authedRequester.get(
        `/quizzes/${quiz.id}`,
      );

      // Assert
      assert.strictEqual(returnedQuiz.questions.length, 1);
      assert.strictEqual(
        returnedQuiz.questions[0].description,
        "Quelle est la capitale de la France ?",
      );
      assert.strictEqual(returnedQuiz.questions[0].choices.length, 2);
      assert.ok(
        returnedQuiz.questions[0].choices.some(
          (c: { description: string }) => c.description === "Paris",
        ),
      );
      assert.ok(
        returnedQuiz.questions[0].choices.some(
          (c: { description: string }) => c.description === "Lyon",
        ),
      );
    });

    it("should return a 404 when the requested quiz does not exist", async () => {
      // Arrange
      const UNEXISTING_QUIZ_ID = 42;

      // Act
      const { status } = await authedRequester.get(
        `/quizzes/${UNEXISTING_QUIZ_ID}`,
      );

      // Assert
      assert.equal(status, 404);
    });
  });

  describe("[GET] /api/quizzes/:id/questions", () => {
    it("should return the questions and choices for a quiz", async () => {
      // Arrange
      const quiz = await prisma.quiz.create({
        data: { title: "Quiz avec questions", author_id: author.id },
      });
      const question = await prisma.question.create({
        data: {
          description: "Quelle est la capitale de l'Italie ?",
          quiz_id: quiz.id,
        },
      });
      await prisma.choice.createMany({
        data: [
          { description: "Rome", is_valid: true, question_id: question.id },
          { description: "Milan", is_valid: false, question_id: question.id },
        ],
      });

      // Act
      const { data: questions } = await authedRequester.get(
        `/quizzes/${quiz.id}/questions`,
      );

      // Assert
      assert.strictEqual(questions.length, 1);
      assert.strictEqual(
        questions[0].description,
        "Quelle est la capitale de l'Italie ?",
      );
      assert.strictEqual(questions[0].choices.length, 2);
    });

    it("should return a 404 when the quiz does not exist", async () => {
      const { status } = await authedRequester.get("/quizzes/9999/questions");
      assert.strictEqual(status, 404);
    });

    it("should return 401 when accessed without authentication", async () => {
      const quiz = await prisma.quiz.create({
        data: { title: "Quiz", author_id: author.id },
      });
      const response = await fetch(
        `http://localhost:7357/api/quizzes/${quiz.id}/questions`,
      );
      assert.strictEqual(response.status, 401);
    });
  });

  describe("[POST] /api/quizzes", () => {
    it("should create a quiz in the database", async () => {
      // Arrange
      const body = { title: "Mon nouveau quiz" };

      // Act
      await authorRequester.post("/quizzes", body);

      // Assert
      const createdQuiz = await prisma.quiz.findFirst({
        where: { title: "Mon nouveau quiz" },
      });
      assert.ok(createdQuiz);
      assert.strictEqual(createdQuiz.author_id, author.id);
    });

    it("should return the created quiz with the right properties", async () => {
      // Arrange
      const body = {
        title: "Quiz avec description",
        description: "Une description",
      };

      // Act
      const { data: createdQuiz, status } = await authorRequester.post(
        "/quizzes",
        body,
      );

      // Assert
      assert.strictEqual(status, 201);
      assert.ok(createdQuiz.id);
      assert.ok(createdQuiz.created_at);
      assert.ok(createdQuiz.updated_at);
      assert.strictEqual(createdQuiz.title, "Quiz avec description");
      assert.strictEqual(createdQuiz.description, "Une description");
      assert.strictEqual(createdQuiz.author_id, author.id);
    });

    it("should set author_id from the authenticated user", async () => {
      // Act
      const { data: createdQuiz } = await authorRequester.post("/quizzes", {
        title: "Quiz auteur",
      });

      // Assert
      assert.strictEqual(createdQuiz.author_id, author.id);
    });

    it("should return 403 when a member tries to create a quiz", async () => {
      // Arrange
      const member = await prisma.user.create({
        data: {
          firstname: "Bob",
          lastname: "Member",
          email: "bob@oclock.io",
          password: await argon2.hash("password"),
          role: "member",
        },
      });
      const memberRequester = buildAuthedRequester(member);

      // Act
      const { status } = await memberRequester.post("/quizzes", {
        title: "Interdit",
      });

      // Assert
      assert.strictEqual(status, 403);
    });
  });

  describe("[PATCH] /api/quizzes/:id", () => {
    it("should update the quiz title in the database", async () => {
      // Arrange
      const quiz = await prisma.quiz.create({
        data: { title: "Titre original", author_id: author.id },
      });
      const NEW_TITLE = "Nouveau titre";

      // Act
      const httpResponse = await authorRequester.patch(`/quizzes/${quiz.id}`, {
        title: NEW_TITLE,
      });

      // Assert
      assert.strictEqual(httpResponse.status, 200);
      assert.strictEqual(httpResponse.data.title, NEW_TITLE);
    });

    it("should update the quiz description", async () => {
      // Arrange
      const quiz = await prisma.quiz.create({
        data: {
          title: "Quiz",
          description: "Ancienne description",
          author_id: author.id,
        },
      });

      // Act
      const httpResponse = await authorRequester.patch(`/quizzes/${quiz.id}`, {
        description: "Nouvelle description",
      });

      // Assert
      assert.strictEqual(httpResponse.status, 200);
      assert.strictEqual(httpResponse.data.description, "Nouvelle description");
    });

    it("should return a 404 when the quiz to update does not exist", async () => {
      // Arrange
      const UNEXISTING_QUIZ_ID = 42;

      // Act
      const { status } = await authorRequester.patch(
        `/quizzes/${UNEXISTING_QUIZ_ID}`,
        { title: "Nouveau" },
      );

      // Assert
      assert.strictEqual(status, 404);
    });

    it("should return 403 when an author tries to update a quiz they don't own", async () => {
      // Arrange — quiz créé par un autre auteur
      const otherAuthor = await prisma.user.create({
        data: {
          firstname: "Bob",
          lastname: "Other",
          email: "bob@oclock.io",
          password: await argon2.hash("password"),
          role: "author",
        },
      });
      const quiz = await prisma.quiz.create({
        data: { title: "Quiz de Bob", author_id: otherAuthor.id },
      });

      // Act — Alice essaie de modifier le quiz de Bob
      const { status } = await authorRequester.patch(`/quizzes/${quiz.id}`, {
        title: "Piraté",
      });

      // Assert
      assert.strictEqual(status, 403);
    });

    it("should allow an admin to update any quiz", async () => {
      // Arrange
      const quiz = await prisma.quiz.create({
        data: { title: "Quiz d'Alice", author_id: author.id },
      });

      // Act — admin modifie le quiz d'Alice
      const { status, data } = await authedRequester.patch(
        `/quizzes/${quiz.id}`,
        { title: "Modifié par admin" },
      );

      // Assert
      assert.strictEqual(status, 200);
      assert.strictEqual(data.title, "Modifié par admin");
    });
  });

  describe("[DELETE] /api/quizzes/:id", () => {
    it("should delete the quiz from the database", async () => {
      // Arrange
      const quiz = await prisma.quiz.create({
        data: { title: "Quiz à supprimer", author_id: author.id },
      });

      // Act
      const { status } = await authorRequester.delete(`/quizzes/${quiz.id}`);

      // Assert
      assert.equal(status, 204);
      const remainingQuizzes = await prisma.quiz.count();
      assert.equal(remainingQuizzes, 0);
    });

    it("should delete the quiz along with its questions and choices (cascade)", async () => {
      // Arrange
      const quiz = await prisma.quiz.create({
        data: { title: "Quiz avec questions", author_id: author.id },
      });
      const question = await prisma.question.create({
        data: { description: "Une question", quiz_id: quiz.id },
      });
      await prisma.choice.create({
        data: {
          description: "Une réponse",
          is_valid: true,
          question_id: question.id,
        },
      });

      // Act
      await authorRequester.delete(`/quizzes/${quiz.id}`);

      // Assert
      assert.equal(await prisma.question.count(), 0);
      assert.equal(await prisma.choice.count(), 0);
    });

    it("should return a 404 when the quiz to delete does not exist", async () => {
      // Arrange
      const UNEXISTING_QUIZ_ID = 42;

      // Act
      const { status } = await authorRequester.delete(
        `/quizzes/${UNEXISTING_QUIZ_ID}`,
      );

      // Assert
      assert.equal(status, 404);
    });

    it("should return 403 when an author tries to delete a quiz they don't own", async () => {
      // Arrange
      const otherAuthor = await prisma.user.create({
        data: {
          firstname: "Bob",
          lastname: "Other",
          email: "bob@oclock.io",
          password: await argon2.hash("password"),
          role: "author",
        },
      });
      const quiz = await prisma.quiz.create({
        data: { title: "Quiz de Bob", author_id: otherAuthor.id },
      });

      // Act — Alice essaie de supprimer le quiz de Bob
      const { status } = await authorRequester.delete(`/quizzes/${quiz.id}`);

      // Assert
      assert.strictEqual(status, 403);
    });

    it("should allow an admin to delete any quiz", async () => {
      // Arrange
      const quiz = await prisma.quiz.create({
        data: { title: "Quiz d'Alice", author_id: author.id },
      });

      // Act — admin supprime le quiz d'Alice
      const { status } = await authedRequester.delete(`/quizzes/${quiz.id}`);

      // Assert
      assert.equal(status, 204);
    });
  });
});
