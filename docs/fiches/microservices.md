# Architecture Microservices

## 1. Le point de départ : l'architecture monolithique

Avant de parler de microservices, il faut comprendre ce qu'ils remplacent — ou complètent.

Dans une **architecture monolithe**, toute l'application est un seul processus déployable :

```
┌─────────────────────────────────────────────────────┐
│                   MONOLITHE                         │
│                                                     │
│  ┌───────────┐  ┌────────────┐  ┌────────────────┐  │
│  │   Auth    │  │   Quiz     │  │  Statistiques  │  │
│  │  module   │  │   module   │  │    module      │  │
│  └───────────┘  └────────────┘  └────────────────┘  │
│                                                     │
│              ┌──────────────────┐                   │
│              │   PostgreSQL DB  │                   │
│              └──────────────────┘                   │
└─────────────────────────────────────────────────────┘
                        │
               un seul déploiement
```

**Avantages du monolithe :**

- Simple à développer au départ
- Un seul dépôt, une seule stack, un seul déploiement
- Pas de latence réseau entre les modules
- Transactions ACID natives

**Limites quand le projet grossit :**

- Un bug dans un module peut faire tomber toute l'appli
- Déployer une petite correction oblige à redéployer l'ensemble
- Impossible de scaler indépendamment un seul module
- La base de code devient difficile à maintenir par plusieurs équipes
- Couplage fort : changer une partie impacte souvent le reste

---

## 2. Qu'est-ce qu'une architecture microservices ?

L'idée centrale : **découper l'application en services indépendants**, chacun responsable d'un domaine fonctionnel précis.

```
                         ┌─────────────────┐
                         │   API Gateway   │
                         │  (point d'entrée│
                         │    unique)      │
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
    ┌─────────▼──────┐  ┌─────────▼──────┐  ┌────────▼───────┐
    │  Service Auth  │  │  Service Quiz  │  │ Service Logs   │
    │                │  │                │  │                │
    │  Node/Express  │  │  Node/Express  │  │  Node/Express  │
    │  + PostgreSQL  │  │  + PostgreSQL  │  │  + MongoDB     │
    │  :3001         │  │  :3002         │  │  :3003         │
    └────────────────┘  └────────────────┘  └────────────────┘
```

Chaque service :

- a **sa propre base de données** (pas de base partagée)
- est **déployé indépendamment**
- **communique via réseau** (HTTP/REST, ou messaging)
- peut être **écrit dans un langage/stack différent**

---

## 3. Ce que ça résout concrètement

### 3.1 Déploiement indépendant

Tu corriges un bug dans le service Quiz ? Tu redéploies uniquement ce service. Les services Auth et Logs continuent de tourner sans interruption.

### 3.2 Scalabilité ciblée

Si le service Logs est surchargé pendant une période d'examens, tu lances 3 instances de ce seul service sans toucher aux autres.

```
Service Logs   →  instance 1
               →  instance 2   (load balancer)
               →  instance 3
```

### 3.3 Isolation des pannes

Un crash du service Logs n'empêche pas les utilisateurs de s'authentifier ou de passer un quiz. Le reste du système reste opérationnel (avec une dégradation gracieuse).

### 3.4 Liberté technologique

Le service Logs manipule des données agrégées non-relationnelles → MongoDB.  
Le service Auth a besoin de transactions strictes → PostgreSQL.  
Chaque choix est local, sans contraindre les autres équipes.

### 3.5 Organisation par équipes

Une équipe "Auth", une équipe "Quiz", une équipe "Logs " — chacune propriétaire de son service. Moins de conflits de merge, plus d'autonomie.

---

## 4. Communication entre services

### 4.1 Communication synchrone : HTTP/REST

Un service appelle directement un autre via HTTP.

```typescript
// Dans le service Quiz — vérification du token JWT via le service Auth
async function verifyTokenWithAuthService(token: string): Promise<User | null> {
  try {
    const response = await fetch("http://auth-service:3001/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { user: User };
    return data.user;
  } catch (err) {
    // Le service Auth est indisponible → dégradation gracieuse
    console.error("Auth service unreachable", err);
    return null;
  }
}
```

> ⚠️ **Problème :** si le service Auth est down, le service Quiz ne peut plus vérifier les tokens. Couplage temporel.

### 4.2 Communication asynchrone : Message Broker

