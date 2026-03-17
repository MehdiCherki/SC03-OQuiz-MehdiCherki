// ============ VARIABLE =========

// Inférence : TypeScript SAIT que firstname est de type string, et plus précisement de type "John"
const firstname = "John";

// Inférence : TS sait que lastname est de type "string"
const lastname: string = "Doe";
// const lastname: string = 4 // ❌ Type 'number' is not assignable to type 'string'.

// Type assertion : on cast le type de cette variable manuellement
// ❌ On évite de faire des type assertion, on laisse typescript inférer au maximum
const middlename = "Scott" as string; // Type assertion. Pas néccessaire non plus : c'est déjà une string. 


const zipCode = 42;
const date = new Date(); // Type Date dérivée de la classe "Date"

// Conseil : laisser typescript inférer le type de variable, pas besoin de le préciser manuellement


/// ========== Fonction ==========

function buildPseudo(name: string, zip: number): string {
  return `${name}-du-${zip}`;
}

const pseudo = buildPseudo(firstname, zipCode); // ✅ le contrat des types est respecté
console.log(pseudo);

// buildPseudo(new Date(), "string"); // ❌ Argument of type 'Date' is not assignable to parameter of type 'string'.

