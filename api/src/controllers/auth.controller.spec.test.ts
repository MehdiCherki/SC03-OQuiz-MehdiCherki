import assert from "node:assert";
import { beforeEach, describe, it } from "node:test";
import argon2 from "argon2";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { prisma, type User } from "../models/index.ts";
import { generateAuthTokens } from "../lib/tokens.ts";
import { config } from "../../config.ts";

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
    const user = await prisma.user.create({
      data: { firstname: "John", lastname: "Doe", email: "john@oclock.io", password: "password" },
    });
    const { accessToken } = generateAuthTokens(user);

    // ACT
    const httpResponse = await fetch("http://localhost:7357/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken.token}` },
    });

    // ASSERT
    assert.strictEqual(httpResponse.status, 204);
    // Les cookies doivent être effacés : valeur vide + date d'expiration dans le passé
    assert.match(httpResponse.headers.get("set-cookie")!, /accessToken=;/);
    assert.match(httpResponse.headers.get("set-cookie")!, /refreshToken=;/);
    assert.match(httpResponse.headers.get("set-cookie")!, /Expires=Thu, 01 Jan 1970/);
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
        password: await argon2.hash("password"),
      },
    });
    const { refreshToken } = generateAuthTokens(user);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken.token,
        user_id: user.id,
        expires_at: new Date(Date.now() + refreshToken.expiresIn),
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
        password: await argon2.hash("password"),
      },
    });
    // JWT signé avec la bonne audience mais déjà expiré
    const expiredToken = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: 0, audience: "refresh" });
    await prisma.refreshToken.create({
      data: {
        token: expiredToken,
        user_id: user.id,
        expires_at: new Date("1990/01/01"),
      },
    });

    // ACT
    const httpResponse = await fetch("http://localhost:7357/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: expiredToken }),
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
        password: await argon2.hash("password"),
      },
    });
    const { refreshToken } = generateAuthTokens(user);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken.token,
        user_id: user.id,
        expires_at: new Date(Date.now() + refreshToken.expiresIn),
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
        password: await argon2.hash("password"),
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