Les services communiquent via une file de messages (RabbitMQ, Kafka, Redis Pub/Sub). Le producteur n'attend pas la réponse.

```
Service Quiz                    Message Broker              Service Logs
     │                               │                           │
     │── event: "quiz.completed" ──▶│                           │
     │   { userId, score, quizId }   │── push event ──────────▶ │
     │                               │                           │── enregistre Logs
     │ (n'attend pas de réponse)     │                           │── met à jour leaderboard
```

```typescript
// Service Quiz — publication d'un événement (avec Redis simple)
import { createClient } from "redis";

const publisher = createClient({ url: "redis://redis:6379" });
await publisher.connect();

async function publishQuizCompleted(
  userId: number,
  quizId: number,
  score: number,
) {
  const event = {
    type: "quiz.completed",
    payload: { userId, quizId, score },
    timestamp: new Date().toISOString(),
  };
  await publisher.publish("quiz-events", JSON.stringify(event));
}
```

```typescript
// Service Logs  — consommation de l'événement
const subscriber = createClient({ url: "redis://redis:6379" });
await subscriber.connect();

await subscriber.subscribe("quiz-events", async message => {
  const event = JSON.parse(message) as QuizEvent;

  if (event.type === "quiz.completed") {
    await db
      .collection("logs ")
      .updateOne(
        { userId: event.payload.userId },
        { $push: { results: event.payload }, $inc: { totalQuizzes: 1 } },
        { upsert: true },
      );
  }
});
```

---

## 5. Le pattern API Gateway

Avec plusieurs services, le client ne peut pas appeler 10 URLs différentes. L'**API Gateway** est le point d'entrée unique.

nginx est un choix naturel pour ce rôle : léger, performant, et probablement déjà présent dans ton infra. Il fait le routage par préfixe d'URL via des blocs `location`.

```nginx
# nginx/nginx.conf

events {}

http {

  # --- Upstream : on déclare chaque service ---
  upstream auth_service {
    server auth-service:3001;
  }

  upstream quiz_service {
    server quiz-service:3002;
  }

  upstream logs_service {
    server logs-service:3003;
  }

  server {
    listen 80;

    # Transmet l'IP réelle du client aux services
    proxy_set_header X-Real-IP        $remote_addr;
    proxy_set_header X-Forwarded-For  $proxy_add_x_forwarded_for;
    proxy_set_header Host             $host;

    # /auth/* → service Auth
    location /auth/ {
      proxy_pass http://auth_service/;
    }

    # /quizzes/* → service Quiz
    location /quizzes/ {
      proxy_pass http://quiz_service/;
    }

    # /Logs /* → service Logs
    location /Logs / {
      proxy_pass http://logs_service/;
    }
  }
}
```

Et dans le `docker-compose.yml` :

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - auth-service
      - quiz-service
      - logs-service

  auth-service:
    build: ./auth
    expose:
      - "3001" # pas de port publié, seul nginx y accède

  quiz-service:
    build: ./quiz
    expose:
      - "3002"

  logs-service:
    build: ./logs
    expose:
      - "3003"
```

> 💡 **`expose` vs `ports`** : `expose` rend le port accessible uniquement au sein du réseau Docker interne. `ports` l'ouvre vers l'hôte. Ici seul nginx est exposé vers l'extérieur — les services ne sont pas joignables directement depuis le navigateur.

nginx peut aussi centraliser : terminaison TLS, rate limiting (`limit_req`), CORS, headers de sécurité, logs d'accès unifiés.

---

## 6. La contrepartie : la complexité opérationnelle

> Les microservices déplacent la complexité du code vers l'infrastructure.

### 6.1 Réseau partout

Ce qui était un appel de fonction en mémoire devient un appel HTTP avec latence, timeout, et risque de panne.

```
// Monolithe — appel direct, jamais de timeout réseau
const user = authService.verify(token); // synchrone, fiable

// Microservices — appel réseau, peut échouer
const user = await fetch('http://auth-service/verify', ...) // timeout ? panne ?
```

Il faut implémenter : **retries**, **circuit breaker**, **timeouts**, **fallbacks**.

### 6.2 Cohérence des données

Plus de transactions ACID entre services. Si le service Quiz enregistre un résultat et que l'envoi à Logs échoue, les données sont incohérentes.

Solutions possibles : **Saga pattern**, **eventual consistency**, **outbox pattern**.

### 6.3 Observabilité complexe

Un bug traverse 3 services. Quel log regarder ? Il faut un **tracing distribué** avec un identifiant de corrélation qui traverse tous les services.

```typescript
// Middleware à ajouter dans chaque service
import { v4 as uuidv4 } from "uuid";

