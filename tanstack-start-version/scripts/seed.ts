import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

/**
 * Fetches all Pokemon from Gen 1-9 (up to #1025) from the PokeAPI GraphQL endpoint.
 * Each Pokemon includes their name, Pokedex number, and sprite URL.
 */
async function getAllPokemon() {
  // Use the graphql endpoint because the normal one won't let you get names
  // in a single query
  const query = `
    query GetAllPokemon {
      pokemon_v2_pokemon(where: {id: {_lte: 1025}}) {
        id
        pokemon_v2_pokemonspecy {
          name
        }
      }
    }
  `;

  const response = await fetch("https://beta.pokeapi.co/graphql/v1beta", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const data = (await response.json()).data as {
    pokemon_v2_pokemon: {
      id: number;
      pokemon_v2_pokemonspecy: {
        name: string;
      };
    }[];
  };

  return data.pokemon_v2_pokemon.map((pokemon) => ({
    name: pokemon.pokemon_v2_pokemonspecy.name,
    dexNumber: pokemon.id,
  }));
}

const doBackfill = async () => {
  const CONVEX_URL = process.env.VITE_CONVEX_URL;
  if (!CONVEX_URL) {
    throw new Error("VITE_CONVEX_URL environment variable not set");
  }

  const client = new ConvexHttpClient(CONVEX_URL);
  const allPokemon = await getAllPokemon();

  // Insert pokemon in batches to avoid rate limits
  const batchSize = 100;
  for (let i = 0; i < allPokemon.length; i += batchSize) {
    const batch = allPokemon.slice(i, i + batchSize);
    await client.mutation(api.pokemon.batchCreate, {
      pokemon: batch,
    });

    console.log(`Inserted pokemon ${i} to ${i + batch.length}`);
  }

  console.log("Finished inserting all Pokemon!");
};

void doBackfill();
