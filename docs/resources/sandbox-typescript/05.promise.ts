async function getPokemon(name: string) {
  const url = "https://pokeapi.co/api/v2/pokemon/" + name;
  
  // Appel vers l'API
  const httpResponse = await fetch(url);

  // récupérer le body
  const body: Pokemon = await httpResponse.json();

  console.log(`Le Pokémon n°${body.id} se nomme ${body.name}`);

  const abilities = body.abilities.map(element => element.ability.name);
  const abilitiesText = abilities.join(", ");
  console.log(`Ces capacités sont : ${abilitiesText}`);

  const types = body.types.map(type => type.type.name).join(", ");
  console.log(`Ces types sont : ${types}`);
}

getPokemon("pikachu");
getPokemon("mewtwo");

interface Pokemon {
  id: number;
  name: string;
  abilities: Array<Ability>
  types: Array<Type>
}

interface Ability {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
}

interface Type {
  slot: number;
  type: {
    name: string;
    url: string;
  }
}