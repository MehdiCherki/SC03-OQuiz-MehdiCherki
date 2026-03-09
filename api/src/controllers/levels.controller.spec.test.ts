import { describe, it } from "node:test";
import { prisma } from "../models/index.ts";
import assert from "node:assert";
import { requester } from "../../test/index.ts";

describe("[GET] /api/levels", () => {
  it("should return all levels from the database", async () => {
    // Arrange
    const levels = await prisma.level.createManyAndReturn({ data: [
      { name: "Level 1" },
      { name: "Level 2" }
    ]});

    // Act
    const { data: body } = await requester.get("/levels");
    
    // Assert
    assert.strictEqual(body.length, levels.length);
    assert.strictEqual(body[0].name, "Level 1");
    assert.strictEqual(body[1].name, "Level 2");
  });
});

describe("[GET] /api/levels/:id", () => {
  it("should return the level from the database", async () => {
    const LEVEL = { name: "Mon niveau" };
    const databaseLevel = await prisma.level.create({ data: LEVEL });

    const { data: level } = await requester.get(`/levels/${databaseLevel.id}`);

    assert.partialDeepStrictEqual(level, LEVEL);
  });

  it("should return a 404 when the requested level does not exist", async () => {
    const UNEXISTING_LEVEL_ID = 42;

    const { status } = await requester.get(`/levels/${UNEXISTING_LEVEL_ID}`);

    assert.equal(status, 404);
  });
});

describe("[POST] /api/levels", () => {
  it("should create a level in the databse", async () => {
    // Arrange
    const body = { name: "mon nouveau level" };

    // Act
    await requester.post("/levels", body);

    // Assert
    const createdLevel = await prisma.level.findFirst({ where: { name: "mon nouveau level" } });
    assert.ok(createdLevel);
  });

  it("should return the created level with the right properties", async () => {
    // Arrange
    const body = { name: "mon nouveau level" };

    // Act
    const { data: createdLevel } = await requester.post("/levels", body);

    // Assert
    assert.ok(createdLevel.id);
    assert.ok(createdLevel.created_at);
    assert.ok(createdLevel.updated_at);
    assert.strictEqual(createdLevel.name, "mon nouveau level");
  });

  it("should return a 409 if the level to create is already taken", async () => {
    // Arrange
    // - créer un level en BDD
    const NAME = "DEJA PRIS";
    await prisma.level.create({ data: { name: NAME } });

    // Act
    // - tenter de creer le même
    const httpResponse = await requester.post("/levels", { name: NAME });

    // Assert
    // - 409
    assert.strictEqual(httpResponse.status, 409);
    // - body explicatif
    assert.match(httpResponse.data.error, /Tag name already taken/);
  });
});

describe("[PATCH] /api/levels/:id", () => {
  it("should update the level name in the database", async () => {
    // Arrange
    const levelToUpdate = await prisma.level.create({ data:  { name: "A mettre à jour"} });
    const NEW_NAME = "Nouveau nom du niveau";

    // Act
    const httpResponse = await requester.patch(`/levels/${levelToUpdate.id}`, { name: NEW_NAME });

    // Assert
    assert.strictEqual(httpResponse.status, 200);
    assert.strictEqual(httpResponse.data.name, NEW_NAME);
    assert.notEqual(httpResponse.data.created_at, levelToUpdate.updated_at);
  });
});

describe("[DELETE] /api/levels/:id", () => {
  it("should delete the levels from the database", async () => {
    const level = await prisma.level.create({ data: { name: "Niveau à supprimer" } });

    const { status } = await requester.delete(`/levels/${level.id}`);

    assert.equal(status, 204);
    const remainingNumberOfLevels = await prisma.level.count();
    assert.equal(remainingNumberOfLevels, 0);
  });

  it("should return a 404 when the level to delete does not exist", async () => {
    const UNEXISTING_LEVEL_ID = 42;

    const { status } = await requester.delete(`/levels/${UNEXISTING_LEVEL_ID}`);

    assert.equal(status, 404);
  });
});