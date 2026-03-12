import { describe, it } from "node:test";
import { prisma } from "../models/index.ts";
import assert from "node:assert";
import argon2 from "argon2";
import { authedRequester, buildAuthedRequester } from "../../test/index.ts";

describe("[GET] /api/tags", () => {
  it("should return all tags from the database", async () => {
    // Arrange
    const tags = await prisma.tag.createManyAndReturn({
      data: [{ name: "JavaScript" }, { name: "TypeScript" }],
    });

    // Act
    const { data: body } = await authedRequester.get("/tags");

    // Assert
    assert.strictEqual(body.length, tags.length);
    assert.strictEqual(body[0].name, "JavaScript");
    assert.strictEqual(body[1].name, "TypeScript");
  });

  it("should return tags with their children", async () => {
    // Arrange
    const parent = await prisma.tag.create({ data: { name: "Web" } });
    await prisma.tag.create({
      data: { name: "Frontend", parent_tag_id: parent.id },
    });

    // Act
    const { data: tags } = await authedRequester.get("/tags");
    const webTag = tags.find((t: { name: string }) => t.name === "Web");

    // Assert
    assert.ok(webTag);
    assert.strictEqual(webTag.children_tags.length, 1);
    assert.strictEqual(webTag.children_tags[0].name, "Frontend");
  });
});

describe("[GET] /api/tags/:id", () => {
  it("should return the tag from the database", async () => {
    // Arrange
    const TAG = { name: "Node.js" };
    const databaseTag = await prisma.tag.create({ data: TAG });

    // Act
    const { data: tag } = await authedRequester.get(`/tags/${databaseTag.id}`);

    // Assert
    assert.partialDeepStrictEqual(tag, TAG);
  });

  it("should return a 404 when the requested tag does not exist", async () => {
    // Arrange
    const UNEXISTING_TAG_ID = 42;

    // Act
    const { status } = await authedRequester.get(`/tags/${UNEXISTING_TAG_ID}`);

    // Assert
    assert.equal(status, 404);
  });

  it("should return the tag with its children", async () => {
    // Arrange
    const parent = await prisma.tag.create({ data: { name: "Backend" } });
    await prisma.tag.create({
      data: { name: "Express", parent_tag_id: parent.id },
    });

    // Act
    const { data: tag } = await authedRequester.get(`/tags/${parent.id}`);

    // Assert
    assert.strictEqual(tag.children_tags.length, 1);
    assert.strictEqual(tag.children_tags[0].name, "Express");
  });
});

describe("[POST] /api/tags", () => {
  it("should create a tag in the database", async () => {
    // Arrange
    const body = { name: "React" };

    // Act
    await authedRequester.post("/tags", body);

    // Assert
    const createdTag = await prisma.tag.findFirst({ where: { name: "React" } });
    assert.ok(createdTag);
  });

  it("should return the created tag with the right properties", async () => {
    // Arrange
    const body = { name: "Vue.js" };

    // Act
    const { data: createdTag, status } = await authedRequester.post(
      "/tags",
      body,
    );

    // Assert
    assert.strictEqual(status, 201);
    assert.ok(createdTag.id);
    assert.ok(createdTag.created_at);
    assert.ok(createdTag.updated_at);
    assert.strictEqual(createdTag.name, "Vue.js");
    assert.strictEqual(createdTag.parent_tag_id, null);
    assert.deepStrictEqual(createdTag.children_tags, []);
  });

  it("should create a tag with a parent tag", async () => {
    // Arrange
    const parent = await prisma.tag.create({ data: { name: "Framework" } });
    const body = { name: "Angular", parent_tag_id: parent.id };

    // Act
    const { data: createdTag, status } = await authedRequester.post(
      "/tags",
      body,
    );

    // Assert
    assert.strictEqual(status, 201);
    assert.strictEqual(createdTag.parent_tag_id, parent.id);
  });

  it("should return a 409 if the tag name is already taken", async () => {
    // Arrange
    const NAME = "DEJA PRIS";
    await prisma.tag.create({ data: { name: NAME } });

    // Act
    const httpResponse = await authedRequester.post("/tags", { name: NAME });

    // Assert
    assert.strictEqual(httpResponse.status, 409);
    assert.match(httpResponse.data.error, /Tag name already taken/);
  });

  it("should return a 404 if the parent tag does not exist", async () => {
    // Arrange
    const body = { name: "Orphelin", parent_tag_id: 9999 };

    // Act
    const { status } = await authedRequester.post("/tags", body);

    // Assert
    assert.strictEqual(status, 404);
  });

  it("should allow an author to create a tag", async () => {
    // Arrange
    const author = await prisma.user.create({
      data: {
        firstname: "Alice",
        lastname: "Author",
        email: "alice-tag-author@oclock.io",
        password: await argon2.hash("password"),
        role: "author",
      },
    });
    const authorRequester = buildAuthedRequester(author);

    // Act
    const { status } = await authorRequester.post("/tags", {
      name: "Tag d'auteur",
    });

    // Assert
    assert.strictEqual(status, 201);
  });

  it("should return 403 when a member tries to create a tag", async () => {
    // Arrange
    const member = await prisma.user.create({
      data: {
        firstname: "Bob",
        lastname: "Member",
        email: "bob-tag-member@oclock.io",
        password: await argon2.hash("password"),
        role: "member",
      },
    });
    const memberRequester = buildAuthedRequester(member);

    // Act
    const { status } = await memberRequester.post("/tags", {
      name: "Tag interdit",
    });

    // Assert
    assert.strictEqual(status, 403);
  });
});

