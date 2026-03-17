# Challenge SC02E01 - Dockeriser le client

## Rappel : Git Flow

Penser à mettre à jour votre dépôt à l'aide du Git Flow, et à créer une branche dédiée pour réaliser le challenge.

## Objectif  

👉 Dockeriser l’application **client** :  
- Créer un `Dockerfile` pour builder et servir l’application avec **Nginx**  
- Ajouter ce service dans le `docker-compose.yml` déjà existant, afin de faire tourner le client aux côtés des autres services

💡 **Bonus** :  
- Gérer proprement les variables d’environnement (`ARG`, `ENV`)  
- Organiser le `Dockerfile` en plusieurs étapes (`multi-stage build`)


## Créer un `Dockerfile` pour le client

<details><summary>
Énoncé
</summary>

Créer un `Dockerfile` dans le dossier `client` de votre projet, permettant de lancer un serveur (`Vite`) pour le code client : 

- Partir d'une image Node.js légère : `node:22-alpine`
- Créer un répertoire de travail `/app`
- Copier les fichiers `package.json` et `package-lock.json` 
- Installer les dépendances
- Copier le reste des fichiers
- Lancer le build avec `npm run build` puis lancer le serveur Vite avec `npm run preview`
  - Alternativement, `npm run dev` pourrait faire l'affaire ici.

</details>

<details><summary>
Tester
</summary>

- Tester la création de l'image à l'aide d'une commande Docker adaptée.
- Tester la création d'un conteneur à l'aide d'une commande Docker adaptée. 
- Tester l'accès au service dans le navigateur.
  - A ce stade, il est probable que le client ne se connecte pas au backend. Et c'est bien normal, nous n'avons pas précisé les variables d'environnement !
- Éteindre et supprimer le conteneur

</details>

<details><summary>
Bonus 1 : variables d'environnement
</summary>

La [documentation](https://docs.docker.com/build/building/variables/#env-usage-example) indique comment utiliser une variable d'environnement lors de l'étape de build de l'image. 

- Modifier le Dockerfile afin de définir un argument (`ARG`) pour le build `VITE_API_BASE_URL` avec l'adresse de l'API.
- Ajouter cet argument à l'environnement d'exécution (`ENV`) de l'étape de build afin que la valeur désirée soit incluse dans le bundle final 

Re-générer une image, cette fois-ci en précisant une valeur pour l'adresse de l'API lors de la commande de build (`docker build --build-arg VITE_API_BASE_URL=......`).

Re-créer un conteneur pour tester. Assurez-vous que votre API locale tourne bien afin que le front puisse s'y connecter.

</details>

<details><summary>
Bonus 2 : NGinx et multi-stage build
</summary>

Un serveur `Vite` (lancé avec `npm run preview` ou `npm run dev`) n'est pas adapté à un environnement de production. De manière général, on utilise plutôt un serveur comme NGinx, capable de gérer le cache et la montée en charge.

Notre Dockerfile doit donc à présent réaliser deux étapes :
- créé le dossier bundlé (`dist`) contenenant le code compilé du client.
- lancer un service NGinx pour servir ces fichiers compilés.

Pour cela, Docker permet la création de `Dockerfile` en plusieurs étapes (`stage`) grâce aux [multi-stage builds](https://docs.docker.com/build/building/multi-stage/).

Modifier le `Dockerfile` afin de réaliser les étapes suivantes : 

- **Étape 1 : Build de l'application**  
  - Partir d'une image Node.js légère : `node:22-alpine`
    - nommer cette étape `builder` (`AS builder`)
  - Créer un répertoire de travail `/app`
  - Copier les fichiers `package.json` et `package-lock.json`
  - Installer les dépendances
  - Copier le reste des fichiers
  - Définir un `ARG` `VITE_API_BASE_URL` pour passer l'URL de l'API au moment du build  
  - Définir une variable `ENV` à partir de cet  argument pour que la valeur soit disponible dans la commande de build  
  - Lancer le build avec `npm run build`

- **Étape 2 : Servir avec Nginx**
  - Partir d'une image `nginx:alpine`
    - consulter la [documentation](https://hub.docker.com/_/nginx)
  - Supprimer les fichiers statiques par défaut de Nginx
  - Copier le résultat du build de l'étape précédente dans `/usr/share/nginx/html`
    - à l'aide du flag `--from=builder`
  - Exposer le port 80
  - Définir la commande de lancement de Nginx 
    - Généralement `nginx -g 'daemon off;'`


</details>

<details><summary>
Solution
</summary>

```dockerfile
# ==== Stage 1: Build the app ====
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Pass environment variables at build time
# Use: docker build --build-arg VITE_API_BASE_URL=https://api.example.com .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build


# ==== Stage 2: Serve with nginx ====
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built app from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

</details>

---

## Ajouter le service `client` au `docker-compose.yml`

<details><summary>
Énoncé
</summary>

Ajouter un service `client` au `docker-compose.yml` existant :

- Le service doit être construit à partir du dossier `./client`  
- Il doit passer le build arg `VITE_API_BASE_URL`, lié à une variable de votre `.env` ou définie dans le compose  
- Il doit publier le port `80` du conteneur sur le port local défini par une variable d'environnement `CLIENT_PORT`  
- Il doit dépendre du service `api`  
- Il doit rejoindre le réseau déjà utilisé (`oquiz-network`)

💡 **Aide : `args` dans docker-compose**
Cela permet de passer des `ARG` au build directement via le compose.

</details>

<details><summary>
Solution
</summary>

```yaml
client:
  build:
    context: ./client
    dockerfile: Dockerfile
    args:
      - VITE_API_BASE_URL=${VITE_API_BASE_URL}
  restart: unless-stopped
  ports:
    - "${CLIENT_PORT}:80"
  depends_on:
    - api
  networks:
    - oquiz-network
```

</details>
