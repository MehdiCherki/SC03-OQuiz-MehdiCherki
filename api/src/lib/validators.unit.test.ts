import assert from "node:assert";
import { describe, it } from "node:test";
import { isValidPassword } from "./validators.ts";

// Groupement de tests pour la lisibilité
describe("isValidPassword", () => {
  // Exemple de test unitaire
  it("should return true when the password meets the requirements", () => {
    // Arrange : mise en place des données necessaire au test
    const password = "MonSuperP4ssw0rd!!";

    // Act : exécution de la fonction à tester
    const result = isValidPassword(password);

    // Assert : vérification du bon fonctionnement
    assert.ok(result); // Equivalent : assert.strictEqual(result, true);
  });

  // Test n°2
  it("should return false when the password is too short", () => {
    // Arrange : mise en place des données necessaire au test
    const password = "toto";

    // Act : exécution de la fonction à tester
    const result = isValidPassword(password);

    // Assert : vérification du bon fonctionnement
    assert.strictEqual(result, false);
  });

  // Test n°3
  it("should return false when the password does not contain a special character", () => {
    // Arrange
    const password = "MonLongMotDePasse123456789";

    // Act
    const result = isValidPassword(password);

    // Assert
    assert.strictEqual(result, false);
  });
});
