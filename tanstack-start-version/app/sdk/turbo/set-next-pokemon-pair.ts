import { createServerFn } from "@tanstack/start";
import { getCookie } from "vinxi/http";
import { z } from "zod";

import { pokemonPairAndSeedSchema } from "~/sdk/lib";

import { getNextPairAndSeed } from "./lib";

export const setServerNextTurboRandomPokemonPair = createServerFn({
  method: "POST",
})
  .validator(
    z.object({
      currentPair: z.tuple([z.number(), z.number()]),
    }),
  )
  .handler(async ({ data: { currentPair } }) => {
    const nextPairAndSeedCookie = getCookie("nextPairAndSeed");

    if (!nextPairAndSeedCookie) {
      return getNextPairAndSeed();
    }

    const nextPairAndSeed = pokemonPairAndSeedSchema.parse(
      JSON.parse(nextPairAndSeedCookie),
    );

    if (
      nextPairAndSeed.pair[0].dexId === currentPair[0] ||
      nextPairAndSeed.pair[0].dexId === currentPair[1]
    ) {
      return getNextPairAndSeed();
    }

    return nextPairAndSeed;
  });
