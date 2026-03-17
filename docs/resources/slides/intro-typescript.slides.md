# Introduction à TypeScript

---

## 1. Typescript, c'est quoi ?

-- 

### Une définition ? 

- _TypeScript est un langage de programmation **fortement typé** qui s'appuie sur JavaScript et offre de meilleurs outils à n'importe quelle échelle._  <small>[typescriptlang.org](https://www.typescriptlang.org/)</small>

- _Le code TypeScript est **transcompilé en JavaScript**, et peut ainsi être interprété par n'importe quel navigateur web ou moteur JavaScript._ <small>[Wikipedia](https://fr.wikipedia.org/wiki/TypeScript)</small>

--

### Typage

<table>
  <tr>
    <th>Typage</th>
    <th>Fort</th>
    <th>Faible</th>
  </tr>
  <tr>
    <th>Statique</th>
    <td>Java, TypeScript</td>
    <td>C++</td>
  </tr>
  <tr>
    <th>Dynamique</th>
    <td>Python, Ruby</td>
    <td>JavaScript</td>
  </tr>
</table>

<!-- | Typage    | Fort             | Faible
| ---       | --               | -- 
| Statique  | Java, TypeScript | C++
| Dynamique | Python, Ruby     | JavaScript -->


- **Typage statique** : détecte les erreurs de type à la compilation.
- **Typage dynamique** : détecte les erreurs de type à l'éxécution.

- **Typage fort** : conversions implicites de type sont interdites.
- **Typage faible** : conversions implicites de type sont acceptées.

<small>[Source Wikipedia](https://fr.wikipedia.org/wiki/Typage_fort)</small>

<small>[Stackoverflow](https://stackoverflow.com/questions/2690544/what-is-the-difference-between-a-strongly-typed-language-and-a-statically-typed)</small>

--

### Typage (exemple)

```ts
function multiply(a: number, b: string) {
  return a * b; // The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
}
```

Erreur de type

--

### Transcompilation 

- = "transpilation"
- = source-to-source compilation.
- ~= compilation

Le code `Typescript` est transpilé vers du code `JavaScript` via un exécutable : le `TypeScript Compiler` (`tsc`)

--

### Transcompilation (exemple)

```ts
// index.ts

function sum(a: number, b: number): number {
  return a + b;
}
```

On exécute `tsc` avec une configuration minimale, on obtient :

```js
// index.js 

"use strict";
function sum(a, b) {
  return a + b;
}
```

C'est "juste" du JavaScript !!<!-- .element: class="fragment" -->

---

## 2. TypeScript, pourquoi ? 

--

### Contexte

- **1995** : Développement de `LiveScript` pour le navigateur Netscape
  - en 10 jours par Brendan Eich
- **1996** : `LiveScript` devient `JavaScript`
  - pour surfer sur la popularité de `Java`
- **1997** : `Netscape` soumet JavaScript à ECMA International
  - pour standardisation
- **1993** : `ECMAScript 3`
  - ça commence à ressembler à quelque chose
- **2005** : `jQuery`
  - à la rescousse pour aligner les navigateurs
- **2009** : `Node.js`
  - JS everywhere ! 
- **2012** : `Typescript`
  - par Microsoft, notamment par l'inventeur du `C#`
- **2015** : `ES6` (ECMAScript 2015)
  - on respire !

--

### Avantages

- **Typage fort** : les annotations de type évitent de nombreuses erreurs de développement, améliorent la maintenabilité et facilitent le refactoring.

- **Outils puissants** : TypeScript est intégré aux IDEs (auto-complétion, type-safety checks, auto-refactoring, auto-imports...).

- **Productivité**: TypeScript offre des fonctionnalités (interfaces, types, décorateurs, ...) pour rendre l'écriture et la maintenance de code plus confortable. 

- **Documentation** : les annotations de type permettent de comprendre rapidement les entrées et sorties des fonctions. <small>Psst, l'autocompletion de JS nous provient notamment des outils Typescript</small>

- **Communauté** : la communauté TypeScript croit constamment, et l'utilisation de TS tend à dépasser l'utilisation de JS ([source](https://2022.stateofjs.com/en-US/usage/)).

- **Scalabilité** : TypeScript est un langage adapté à des projets d'envergures. C'est un bon choix pour des applications niveau entreprise.

--

### Inconvénients

- **Courbe d'apprentissage** : TypeScript a une courbe d'apprentissage plus abrupte que JS pour les développeurs qui découvrent les systèmes de typage et le typage statique.

- **Configuration** : TypeScript demande une prise en main de la configuration, ce qui peut engendrer un coup en temps, notamment sur les étapes de production.

- **Compilation** : TypeScript introduit une étape de compilation, qui peut avoir un impact sur le confort de dev sur certains gros projet.

- **Over engineering** : Comme chaque outil, TS est fourni avec ses risques d'utilisations maladroites (mauvaises abstractions, super-typage, ...)


### Notre type-safety good guy !

```ts
function parseDate(d: string | Date) {
  if (typeof d === "string") {
    // Ici, TS sait que d est une string et propose l'autocomplétion complète
    // => static type-checking
  }

  if (d instanceof Date) {
    d.toLocalDateString() // Ici, TS rale : la fonction se nomme toLocaleDateString !
    // => static type-checking
  }
}
```

```ts
function flipCoin() {
  return Math.random < 0.5; 
  // TS good guy : Operator '<' cannot be applied to types '() => number' and 'number'.
  // JS bad guy  : tout va bien, cette opération ne lève pas d'exception et retourne toujours "false"
  // => non-exception failure
}
```

---

## 3. TypeScript, comment ? 

-- 

### 3.1. Installation 

Installer le compilateur `tsc`

- en global
  - `npm install -g tsc`

- ou bien dans un projet : 
  - `npm install --save-dev tsc`

--

### 3.2. Configuration 

Exemple de configuration basique

```json
// tsconfig.json

{
  "compilerOptions": {
    // Source
    "rootDir": "./", // Dossier source
    "moduleResolution": "node", // résolution des modules à-la-node.js (par défaut)
    "strict": true, // Vérification stricte des types à la transpilation
    
    // Cible
    "outDir": "./dist/", // Dossier cible
    "target": "ESNext", // Langage cible
    "module": "CommonJS", // Type de module cible (autre valeur courante : ESNext)
  }
}
```

--

### 3.3. Les types

[Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)

--

#### Les types primitifs

- `boolean`
- `string`
- `number`

(non exhaustif)

--

#### Les types "absence de valeur"

- `null`
- `undefined`
- `void` (pour ignorer la valeur de sortie d'un fonction)

--

#### Les types "imprécis"

- `any` ("I don't care") 
  - => absence de typage pour une valeur. On peut utiliser la valeur comme n'importe quel type.
- `unknown` ("I don't know") 
  - => absence de typage controlé. Il faudra vérifier la valeur pour l'utiliser.

--

#### Les types "listes"

- `Array`
- `Tuple` (= array de taille fixe)
- `Enum` (sucre syntaxique)

--

#### Les types "objets"

Object Type : `{ key: valueType; }`

On évidemment peut le nommer pour le réutiliser : 
- `type Coordinate = { x: number; y: number; }` (type alias)
- `interface Coordinate { x: number; y: number; }` (interface)

On évite en revanche les types imprécis :
- `object` ❌
- `any` ❌

--

### Comment typer ? Quoi typer ? 

Règles implicites : 
- typer les paramètres des fonctions
- laisser TypeScript **inférer** au maximum les types résultants à travers le codebase. 
- utiliser des gardes (`guards`) et des "fonctions restrictives" (`downcast functions`) pour restreindre les types
- éviter les [type assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions) manuelles.
- éviter les `any` au maximum. Au besoin, prévilégier les `unknown` pour inciter à une vérifier manuellement du type. 
