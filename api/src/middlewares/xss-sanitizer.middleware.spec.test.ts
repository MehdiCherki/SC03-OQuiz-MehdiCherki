import assert from "node:assert";
import { describe, it } from "node:test";
import { authedRequester } from "../../test/index.ts";
import { prisma } from "../models/index.ts";
import argon2 from "argon2";
import { buildAuthedRequester } from "../../test/index.ts";

describe("xssSanitizer", () => {
  it("should strip <script> tags from a string field", async () => {
    // Le sanitizer supprime entièrement les balises <script> et leur contenu.
    // Le texte encadrant assure que la valeur résultante n'est pas vide (min(1) Zod).
    const { data: level } = await authedRequester.post("/levels", {
      name: "Level <script>alert('xss')</script> Name",
    });

    assert.ok(level.name, "Le level doit être créé");
    assert.ok(
      !level.name.includes("<script>"),
      "La balise <script> ne doit pas être conservée",
    );
    assert.ok(
      !level.name.includes("alert("),
      "Le contenu du script ne doit pas être conservé",
    );
  });

  it("should strip onerror event handler from attributes", async () => {
    // Le sanitizer retire les handlers d'événements (onerror, onclick…) des attributs HTML.
    const { data: level } = await authedRequester.post("/levels", {
      name: 'Level <img src="x" onerror="alert(1)"> Name',
    });

    assert.ok(level.name, "Le level doit être créé");
    assert.ok(
      !level.name.includes("onerror"),
      "L'attribut onerror ne doit pas être conservé",
    );
    assert.ok(
      !level.name.includes("alert("),
      "Le handler onerror ne doit pas être conservé",
    );
  });

  it("should strip javascript: protocol from href attributes", async () => {
    // Arrange
    const author = await prisma.user.create({
      data: {
        firstname: "Alice",
        lastname: "XSS",
        email: "alice-xss@oclock.io",
        password: await argon2.hash("password"),
        role: "author",
      },
    });
    const authorRequester = buildAuthedRequester(author);

    // Act — injection via href javascript: dans la description d'un quiz
    const { data: quiz } = await authorRequester.post("/quizzes", {
      title: "Quiz XSS",
      description: `Cliquez <a href="javascript:stealCookies()">ici</a> pour continuer`,
    });

    // Assert
    assert.ok(quiz.description, "Le quiz doit être créé");
    assert.ok(
      !quiz.description.includes("javascript:"),
      "Le protocole javascript: ne doit pas être conservé",
    );
  });

  it("should not alter plain text without HTML", async () => {
    // Une valeur normale ne doit pas être modifiée
    const { data: level } = await authedRequester.post("/levels", {
      name: "JavaScript avancé",
    });

    assert.strictEqual(level.name, "JavaScript avancé");
  });

  it("should sanitize all string fields in the same request body", async () => {
    // Arrange
    const author = await prisma.user.create({
      data: {
        firstname: "Bob",
        lastname: "XSS",
        email: "bob-xss@oclock.io",
        password: await argon2.hash("password"),
        role: "author",
      },
    });
    const authorRequester = buildAuthedRequester(author);

    // Act — les deux champs contiennent des vecteurs XSS
    const { data: quiz } = await authorRequester.post("/quizzes", {
      title: "Quiz <script>evil()</script> Test",
      description: 'Desc <img src="x" onclick="steal()"> text',
    });

    // Assert — les deux champs doivent être nettoyés
    assert.ok(
      !quiz.title.includes("<script>"),
      "title : balise script supprimée",
    );
    assert.ok(
      !quiz.description.includes("onclick"),
      "description : handler onclick supprimé",
    );
  });
});
