import { execSync } from "node:child_process";
import type { Server } from "node:http";
import { after, before, beforeEach, type TestContext } from "node:test";
import { app } from "../../src/app.ts";
import { prisma } from "../../src/models/index.ts";

// ================================================================================
// Objectif de ce fichier : mettre en place l'environnement des tests d'intégration

// === AVANT le lancement des tests ===
// Création d'une BDD de test (oquiztest)
// Chargement des variables d'environnement (.env.test) à l'aide du flag --env-file
// Création des tables dans la BDD de test (run les migrations)
// Lacement du serveur Express

// === Entre chaque test ===
// On vide les tables

// === APRES les tests ===
// Deconnexion du client BDD Prisma
// Arrêt du serveur serveur Express de test
// Supression de la BDD de test
// ================================================================================

// Serveur HTTP (de test)
let server: Server;

// Hook before : s'exécute une fois avant l'ensemble des tests
before(() => {
  // (Hack) S'assurer que la BDD de test a bien été supprimé
  execSync(`docker rm -f oquiztest 2>/dev/null || true`);

  // Créer un conteneur BDD dédié aux tests
  execSync(`
    docker run \
    -d \
    --name oquiztest \
    -p ${process.env.POSTGRES_PORT}:5432 \
    -e POSTGRES_USER=${process.env.POSTGRES_USER} \
    -e POSTGRES_PASSWORD=${process.env.POSTGRES_PASSWORD} \
    -e POSTGRES_DB=${process.env.POSTGRES_DB} \
    postgres:17 
  `);

  // Attendre que PostgreSQL soit prêt à accepter des connexions
  execSync(`
    until docker exec oquiztest pg_isready -U ${process.env.POSTGRES_USER} > /dev/null 2>&1; do
      sleep 0.5
    done
  `);

  // Lancer les migrations sur la BDD de test
  // Note : les variables d'environnement (chargés via --env-file flag) sont passé au child process (execSync) par héritage
  execSync(`npx prisma migrate deploy`);

  // On lance un serveur de test
  server = app.listen(process.env.PORT);
});

// Hook beforeEach : s'exécute une fois avant chaque test
beforeEach(async t => {
  (t as TestContext).mock.method(console, "info", () => {});

  await truncateTables();
});

// Hook after : s'exécute une fois après l'ensemble des tests
after(async () => {
  // On éteint le serveur HTTP
  server.close();

  // On deconnecte la connexion à la BDD
  await prisma.$disconnect();

  // On éteint la base de données de test
  execSync(`docker rm -f oquiztest`);
});

async function truncateTables() {
  // https://stackoverflow.com/questions/3327312/how-can-i-drop-all-the-tables-in-a-postgresql-database
  await prisma.$executeRawUnsafe(`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE "' || r.tablename || '" RESTART IDENTITY CASCADE';
      END LOOP;
    END $$;
  `);
}