app.use((req, res, next) => {
  // Récupère l'ID de corrélation ou en génère un nouveau
  req.correlationId = (req.headers["x-correlation-id"] as string) ?? uuidv4();
  res.setHeader("x-correlation-id", req.correlationId);
  next();
});
```

### 6.4 Multiplication des dépôts et des configs

| Élément         | Monolithe | Microservices (ex: 5 services) |
| --------------- | --------- | ------------------------------ |
| Dépôts Git      | 1         | 5+                             |
| Dockerfiles     | 1         | 5+                             |
| Pipelines CI/CD | 1         | 5+                             |
| Variables d'env | ~10       | ~50                            |
| Ports à gérer   | 1         | 5+                             |

### 6.5 Tests d'intégration plus difficiles

Tester le parcours complet "un utilisateur passe un quiz" nécessite de lancer Auth + Quiz + Logs + Gateway + leurs bases de données. Les tests end-to-end sont plus lourds à orchestrer.

---

## 7. Quand ne PAS faire de microservices

Les microservices ne sont pas une fin en soi. Ils ont un coût réel.

**Ne pas choisir les microservices si :**

- L'équipe est petite (< 5 devs) — la charge opérationnelle est disproportionnée
- Le domaine n'est pas encore stabilisé — les boundaries vont changer, les refactorisations coûteront cher
- Pas d'infra pour orchestrer (Docker Swarm, Kubernetes, ECS...)
- Pas de culture DevOps / CI-CD dans l'équipe

> **Martin Fowler** (co-auteur du terme) recommande de commencer par un monolithe bien structuré, et d'extraire des services uniquement quand un besoin concret émerge (scaling, équipe indépendante, etc.). C'est le **"Monolith First"** pattern.

---

## 8. Microservices vs. autres architectures

| Critère                 | Monolithe | Modulaire (monolithe modulaire) | Microservices |
| ----------------------- | --------- | ------------------------------- | ------------- |
| Complexité initiale     | Faible    | Moyenne                         | Élevée        |
| Déploiement indépendant | ✗         | ✗                               | ✓             |
| Scalabilité ciblée      | ✗         | ✗                               | ✓             |
| Transactions ACID       | ✓         | ✓                               | Complexe      |
| Latence réseau          | Nulle     | Nulle                           | Présente      |
| Autonomie des équipes   | Faible    | Moyenne                         | Forte         |
| Adaptée petites équipes | ✓         | ✓                               | ✗             |

Le **monolithe modulaire** est souvent le meilleur compromis : même base de code, mais modules avec des interfaces claires et des dépendances explicites. Il peut être migré vers des microservices progressivement.

---

## 9. Checklist — Suis-je prêt pour les microservices ?

Avant de se lancer, il faut pouvoir répondre oui à ces questions :

- [ ] Mon domaine est-il suffisamment stable pour définir des boundaries ?
- [ ] Mon équipe maîtrise-t-elle Docker et l'orchestration ?
- [ ] Ai-je une stratégie de logging centralisé (ELK, Loki...) ?
- [ ] Ai-je un pipeline CI/CD fonctionnel pour chaque service ?
- [ ] Ai-je réfléchi à la gestion des secrets/configs (Vault, .env par service) ?
- [ ] Ai-je une stratégie de health checks et de circuit breakers ?
- [ ] Mon équipe a-t-elle discuté du pattern de communication (sync vs async) ?

---

## 10. Résumé

```
Problème résolu                     Contrepartie introduite
──────────────────────────────────────────────────────────────────
Scalabilité ciblée              →   Complexité d'orchestration
Déploiement indépendant         →   Multiplication des pipelines CI/CD
Isolation des pannes            →   Gestion réseau (retries, timeouts)
Autonomie des équipes           →   Cohérence des données entre services
Liberté technologique           →   Observabilité distribuée (logs, traces)
```

> **À retenir :** Les microservices sont une solution à des problèmes d'**échelle organisationnelle et technique**. Sans ces problèmes, ils ajoutent de la complexité sans valeur. Le bon architecte sait _quand ne pas_ les utiliser.
