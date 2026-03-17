// Tableau = Array
const fruits = ["kiwi", "mango", "banana"];
const vegetables: string[] = ["brocoli", "eggplant", "cabage"];
const flavors: Array<string> = ["sweet", "sour", "spicy"]; // Autre syntaxe

const stuffs: (number | string)[] = ["hello", "world", 42];
const things: Array<number | string> = ["hello", "world", 42];

// Créer un type dérivé d'autres types
type Condiment = "salt" | "sugar" | "pepper";
const condiments: Condiment[] = ["salt", "sugar", "pepper"];



// ====== Inférence et type ==========
type Color = "blue" | "orange" | "red";
const colors: Color[] = ["blue", "orange", "red"];

function chooseColor(color: Color) {
  console.log(color);
}

chooseColor(colors[0]);


// ====== Inférence avancé sur les tableau ======
const themes = ["dark", "light", "dawn", "twilight"] as const; // Meilleur inférence Typescript (array de litterals)

function chooseTheme(theme: "dark" | "light" | "dawn" | "twilight") {
  console.log(`On set le thème à ${theme}`);
}

chooseTheme(themes[0]);