describe("[PATCH] /api/tags/:id", () => {
  it("should update the tag name in the database", async () => {
    // Arrange
    const tagToUpdate = await prisma.tag.create({
      data: { name: "A mettre à jour" },
    });
    const NEW_NAME = "Nouveau nom du tag";

    // Act
    const httpResponse = await authedRequester.patch(
      `/tags/${tagToUpdate.id}`,
      { name: NEW_NAME },
    );

    // Assert
    assert.strictEqual(httpResponse.status, 200);
    assert.strictEqual(httpResponse.data.name, NEW_NAME);
  });

  it("should update the parent tag", async () => {
    // Arrange
    const parent = await prisma.tag.create({ data: { name: "Parent" } });
    const tag = await prisma.tag.create({ data: { name: "Enfant" } });

    // Act
    const httpResponse = await authedRequester.patch(`/tags/${tag.id}`, {
      parent_tag_id: parent.id,
    });

    // Assert
    assert.strictEqual(httpResponse.status, 200);
    assert.strictEqual(httpResponse.data.parent_tag_id, parent.id);
  });

  it("should return a 404 when the tag to update does not exist", async () => {
    // Arrange
    const UNEXISTING_TAG_ID = 42;

    // Act
    const { status } = await authedRequester.patch(
      `/tags/${UNEXISTING_TAG_ID}`,
      { name: "Nouveau" },
    );

    // Assert
    assert.strictEqual(status, 404);
  });

  it("should return a 409 if the new name is already taken by another tag", async () => {
    // Arrange
    await prisma.tag.create({ data: { name: "Nom existant" } });
    const tagToUpdate = await prisma.tag.create({
      data: { name: "A renommer" },
    });

    // Act
    const httpResponse = await authedRequester.patch(
      `/tags/${tagToUpdate.id}`,
      {
        name: "Nom existant",
      },
    );

    // Assert
    assert.strictEqual(httpResponse.status, 409);
  });
});

describe("[DELETE] /api/tags/:id", () => {
  it("should delete the tag from the database", async () => {
    // Arrange
    const tag = await prisma.tag.create({ data: { name: "Tag à supprimer" } });

    // Act
    const { status } = await authedRequester.delete(`/tags/${tag.id}`);

    // Assert
    assert.equal(status, 204);
    const remainingTags = await prisma.tag.count();
    assert.equal(remainingTags, 0);
  });

  it("should return a 404 when the tag to delete does not exist", async () => {
    // Arrange
    const UNEXISTING_TAG_ID = 42;

    // Act
    const { status } = await authedRequester.delete(
      `/tags/${UNEXISTING_TAG_ID}`,
    );

    // Assert
    assert.equal(status, 404);
  });

  it("should set children tags parent to null when parent tag is deleted", async () => {
    // Arrange
    const parent = await prisma.tag.create({
      data: { name: "Parent à supprimer" },
    });
    const child = await prisma.tag.create({
      data: { name: "Enfant", parent_tag_id: parent.id },
    });

    // Act
    await authedRequester.delete(`/tags/${parent.id}`);

    // Assert
    const updatedChild = await prisma.tag.findUnique({
      where: { id: child.id },
    });
    assert.strictEqual(updatedChild?.parent_tag_id, null);
  });
});
