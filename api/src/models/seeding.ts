// Échantillonnage (seeding)

import { faker } from "@faker-js/faker/locale/fr";
import argon2 from "argon2";
import { prisma } from "./index.ts";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMany<T>(arr: T[], min: number, max: number): T[] {
  const count = faker.number.int({ min, max });
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const hashedPassword = await argon2.hash("password");

// ─── Users ────────────────────────────────────────────────────────────────────

await prisma.user.create({
  data: {
    firstname: "Admin",
    lastname: "Oclock",
    email: "admin@oclock.io",
    password: hashedPassword,
    role: "admin",
  },
});

const authors = await Promise.all(
  Array.from({ length: 3 }, () =>
    prisma.user.create({
      data: {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        email: faker.internet.email().toLowerCase(),
        password: hashedPassword,
        role: "author",
      },
    }),
  ),
);

const members = await Promise.all(
  Array.from({ length: 5 }, () =>
    prisma.user.create({
      data: {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        email: faker.internet.email().toLowerCase(),
        password: hashedPassword,
        role: "member",
      },
    }),
  ),
);

console.log(`👤 ${1 + authors.length + members.length} utilisateurs créés`);

// ─── Levels ───────────────────────────────────────────────────────────────────

const levels = await Promise.all(
  ["Débutant", "Facile", "Moyen", "Difficile", "Expert"].map((name) =>
    prisma.level.create({ data: { name } }),
  ),
);

console.log(`🧩 ${levels.length} niveaux créés`);

// ─── Tags ─────────────────────────────────────────────────────────────────────

const parentTags = await Promise.all(
  ["Programmation", "Web", "Base de données", "DevOps", "Mathématiques"].map(
    (name) => prisma.tag.create({ data: { name } }),
  ),
);

const childTags = await Promise.all([
  prisma.tag.create({
    data: { name: "JavaScript", parent_tag_id: parentTags[0].id },
  }),
  prisma.tag.create({
    data: { name: "TypeScript", parent_tag_id: parentTags[0].id },
  }),
  prisma.tag.create({
    data: { name: "Python", parent_tag_id: parentTags[0].id },
  }),
  prisma.tag.create({
    data: { name: "HTML/CSS", parent_tag_id: parentTags[1].id },
  }),
  prisma.tag.create({
    data: { name: "React", parent_tag_id: parentTags[1].id },
  }),
  prisma.tag.create({
    data: { name: "Node.js", parent_tag_id: parentTags[1].id },
  }),
  prisma.tag.create({
    data: { name: "PostgreSQL", parent_tag_id: parentTags[2].id },
  }),
  prisma.tag.create({ data: { name: "SQL", parent_tag_id: parentTags[2].id } }),
  prisma.tag.create({
    data: { name: "Docker", parent_tag_id: parentTags[3].id },
  }),
  prisma.tag.create({
    data: { name: "Algèbre", parent_tag_id: parentTags[4].id },
  }),
]);

const allTags = [...parentTags, ...childTags];
console.log(`🏷️  ${allTags.length} tags créés`);

// ─── Quizzes ──────────────────────────────────────────────────────────────────

const quizTitles = [
  "Les bases de JavaScript",
  "TypeScript avancé",
  "SQL pour débutants",
  "Docker en pratique",
  "React hooks",
  "Node.js et Express",
  "Algorithmes classiques",
  "HTML & CSS moderne",
  "PostgreSQL avancé",
  "Python pour l'analyse de données",
];

const quizzes = await Promise.all(
  quizTitles.map((title, i) =>
    prisma.quiz.create({
      data: {
        title,
        description: faker.lorem.sentence(),
        author_id: authors[i % authors.length].id,
      },
    }),
  ),
);

// Associer 1-3 tags par quiz
for (const quiz of quizzes) {
  const tags = pickMany(allTags, 1, 3);
  await prisma.quizHasTag.createMany({
    data: tags.map((tag) => ({ quiz_id: quiz.id, tag_id: tag.id })),
    skipDuplicates: true,
  });
}

console.log(`📚 ${quizzes.length} quizzes créés`);

// ─── Questions & Choices ──────────────────────────────────────────────────────

const questionsData: Array<{
  description: string;
  correct: string;
  wrong: string[];
}> = [
  {
    description: "Quel mot-clé déclare une constante en JS ?",
    correct: "const",
    wrong: ["let", "var", "def"],
  },
  {
    description: "Que renvoie typeof null ?",
    correct: "object",
    wrong: ["null", "undefined", "string"],
  },
  {
    description: "Quelle méthode ajoute un élément à la fin d'un tableau ?",
    correct: "push()",
    wrong: ["pop()", "shift()", "unshift()"],
  },
  {
    description: "Quel opérateur vérifie l'égalité stricte ?",
    correct: "===",
    wrong: ["==", "=", "!="],
  },
  {
    description: "Comment déclare-t-on une fonction fléchée ?",
    correct: "() => {}",
    wrong: ["function() {}", "def() {}", "func() {}"],
  },
  {
    description: "Quelle commande initialise un projet Node.js ?",
    correct: "npm init",
    wrong: ["node init", "npm start", "node create"],
  },
  {
    description: "Quelle clause filtre les lignes en SQL ?",
    correct: "WHERE",
    wrong: ["FILTER", "HAVING", "LIMIT"],
  },
  {
    description: "Quelle commande lance un conteneur Docker ?",
    correct: "docker run",
    wrong: ["docker start", "docker exec", "docker up"],
  },
  {
    description: "Quelle balise HTML crée un lien ?",
    correct: "<a>",
    wrong: ["<link>", "<href>", "<url>"],
  },
  {
    description: "Quel hook React gère l'état local ?",
    correct: "useState",
    wrong: ["useEffect", "useRef", "useContext"],
  },
  {
    description: "Quelle méthode JS retourne une promesse ?",
    correct: "fetch()",
    wrong: ["get()", "request()", "call()"],
  },
  {
    description: "Comment typer un paramètre en TypeScript ?",
    correct: "param: string",
    wrong: ["param as string", "string param", "<string>param"],
  },
  {
    description: "Quelle propriété CSS centre un flex item ?",
    correct: "align-items: center",
    wrong: ["text-align: center", "margin: auto", "justify-self: center"],
  },
  {
    description: "Quel opérateur SQL joint deux tables ?",
    correct: "JOIN",
    wrong: ["MERGE", "COMBINE", "LINK"],
  },
  {
    description: "Quelle méthode crée un tableau transformé en JS ?",
    correct: "map()",
    wrong: ["filter()", "reduce()", "forEach()"],
  },
];

let totalQuestions = 0;
let totalChoices = 0;

for (const quiz of quizzes) {
  const nbQuestions = faker.number.int({ min: 3, max: 5 });
  const pool = [...questionsData]
    .sort(() => Math.random() - 0.5)
    .slice(0, nbQuestions);

  for (const qData of pool) {
    const question = await prisma.question.create({
      data: {
        description: qData.description,
        level_id: pick(levels).id,
        quiz_id: quiz.id,
      },
    });
    totalQuestions++;

    // Mélanger correct + wrong et créer les choix
    const choices = [
      { description: qData.correct, is_valid: true },
      ...qData.wrong.map((w) => ({ description: w, is_valid: false })),
    ].sort(() => Math.random() - 0.5);

    await prisma.choice.createMany({
      data: choices.map((c) => ({ ...c, question_id: question.id })),
    });
    totalChoices += choices.length;
  }
}

console.log(`❓ ${totalQuestions} questions créées`);
console.log(`☑️  ${totalChoices} choix créés`);

// ─── Attempts ─────────────────────────────────────────────────────────────────

let totalAttempts = 0;

for (const member of members) {
  const playedQuizzes = pickMany(quizzes, 2, 5);
  for (const quiz of playedQuizzes) {
    const max_score = faker.number.int({ min: 3, max: 5 });
    const score = faker.number.int({ min: 0, max: max_score });
    await prisma.attempt.create({
      data: { score, max_score, user_id: member.id, quiz_id: quiz.id },
    });
    totalAttempts++;
  }
}

console.log(`🎮 ${totalAttempts} tentatives créées`);

// ─── Résumé ───────────────────────────────────────────────────────────────────

console.log(`
✅ Seeding terminé !

Comptes de test (mot de passe : "password") :
  🔑 admin@oclock.io        (admin)
  ✍️  ${authors[0].email}  (author)
  👤 ${members[0].email}  (member)
`);
