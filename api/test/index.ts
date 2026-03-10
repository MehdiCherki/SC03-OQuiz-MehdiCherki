import axios from "axios";
import { generateAuthTokens } from "../src/lib/tokens.ts";
import type { User } from "../src/models/index.ts";

// API BASE URL pour les tests
export const apiBaseUrl = `http://localhost:${process.env.PORT}/api`;

// Utilitaire pour fabriquer un faux utilisateur
let fakeUserId = 0;
export function generateFakeUser(user?: Partial<User>): User {
  fakeUserId++;
  return {
    id: fakeUserId,
    firstname: "firstname",
    lastname: "lastname",
    email: `user${fakeUserId}@oclock.io`,
    password: "P4$$w0rd",
    role: "admin",
    created_at: new Date(),
    updated_at: new Date(),
    ...user,
  };
}

// Utilitaire pour faire des appels API en tant que "admin"
// Authentification stateless ici : l'utilisateur n'est pas réellement présent en base de données
export const authedRequester = buildAuthedRequester(generateFakeUser());

// Utilitaire pour faire des appels API en tant que "l'user passé en argument"
// Authentification stateless ou stateful au choix, selon si l'utilisateur fourni en argument est également ajouté à la BDD ou non durant l'écriture du test
export function buildAuthedRequester(user: User) {
  const { accessToken } = generateAuthTokens(user);
  return axios.create({
    baseURL: apiBaseUrl, // pour ne pas avoir besoin de préfixer par `http://localhost:7357/api`
    headers: { Authorization: `Bearer ${accessToken.token}` }, // pour authentifier les requêtes
    validateStatus: () => true, // pour que axios ne lève pas d'exception lors le status renvoyé est 4XX ou 5XX
  });
}
