import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import argon2 from "argon2";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { prisma, type User } from "../models/index.ts";
import { generateAuthTokens } from "../lib/tokens.ts";

describe("[POST] /auth/register", () => {
  // ARRANGE
  const USER = {
    firstname: "John",
    lastname: "Doe",
    email: "john@doe.io",
    password: "Password123!",
    confirm: "Password123!",
  };

  it("should register a new user in the database", async () => {
    // Act
    await fetch("http://localhost:7357/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(USER),
    });

    // Assert (état de la BDD)
    const dbUser = await prisma.user.findFirstOrThrow({
      where: { email: USER.email },
    });

    console.log("dbUser", dbUser);

    assert.ok(dbUser.id);
    assert.strictEqual(dbUser.firstname, USER.firstname);
    assert.strictEqual(dbUser.lastname, USER.lastname);
    assert.strictEqual(dbUser.email, USER.email);
    assert.match(dbUser.password, /\$argon2id/); // on s'assure que le mot de passe est bien haché
  });

  it("should return the created user with the right properties", async () => {
    // Act
    const httpResponse = await fetch(
      "http://localhost:7357/api/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(USER),
      },
    );
    const returnedUser = await httpResponse.json();

    // Assert (réponse HTTP)
    assert.strictEqual(httpResponse.status, 201);

    assert.ok(returnedUser.id);
    assert.strictEqual(returnedUser.firstname, USER.firstname);
    assert.strictEqual(returnedUser.lastname, USER.lastname);
    assert.strictEqual(returnedUser.email, USER.email);
    assert.ok(returnedUser.password === undefined);
  });
});

