# `Session` (stateful) vs `JWT` (stateless)

## Vocabulaire

**S'authentifier** = 
- vérifier l'identité d'un utilisateur via un mécanisme de preuve (mot de passe, code, clé SSH).
- _qui es-tu ?_

**Se connecter** = 
- établir une session persistante après authentification, afin d'accéder aux ressources protégées.
- _tu es reconnu, voici ton accès temporaire._

**Stateful** = 
- les données de connexion sont stockées côté serveur, dans un store en mémoire (RAM, Redis) ou en BDD.
- après authentification, le client reçoit un **identifiant de session** (généralement stockée dans un cookie). 
- à chaque requête, l'identifiant est transmis, et le backend l'utilise pour récupérer en mémoire les informations de session (utilisateur, rôles...), vérifier l'autorisation et répondre.

**Stateless** = 
- les données de connexion sont encapsulées directement dans un **token signé** envoyé au client après authentification. 
- à chaque requête, le client envoie ce token (dans l'en-tête `Authorization` ou via les cookies). 
- le backend vérifie la signature et décode le token localement, sans accès à un store, pour identifier l'utilisateur et répondre.

## Connexion avec session (`stateful`)

![](../resources/screens/auth-session.png)

### Avantages

- ✅ **Sécurisé par défaut** : les données sensibles restent côté serveur.
- ✅ **Révocation facile** : il suffit de supprimer ou d'invalider la session en mémoire ou BDD.
- ✅ **Adapté aux applications web traditionnelles et SSR (server-side rendering)**.
- ✅ **Gère naturellement les expirations et la déconnexion.**

### Inconvénients

- ❌ **Stateful** : nécessite de stocker les sessions, donc moins scalable sans store partagé.
- ❌ **Moins adapté aux APIs REST / microservices** car nécessite que tous les services aient accès au même store.
- ❌ **Risque de CSRF** si la session ID est dans un cookie non sécurisé.

### Quand l'utiliser ?

- ✅ Applications **web classiques** avec rendu serveur (SSR).
- ✅ Backoffices et **interfaces d’administration**.
- ✅ Lorsque tu as besoin d'une **révocation immédiate des accès**.
- ✅ Si tu as un **frontend et backend fortement couplés** ou hébergés ensemble.

### Exemple de mise en place 

```js
import session from "express-session";

// Mise en place de la session
// - rajoute une session côté serveur (ici RAM) avec une `sessionId` transmise au client via un cookie HttpOnly
// - rajoute les données de la session dans `req.session` pour chaque requête suivante
app.use(session({
  secret: 'une-clé-secrète', // Stocker dans l'env, pour générer un sessionID sécurisé
  cookie: {
    httpOnly: true, // cookie non lisible depuis le code front (document.cookies === undefined)
    secure: true, // pour HTTPS
    maxAge: 60 * 60 * 1000, // 1h
    sameSite: "strict" // limiter les attaques CSRF lorsque le client et le backend sont sur le même domaine
  },
  store: "..." // choix du stockage (RAM, Redis, autres)
}));

// Connexion
app.post("/login", (req, res) => {
  // Vérifier les credentials (email et password) depuis le body
  // ...

  // Stocker l'utilisateur en session ==> si la session contient l'ID d'un utilisateur, la requête est authentifiée
  req.session.userId = user.id; // on peut également stocker toutes les données de l'utilisateur
});

// Route protégée
app.get("/me", (req, res) => {
  // Vérifier si l'utilisateur est connecté
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Récupérer les données protégée et répondre au client
  // ...
});
```

## Connexion avec JWT (`stateless`)

![](../resources/screens/auth-jwt.png)

### Avantages

* ✅ **Stateless** : aucun stockage côté serveur nécessaire → très scalable.
* ✅ **Parfait pour les APIs REST, GraphQL, microservices**.
* ✅ Facile à utiliser entre différents domaines ou applications (mobile, SPA...).
* ✅ Peut contenir des **informations utiles directement dans le token** (rôles, permissions...).

### Inconvénients

* ❌ **Révocation complexe** : difficile d’invalider un token avant son expiration sauf en maintenant une blacklist côté serveur.
* ❌ Si le JWT est compromis, l'accès est possible jusqu'à expiration.
* ❌ La **taille du token peut être importante**, car les infos sont embarquées.
* ❌ **Sensibilité au XSS** si stocké en localStorage.

### Quand l'utiliser ?

* ✅ **API REST, GraphQL**, SPA (React, Svelte, Vue...).
* ✅ **Microservices** et architectures distribuées.
* ✅ Accès à des ressources cross-domaines, ou pour les apps mobiles.
* ✅ Quand tu veux éviter de gérer un **store côté serveur**.

### Exemple de mise en place

```js
import jwt from "jsonwebtoken";

const JWT_SECRET = "une-clé-secrète"; // Stocker dans l'env

// Connexion
app.post("/login", (req, res) => {
  // Vérifier les credentials (email et password) depuis le body
  // ...

  // Générer un token contenant l'ID de l'utilisateur
  const token = jwt.sign(
    { userId: user.id, roles: user.roles }, 
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Envoyer le token au client (en cookie, plus sécurisé)
  res.cookie("token", token, {
    httpOnly: true, // Cookie non lisible par le code client
    sameSite: "strict", // limiter les attaques CSRF lorsque le client et le backend sont sur le même domaine
    secure: true, // pour HTTPS
    maxAge: 60 * 60 * 1000 // 1h
  });

  // Envoyer le token au client (dans le body, pour d'autres microservices et faciliter le testing)
  res.json({ token });
});

// Middleware pour protéger les routes
app.use((req, res, next) => {
  // Récupérer le JWT depuis les headers (Cookie ou Bearer)
  const token = req.cookies.token || req.headers.authorization;
  if (! token) { return res.status(401).json({ message: "Unauthorized" }); }
  
  // Valider et décoder le token
  const { userId, roles } = jwt.verify(token, JWT_SECRET); // Penser également à gérer l'erreur si token non valide

  // L'ajouter à req pour faciliter le travail des middlewares suivants
  req.user = { userId, roles };

  // Bonus : très souvent, on récupère également en BDD les données de l'utilisateur pour l'accrocher à Req
  // Mais alors, notre connexion n'est plus vraiment stateless ==> on perd l'intérêt du JWT, autant utiliser directement les sessions

  next();
});

// Route protégée
app.get("/me", authenticateJWT, (req, res) => {
  // req.user contient l'info extraite du JWT
  // à coupler avec d'autres informations à récupérer en base de données
  res.json({ userId: req.user.userId, roles: req.user.roles });
});
```

## En savoir plus 

[Stop using JWT for sessions](http://cryto.net/~joepie91/blog/2016/06/13/stop-using-jwt-for-sessions/)

