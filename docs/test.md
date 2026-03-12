# Documentation des tests — OQuiz API

## Vue d'ensemble

Les tests sont des **tests d'intégration** : ils testent les routes HTTP de l'API de bout en bout, en passant par le serveur Express et une vraie base de données PostgreSQL (pas de mock).

## Deux types de tests

| Type | Convention de nommage | Commande |
|------|----------------------|----------|
| Tests unitaires | `*.unit.test.ts` | `npm run test:unit` |
| Tests d'intégration (spec) | `*.spec.test.ts` | `npm run test:spec` |
| Les deux | — | `npm run test` |

Les tests unitaires n'existent pas encore dans le projet. Tous les fichiers de tests actuels sont des tests d'intégration (`.spec.test.ts`).

---

## Infrastructure de test

### Variables d'environnement — `test/config/.env.test`

Un fichier `.env.test` dédié isole complètement l'environnement de test de l'environnement de développement :

```
POSTGRES_USER=oquiztest
POSTGRES_PASSWORD=oquiztest
POSTGRES_DB=oquiztest
POSTGRES_PORT=5437        ← port différent du dev (5432)

PORT=7357                 ← port différent du dev
DATABASE_URL=postgres://oquiztest:oquiztest@localhost:5437/oquiztest
JWT_SECRET=mon-super-secret-jwt
RATE_LIMIT_MAX=3          ← limite basse pour ne pas épuiser le quota dans les tests
```

Ce fichier est chargé via le flag `--env-file=./test/config/.env.test` dans la commande `npm run test:spec`.

---

## Cycle de vie des tests — `test/config/global-setup.ts`

Ce fichier orchestre tout l'environnement de test. Il est injecté via `--import ./test/config/global-setup.ts`.

### 1. `before()` — exécuté **une seule fois** avant tous les tests

```
1. Supprime le conteneur Docker "oquiztest" s'il existe déjà (nettoyage préventif)
2. Lance un conteneur PostgreSQL 17 dédié aux tests :
   - Nom : oquiztest
   - Port : 5437 (mappé sur le 5432 interne)
   - Credentials : oquiztest / oquiztest
3. Attend que PostgreSQL soit prêt à accepter des connexions (polling via pg_isready)
4. Lance les migrations Prisma sur cette BDD de test (prisma migrate deploy)
5. Démarre le serveur Express sur le port 7357
```

### 2. `beforeEach()` — exécuté **avant chaque test**

```
1. Silence les console.info (pour ne pas polluer la sortie de test)
2. Vide toutes les tables avec TRUNCATE ... RESTART IDENTITY CASCADE
3. Réinitialise les rate limiters (pour repartir à zéro sur les compteurs)
```

> Le `TRUNCATE` remet aussi les séquences d'auto-increment à zéro (RESTART IDENTITY), ce qui garantit des IDs prévisibles et reproductibles entre les tests.

### 3. `after()` — exécuté **une seule fois** après tous les tests

```
1. Ferme le serveur Express
2. Déconnecte le client Prisma de la BDD
3. Supprime le conteneur Docker "oquiztest"
```

---

## Utilitaires de test — `test/index.ts`

### `generateFakeUser(overrides?)`

Génère un objet utilisateur factice sans l'insérer en base de données :

```ts
generateFakeUser()
// { id: 1, firstname: "firstname", email: "user1@oclock.io", role: "admin", ... }

generateFakeUser({ role: "user" })
// { id: 2, ..., role: "user" }
```

Chaque appel incrémente un compteur interne pour garantir des emails uniques.

### `authedRequester`

Instance axios préconfigurée pour faire des requêtes **authentifiées en tant qu'admin** :

```ts
// Utilisation dans un test
const { data } = await authedRequester.get("/levels");
const { status } = await authedRequester.post("/levels", { name: "Débutant" });
```

**Point clé — authentification stateless** : l'admin fictif n'est **pas** inséré en base de données. Le JWT est généré directement côté test avec `generateAuthTokens()`, ce qui suffit car le middleware d'auth de l'API vérifie uniquement la signature du token, pas l'existence de l'utilisateur en BDD.

```
generateFakeUser()  →  generateAuthTokens(user)  →  JWT valide
                                                        ↓
                                         Header: Authorization: Bearer <token>
```

### `buildAuthedRequester(user)`

Permet de construire un requester pour **n'importe quel utilisateur** (stateless ou stateful selon le besoin du test) :

```ts
// Stateless : l'user n'est pas en BDD, mais le JWT est valide
const requester = buildAuthedRequester(generateFakeUser({ role: "user" }));

// Stateful : l'user est créé en BDD ET le JWT le représente
const dbUser = await prisma.user.create({ data: { ... } });
const requester = buildAuthedRequester(dbUser);
```

---

## Structure d'un test — pattern AAA

Tous les tests suivent le pattern **Arrange / Act / Assert** :

```ts
it("should create a level in the database", async () => {
  // Arrange — préparer les données
  const body = { name: "Débutant" };

  // Act — appeler l'API
  await authedRequester.post("/levels", body);

  // Assert — vérifier l'état final
  const created = await prisma.level.findFirst({ where: { name: "Débutant" } });
  assert.ok(created);
});
```

---

## Lancer les tests

```bash
cd api

# Tous les tests
npm test

# Tests d'intégration uniquement
npm run test:spec

# Tests unitaires uniquement (quand il y en aura)
npm run test:unit
```

> **Prérequis** : Docker doit être en cours d'exécution. Le setup crée et détruit automatiquement le conteneur `oquiztest`.
