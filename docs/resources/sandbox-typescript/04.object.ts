const george: Admin = {
  firstname: "George",
  lastname: "Abitbol",
  occupation: "L'homme le plus classe du monde",
  zipCode: 42,
  isStyling: true,
  isAdmin: true
};

interface Admin {
  firstname: string;
  lastname: string;
  occupation: string;
  zipCode: number;
  isStyling: boolean;
  isAdmin: boolean;
}

interface User {
  firstname: string;
  lastname: string;
}

function getFullName(myUser: User) {
  return `${myUser.firstname} ${myUser.lastname}`;
}


getFullName({ firstname: "Harry", lastname: "Potter" }); // ✅

// getFullName({}); // ==>❌ Contrat non respecté

getFullName(george); // ✅


//// ======= Typer un objet dont on ne sait pas ce qu'il contient =======

function displayKeysAndValues(obj: Record<string, any>) { // Object avec des clés qui sont des string et des valeurs qui sont de n'importe quel type
  for (const key in obj) {
    console.log(key);
  } 
}

displayKeysAndValues({
  firstname: "Hermione",
  lastname: "Granger",
  age: 11
});

// displayKeysAndValues("Hello"); // ❌ "" n'est pas un objet (pas un Record<string, ...>)
// displayKeysAndValues(42); // ❌ 42 n'est pas un objet (pas un Record<string, ...>)

displayKeysAndValues({}); // ✅


// Exemple, on veut faire un middleware qui parcours le body et vérifie que chaque valeur du body ne contient pas d'injection XSS
// body = { firstname: "Toto", lastname: "<script>fetch(...)</script>" }
// body = { name: "Difficile", color: "<script>fetch(...)</script>" }

function sanitizeBody(body: any) {} // TODO: améliorer le typage avec un peu d'aide ! prof ou LLM