describe("[POST] /auth/login", () => {
  const EMAIL = "john@doe.io";
  const PASSWORD = "password";
  let user: User;

  // Avant chaque test, pour alléger la partie ARRANGE de chaque test, on exécute ce bloc
  beforeEach(async () => {
    user = await prisma.user.create({
      data: {
        firstname: "John",
        lastname: "Doe",
        email: EMAIL,
        password: await argon2.hash(PASSWORD),
      },
    });
  });

  it("should generate a JWT when the user authenticate correctly", async () => {
    // ARRANGE
    const credentials = { email: EMAIL, password: PASSWORD };

    // ACT
    const httpResponse = await fetch("http://localhost:7357/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const body = await httpResponse.json();

    // ASSERT
    assert.strictEqual(httpResponse.status, 200);
    assert.match(
      body.accessToken.token,
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
    ); // On s'assure d'avoir le token dans le body
    assert.match(
      httpResponse.headers.get("set-cookie")!,
      /accessToken=[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/,
    ); // On s'assure d'avoir le token dans le header set-cookie
  });

  it("should generate a refresh token when the user authenticate correctly", async () => {
    // ARRANGE
    const credentials = { email: EMAIL, password: PASSWORD };

    // ACT
    const httpResponse = await fetch("http://localhost:7357/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const body = await httpResponse.json();

    // ASSERT
    assert.strictEqual(httpResponse.status, 200);
    assert.ok(body.refreshToken.token); // On s'assure d'avoir le token dans le body
    assert.match(httpResponse.headers.get("set-cookie")!, /refreshToken=/); // On s'assure d'avoir le token dans le header set-cookie
  });

  it("should generate a JWT with useful information about the user", async () => {
    // ARRANGE
    const credentials = { email: EMAIL, password: PASSWORD };

    // ACT
    const httpResponse = await fetch("http://localhost:7357/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const body = await httpResponse.json();

    // ASSERT
    const token = body.accessToken.token;
    const payload = jwt.decode(token) as JwtPayload;
    assert.strictEqual(payload.userId, user.id);
    assert.strictEqual(payload.role, user.role);
  });
});

describe("[POST] /auth/logout", () => {
  it("should return a 204 status and new cookies to unset existing ones", async () => {
    // ARRANGE
    it.mock.method(Math, "random", () => "FAKE");

    // ACT
    const httpResponse = await fetch("http://localhost:7357/api/auth/logout", {
      method: "POST",
    });

    // ASSERT
    assert.strictEqual(httpResponse.status, 204);
    assert.match(httpResponse.headers.get("set-cookie")!, /accessToken=FAKE/);
    assert.match(httpResponse.headers.get("set-cookie")!, /refreshToken=FAKE/);
  });
});

describe("[POST] /auth/refresh", () => {
  it("should return a new access token an refresh token", async () => {
    // ARRANGE
    const user = await prisma.user.create({
      data: {
        firstname: "John",
        lastname: "Doe",
        email: "john@oclock.io",
        password: "password",
      },
    });
    const refreshToken = await prisma.refreshToken.create({
      data: {
        token: "12345",
        user_id: user.id,
        expires_at: new Date("2080/01/01"), // Celui là a priori il sera valable un p'tit moment
      },
    });

    // ACT
    const httpResponse = await fetch("http://localhost:7357/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refreshToken.token }),
    });

    // ASSERT
    assert.strictEqual(httpResponse.status, 200);
    assert.match(httpResponse.headers.get("set-cookie")!, /accessToken=/);
    assert.match(httpResponse.headers.get("set-cookie")!, /refreshToken=/);
  });

  it("should return 401 when the access token is not valid", async () => {
    // ARRANGE
    const user = await prisma.user.create({
      data: {
        firstname: "John",
        lastname: "Doe",
        email: "john@oclock.io",
        password: "password",
      },
    });
    const refreshToken = await prisma.refreshToken.create({
      data: {
        token: "12345",
        user_id: user.id,
        expires_at: new Date("1990/01/01"), // Celui là a priori il n'est plus valide
      },
    });

    // ACT
    const httpResponse = await fetch("http://localhost:7357/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refreshToken.token }),
    });

    // ASSERT
    assert.strictEqual(httpResponse.status, 401);
  });

  it("should return a new access token an refresh token when the refresh token is provided in cookies", async () => {
    // ARRANGE
    const user = await prisma.user.create({
      data: {
        firstname: "John",
        lastname: "Doe",
        email: "john@oclock.io",
        password: "password",
      },
    });
    const refreshToken = await prisma.refreshToken.create({
      data: {
        token: "12345",
        user_id: user.id,
        expires_at: new Date("2080/01/01"), // Celui là a priori il sera valable un bon moment
      },
    });

    // ACT
    const httpResponse = await fetch("http://localhost:7357/api/auth/refresh", {
      method: "POST",
      headers: { Cookie: `refreshToken=${refreshToken.token}` },
      credentials: "include",
    });

    // ASSERT
    assert.strictEqual(httpResponse.status, 200);
    assert.match(httpResponse.headers.get("set-cookie")!, /accessToken=/);
    assert.match(httpResponse.headers.get("set-cookie")!, /refreshToken=/);
  });
});

describe("[GET] /auth/me", () => {
  it("should return the authenticated user when the provided access token is valid", async () => {
    // == ARRANGE ==
    // Générer un utilisateur
    const user = await prisma.user.create({
      data: {
        firstname: "John",
        lastname: "Doe",
        email: "john@oclock.io",
        password: "password",
      },
    });
    // Générer un accessToken valide pour cet utilisateur
    const { accessToken } = generateAuthTokens(user);

    // == ACT ==
    // GET `/auth/me` avec headers "Authorization: Bearer XXXX"
    const httpResponse = await fetch(`http://localhost:7357/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken.token}` },
    });
    const loggedUser = await httpResponse.json();

    // == ASSERT ==
    // S'assurer des champs récupérés
    assert.strictEqual(httpResponse.status, 200);
    assert.strictEqual(loggedUser.id, user.id);
    assert.strictEqual(loggedUser.password, undefined);
  });

  it("should return a 401 when the access token is not provided", async () => {
    // == ACT ==
    const httpResponse = await fetch(`http://localhost:7357/api/auth/me`);

    // == ASSERT ==
    assert.strictEqual(httpResponse.status, 401);
  });
});
