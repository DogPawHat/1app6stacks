import { getTwoRandomPokemon } from "~/sdk/lib";
import { setCookie } from "vinxi/http";

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export async function getNextPairAndSeed() {
  const newNextPairAndSeed = await getTwoRandomPokemon();
  setCookie("nextPairAndSeed", JSON.stringify(newNextPairAndSeed));
  return newNextPairAndSeed;
}

export async function recordVote(winner: string, loser: string) {
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
