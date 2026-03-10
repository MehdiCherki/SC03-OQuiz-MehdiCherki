import { describe, it } from "node:test";
import { prisma } from "../models/index.ts";
import { buildAuthedRequester } from "../../test/index.ts";
import assert from "node:assert";

describe("checkRoles", () => {
  it("should reject the request if the requester is not an admin", async () => {
    // ARRANGE
    const userThatIsNotAdmin = await prisma.user.create({
      data: {
        firstname: "John",
        lastname: "Doe",
        email: "john@oclock.io",
        password: "123456",
        role: "member",
      },
    }); // Créer un utilisateur qui n'a pas les droits sur la route
    const authedRequester = buildAuthedRequester(userThatIsNotAdmin);

    // ACT
    const httpResponse = await authedRequester.get("/users");

    // ASSERT
    assert.strictEqual(httpResponse.status, 403);
  });
});
