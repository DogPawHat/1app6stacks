import { createFileRoute, redirect } from "@tanstack/react-router";
import { getRandomPokemonPair } from "~/utils/get-random-pokemon-pair";

export const Route = createFileRoute("/turbo/")({
  beforeLoad: () => {
    const [redDexId, blueDexId] = getRandomPokemonPair(Math.random());
    throw redirect({
      to: "/turbo/battle/red/$redDexId/blue/$blueDexId",
      params: {
        redDexId: redDexId.toString(),
        blueDexId: blueDexId.toString(),
      },
    });
  },
});
