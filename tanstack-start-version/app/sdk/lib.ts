import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { z } from "zod";
import { env } from "../env";

const pokemonSchema = z.object({
  _id: z.string(),
  name: z.string(),
  dexId: z.number(),
});

const pokemonPairSchema = z.tuple([pokemonSchema, pokemonSchema]);

export const pokemonPairAndSeedSchema = z.object({
  pair: pokemonPairSchema,
  randomSeed: z.number(),
});

export const voteSchema = z.object({
  winner: z.string(),
  loser: z.string(),
});

export async function getTwoRandomPokemon() {
  const CONVEX_URL = env.VITE_CONVEX_URL;
  const convexClient = new ConvexHttpClient(CONVEX_URL);

  const randomSeed = Math.random();
  const pair = await convexClient.query(api.pokemon.getRandomPair, {
    randomSeed,
  });
  return {
    randomSeed,
    pair: [
      {
        ...pair[0],
        _id: pair[0]._id.toString(),
      },
      {
        ...pair[1],
        _id: pair[1]._id.toString(),
      },
    ],
  } satisfies z.infer<typeof pokemonPairAndSeedSchema>;
}
