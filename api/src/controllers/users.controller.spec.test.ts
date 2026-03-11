import assert from "node:assert";
import { describe, it } from "node:test";
import { prisma } from "../models/index.ts";
import argon2 from "argon2";
import { authedRequester, buildAuthedRequester } from "../../test/index.ts";

describe("[GET] /api/users", () => {
  it("should return an array containing the users from the database", async () => {
    // Arrange
    // - utiliser prisma pour insérer un user en BDD
    const databaseUsers = await prisma.user.createManyAndReturn({
      data: [
        {
          firstname: "Alice",
          lastname: "Oclock",
          email: "alice@oclock.io",
          password: "P4$$word!",
        },
        {
          firstname: "Bobby",
          lastname: "Oclock",
          email: "bobby@oclock.io",
          password: "P4$$word!",
        },
      ],
    });

    // Act
    // - appel API
    const { data: responseUsers } = await authedRequester.get("/users"); // data = le body jsonifié

    // Assert
    // - s'assurer que le retour de l'API correspond bien à l'utilisateur qu'on a inséré en base avec prisma
    assert.strictEqual(responseUsers.length, 2); // On vérifie que c'est un tableau avec 2 éléments
    assert.strictEqual(responseUsers[0].id, databaseUsers[0].id); // On vérifie que l'ID reçu pour Alice est bien le même que celui la BDD
    assert.strictEqual(responseUsers[1].id, databaseUsers[1].id);
    assert.strictEqual(responseUsers[0].email, "alice@oclock.io");
    assert.strictEqual(responseUsers[1].email, "bobby@oclock.io");
  });

  it("should return users with the necessary properties", async () => {
    // Arrange
    const aliceFromDatabase = await prisma.user.create({
      data: {
        firstname: "Alice",
        lastname: "Oclock",
        email: "alice@oclock.io",
        password: "P4$$word!",
      },
    });

    // Act
    const {
      data: [aliceFromAPI],
    } = await authedRequester.get("/users");

    // Assert
    assert.deepStrictEqual(aliceFromAPI, {
      id: aliceFromDatabase.id,
      firstname: aliceFromDatabase.firstname,
      lastname: aliceFromDatabase.lastname,
      email: aliceFromDatabase.email,
      role: aliceFromDatabase.role,
      created_at: aliceFromDatabase.created_at.toISOString(),
      updated_at: aliceFromDatabase.updated_at.toISOString(),
    });
  });

  it("should return 403 when a member calls GET /users", async () => {
    // Arrange
    const member = await prisma.user.create({
      data: {
        firstname: "Member",
        lastname: "Test",
        email: "member-getusers@oclock.io",
        password: await argon2.hash("password"),
        role: "member",
      },
    });
    const memberRequester = buildAuthedRequester(member);

    // Act
    const { status } = await memberRequester.get("/users");

    // Assert
    assert.strictEqual(status, 403);
  });

  it("should accept the 'limit' query param", async () => {
    // Arrange
    await prisma.user.createManyAndReturn({
      data: [
        {
          firstname: "Charlie",
          lastname: "Smith",
          email: "charlie@example.com",
          password: "SecurePass1!",
        },
        {
          firstname: "Diana",
          lastname: "Johnson",
          email: "diana@example.com",
          password: "MyPass123!",
        },
        {
          firstname: "Edward",
          lastname: "Brown",
          email: "edward@example.com",
          password: "StrongPwd2!",
        },
        {
          firstname: "Fiona",
          lastname: "Davis",
          email: "fiona@example.com",
          password: "SafeWord4!",
        },
        {
          firstname: "George",
          lastname: "Wilson",
          email: "george@example.com",
          password: "Password5!",
        },
      ],
    });
    const NB_OF_REQUESTED_USERS = 3;

    // Act
    const { data: users } = await authedRequester.get(
      `/users?limit=${NB_OF_REQUESTED_USERS}`,
    );

    // Assert
    assert.strictEqual(users.length, NB_OF_REQUESTED_USERS);
  });
});

