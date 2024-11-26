import { createServerFn } from "@tanstack/start";
import { getCookie } from "vinxi/http";

import { voteSchema, pokemonPairAndSeedSchema } from "~/sdk/lib";
import { getNextPairAndSeed, recordVote } from "./lib";


export const recordServerVote = createServerFn({
  method: "POST",
})
  .validator(voteSchema)
  .handler(async ({ data: { winner, loser } }) => {
    await recordVote(winner, loser);

    const threads = [
      (async () => {
        const nextPairAndSeedCookie = getCookie("nextPairAndSeed");
        const nextPairAndSeed = nextPairAndSeedCookie
          ? pokemonPairAndSeedSchema.parse(JSON.parse(nextPairAndSeedCookie))
          : await getNextPairAndSeed();

        return nextPairAndSeed;
      })(),
      (async () => {
        return recordVote(winner, loser);
      })(),
    ] as const;

    const resolvedThreads = await Promise.all(threads);

    return resolvedThreads[0];
  });
