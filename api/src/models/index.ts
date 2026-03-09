import { PrismaClient } from "../../prisma/generated/client.ts";

// On réexporte tous les modèles pour faciliter leur utilisatation dans le reste de l'application
export * from "../../prisma/generated/client.ts";

// On exporte une connexion à la base de données
export const prisma = new PrismaClient();
