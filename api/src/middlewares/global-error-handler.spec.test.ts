import assert from "node:assert";
import { describe, it } from "node:test";
import { prisma } from "../models/index.ts";
import { requester } from "../../test/index.ts";


describe("globalErrorHandler", () => {
  const safePrismaLevelCreate = prisma.level.create;

  it("should return a 500 when database is failing", async () => {
    // ARRANGE
    prisma.level.create = () => { throw new Error("Database error"); }; // Ecrase le comportement par défaut de prisma.level.create en lui faisant lever une exception grâce à un mock
    it.mock.method(console, "error", () => {}); // On désactive le log d'erreur pour ne pas polluer la console 

    // ACT
    const httpResponse = await requester.post("/levels", { name: "Un level valide" });

    // ASSERT
    assert.strictEqual(httpResponse.status, 500);
    assert.deepStrictEqual(httpResponse.data, { status: 500, error: "Internal server error" });

    // CLEAN UP (j'ai pas trouvé mieux pour desactiver le mocking, car la méthode it.mock() ne marche pas avec Prisma qui est bourré de proxy)
    prisma.level.create = safePrismaLevelCreate;
  });
});
