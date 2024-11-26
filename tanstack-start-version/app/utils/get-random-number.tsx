import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/start";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { deleteCookie, getCookie, setCookie } from "vinxi/http";
import { z } from "zod";

const pokemonSchema = z.object({
  _id: z.string(),
  name: z.string(),
  dexId: z.number(),
});

const pokemonPairSchema = z.tuple([pokemonSchema, pokemonSchema]);

const pokemonPairAndSeedSchema = z.object({
  pair: pokemonPairSchema,
  randomSeed: z.number(),
});

const voteSchema = z.object({
  winner: z.string(),
  loser: z.string(),
});

export const getServerRandomNumber = createServerFn({
  method: "GET",
}).handler(() => {
  return Math.random();
});

async function getTwoRandomPokemon() {
  const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL!;
  if (!CONVEX_URL) {
    console.error("missing envar VITE_CONVEX_URL");
  }
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

async function recordVote(winner: string, loser: string) {
  const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL!;
  if (!CONVEX_URL) {
    console.error("missing envar VITE_CONVEX_URL");
  }
  const convexClient = new ConvexHttpClient(CONVEX_URL);
  await convexClient.mutation(api.pokemon.vote, {
    voteFor: winner as Id<"pokemon">,
    voteAgainst: loser as Id<"pokemon">,
  });
}

async function getNextPairAndSeed() {
  const newNextPairAndSeed = await getTwoRandomPokemon();
  setCookie("nextPairAndSeed", JSON.stringify(newNextPairAndSeed));
  return newNextPairAndSeed;
}

// You've gone to turbo, so you need a fresh pair
export const getServerFreshTurboRandomPokemonPair = createServerFn({
  method: "POST",
}).handler(async () => {
  deleteCookie("nextPairAndSeed");
  const newNextPairAndSeed = await getTwoRandomPokemon();

  return newNextPairAndSeed;
});

export const getServerNextTurboRandomPokemonPair = createServerFn({
  method: "POST",
})
.validator(z.object({
  currentPair: z.tuple([z.number(), z.number()]),
}))
.handler(async ({data: {currentPair}}) => {
  const nextPairAndSeedCookie = getCookie("nextPairAndSeed");

  if (!nextPairAndSeedCookie) {
    return getNextPairAndSeed();
  }

  const nextPairAndSeed = pokemonPairAndSeedSchema.parse(
    JSON.parse(nextPairAndSeedCookie)
  );

  if (nextPairAndSeed.pair[0].dexId === currentPair[0] || nextPairAndSeed.pair[0].dexId === currentPair[1]) {
    return getNextPairAndSeed();
  }

  return nextPairAndSeed;
});

export const handleServerVote = createServerFn({
  method: "POST",
}).validator(voteSchema).handler(async ({data: {winner, loser}}) => {
  
  await recordVote(winner, loser);

  const threads = [
    (async () => {
      const nextPairAndSeedCookie = getCookie("nextPairAndSeed");
      const nextPairAndSeed = nextPairAndSeedCookie ? pokemonPairAndSeedSchema.parse(JSON.parse(nextPairAndSeedCookie)) : await getNextPairAndSeed();

      return nextPairAndSeed;
    })(),
    (async () => {
      return recordVote(winner, loser);
    })(),
  ] as const;

  const resolvedThreads = await Promise.all(threads);

  return resolvedThreads[0];
});









export const getRandomNumberQueryOptions = () => {
  return queryOptions({
    queryKey: [
      "1app6stacks__tanstack-start-version",
      "getRandomNumberFromServer",
    ],
    queryFn: () => getServerRandomNumber(),
    staleTime: Infinity,
  });
};

export const getTurboRandomNumberQueryOptions = () => {
  return queryOptions({
    queryKey: [
      "1app6stacks__tanstack-start-version",
      "getTurboRandomNumberFromServer",
    ],
    queryFn: () => getServerRandomNumber(),
    staleTime: Infinity,
  });
};