describe("[GET] /api/users/:id/profile", () => {
  it("should return the user profile with nb_quiz_played", async () => {
    // Arrange
    const user = await prisma.user.create({
      data: {
        firstname: "Carol",
        lastname: "Profile",
        email: "carol-profile@oclock.io",
        password: await argon2.hash("password"),
        role: "member",
      },
    });
    const author = await prisma.user.create({
      data: {
        firstname: "Dave",
        lastname: "Author",
        email: "dave-profile-author@oclock.io",
        password: await argon2.hash("password"),
        role: "author",
      },
    });
    const quiz = await prisma.quiz.create({ data: { title: "Quiz test", author_id: author.id } });
    await prisma.attempt.create({ data: { score: 3, max_score: 5, user_id: user.id, quiz_id: quiz.id } });

    // Act
    const { data: profile, status } = await authedRequester.get(`/users/${user.id}/profile`);

    // Assert
    assert.strictEqual(status, 200);
    assert.strictEqual(profile.id, user.id);
    assert.strictEqual(profile.email, user.email);
    assert.strictEqual(profile.nb_quiz_played, 1);
    assert.ok(!profile.password);
  });

  it("should return a 404 when the user does not exist", async () => {
    const { status } = await authedRequester.get("/users/9999/profile");
    assert.strictEqual(status, 404);
  });

  it("should return 401 when accessed without authentication", async () => {
    const user = await prisma.user.create({
      data: {
        firstname: "Eve",
        lastname: "Test",
        email: "eve-profile@oclock.io",
        password: await argon2.hash("password"),
        role: "member",
      },
    });
    const response = await fetch(`http://localhost:7357/api/users/${user.id}/profile`);
    assert.strictEqual(response.status, 401);
  });
});

describe("[GET] /api/users/:id/attempts", () => {
  it("should return the attempts of a user (admin access)", async () => {
    // Arrange
    const user = await prisma.user.create({
      data: {
        firstname: "Frank",
        lastname: "Attempts",
        email: "frank-attempts@oclock.io",
        password: await argon2.hash("password"),
        role: "member",
      },
    });
    const author = await prisma.user.create({
      data: {
        firstname: "Grace",
        lastname: "Author",
        email: "grace-attempts-author@oclock.io",
        password: await argon2.hash("password"),
        role: "author",
      },
    });
    const quiz = await prisma.quiz.create({ data: { title: "Quiz attempts", author_id: author.id } });
    await prisma.attempt.create({ data: { score: 2, max_score: 4, user_id: user.id, quiz_id: quiz.id } });

    // Act — admin accède aux tentatives de n'importe qui
    const { data: attempts, status } = await authedRequester.get(`/users/${user.id}/attempts`);

    // Assert
    assert.strictEqual(status, 200);
    assert.strictEqual(attempts.length, 1);
    assert.strictEqual(attempts[0].score, 2);
    assert.ok(attempts[0].quiz);
  });

  it("should allow a user to access their own attempts", async () => {
    // Arrange
    const user = await prisma.user.create({
      data: {
        firstname: "Hank",
        lastname: "Self",
        email: "hank-self@oclock.io",
        password: await argon2.hash("password"),
        role: "member",
      },
    });
    const userRequester = buildAuthedRequester(user);
    const author = await prisma.user.create({
      data: {
        firstname: "Iris",
        lastname: "Author",
        email: "iris-self-author@oclock.io",
        password: await argon2.hash("password"),
        role: "author",
      },
    });
    const quiz = await prisma.quiz.create({ data: { title: "Quiz self", author_id: author.id } });
    await prisma.attempt.create({ data: { score: 1, max_score: 3, user_id: user.id, quiz_id: quiz.id } });

    // Act
    const { data: attempts, status } = await userRequester.get(`/users/${user.id}/attempts`);

    // Assert
    assert.strictEqual(status, 200);
    assert.strictEqual(attempts.length, 1);
  });

  it("should return 403 when a member tries to access another user's attempts", async () => {
    // Arrange
    const member = await prisma.user.create({
      data: {
        firstname: "Jack",
        lastname: "Member",
        email: "jack-403@oclock.io",
        password: await argon2.hash("password"),
        role: "member",
      },
    });
    const otherUser = await prisma.user.create({
      data: {
        firstname: "Kate",
        lastname: "Other",
        email: "kate-other@oclock.io",
        password: await argon2.hash("password"),
        role: "member",
      },
    });
    const memberRequester = buildAuthedRequester(member);

    // Act
    const { status } = await memberRequester.get(`/users/${otherUser.id}/attempts`);

    // Assert
    assert.strictEqual(status, 403);
  });

  it("should return a 404 when the user does not exist", async () => {
    const { status } = await authedRequester.get("/users/9999/attempts");
    assert.strictEqual(status, 404);
  });
});
