FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY ./ ./

# Générer le client Prisma
# DATABASE_URL fictive : generate n'a pas besoin d'une vraie BDD, juste de parser le schéma
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npm run db:generate

# Compiler le code TypeScript
RUN npm run build

# Créer le dossier uploads (persisté via un volume Docker)
RUN mkdir -p uploads

# Lance les migrations Prisma puis démarre l'app
CMD ["npm", "run", "docker:start"]
