# Récapitulatif "inférence de type"

---

Pour restreindre les types des variables manipulées, on utilise : 


--

1. En priorité les `type gards` natifs du langage JS : 

```ts
function doStuff(x?: number | string | Date | { date: string }) {
  if (!x) {
    return x; // Infered as : string | number | undefined (à cause des falsy values)
  }
  
  if (typeof x === "number") {
    return x * 2; // Inferred as number
  }

  if (x === "bonjour") {
    return x + " monde"; // Inferred as "bonjour"
  }

  if (x instanceof Date) {
    return x.toISOString(); // Inferred as Date
  }

  if (typeof x === "string") {
    return x; // Inferred as string
  } 

  if ("date" in x) {
    return x.date; // Inferred as our { date: string } object 
  }
}
```

-- 

2. Utiliser les `type guards` définies manuellement

```ts
const stuffs = [1, 2, 3, "a", "b", "c"];

const sadNumbers = stuffs.filter(v => typeof v === "number");
// (string | number)[]

const happyNymbers = stuffs.filter(isNumber);
// number[]

function isNumber(x: string | number): x is number {
  return typeof x === "number";
}
```

--

3. Restreindre en utilisants des `downcast functions`

```ts
function toNumber(x: unknown) {
  if (typeof x === "number") { return x; }

  if (typeof x === "string") { return parseInt(x); }

  // Pour le moment, la fonction retourne `number | unknown`
  // Pour s'émanciper du unknown, il ne reste que 3 options, au choix selon les cas de figure :

  // 1. On lève une erreur
  throw new Error("toNumber should not have been called with such a fancy argument");

  // 2. On renvoie une valeur par défaut (fallback)
  return NaN;

  // 3. On quitte le processus (ex : on gère de la config)
  process.exit(0);
}
```

---

Sinon, pas le choix ? On peut toujours "forcer" le type d'une varible

--

1. `Non null assertion operator`

```ts
let myAge: string | undefined;

parseInt(myAge!); // On indique "myAge" ne peut pas être null ou undefined. Autrement la compilation planterait
```

-- 

2. `as any`

```ts
const firstName: unknown = "John";
(firstName as string).toUpperCase(); // Caster unknown vers une string

const module: any = {};
(module as { getFirstName(): string }).getFirstName(); // Caster un objet vide vers un module avec une méthode

const lastName = "Doe";
Math.floor(lastName as any); // On caste vers any pour pouvoir appeler la méthode (retourne NaN en JS)
```

--

3. `const` assertions

```ts
const numbers = [1, 2, 3];
// number[]

const tupple = [1, 2, 3] as const;
// readonly [1, 2, 3]
```
