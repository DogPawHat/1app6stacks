import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { getFreshTurboRandomPokemonPair } from "~/utils/get-random-number";
import { convexQuery } from "@convex-dev/react-query";
import VoteFallback from "~/utils/vote-fallback";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/turbo/")({
  loader: async ({ context }) => {
    const newPair = await getFreshTurboRandomPokemonPair();
    console.log("newPair", newPair);
    context.queryClient.setQueryData(
      convexQuery(api.pokemon.getPairByDexIds, {
        redDexId: newPair.pair[0].dexId,
        blueDexId: newPair.pair[1].dexId,
      }).queryKey,
      newPair.pair
    );
    throw redirect({
      to: "/turbo/red/$redDexId/blue/$blueDexId",
      params: {
        redDexId: `${newPair.pair[0].dexId}`,
        blueDexId: `${newPair.pair[1].dexId}`,
      },
    });
  },
  component: VoteFallback,
});
