// Échantillonnage (seeding)

import { prisma } from "./index.ts";

// Users
await prisma.user.createMany({
  data: [
    { firstname: "Alice", lastname: "Oclock", email: "alice@oclock.io", password: "$argon2id$v=19$m=65536,t=3,p=4$DXOFdkk1gmX5l0FogtI3fA$6rks8DLL/0Bcrddfj2E0DPlt3RunF2vObpLVfh8WG3U" }, // "password"
    { firstname: "Bob", lastname: "Oclock", email: "bob@oclock.io", password: "$argon2id$v=19$m=65536,t=3,p=4$DXOFdkk1gmX5l0FogtI3fA$6rks8DLL/0Bcrddfj2E0DPlt3RunF2vObpLVfh8WG3U" }, // "password"
  ]
});

// Levels
await prisma.level.createMany({
  data: [
    { name: "Facile" },
    { name: "Moyen" },
    { name: "Difficile" }
  ]
});

console.log(`📊 Échantillonnage effectué avec succès.`);
