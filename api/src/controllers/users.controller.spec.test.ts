import assert from "node:assert";
import { describe, it } from "node:test";
import { prisma } from "../models/index.ts";
import { authedRequester } from "../../test/index.ts";

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
