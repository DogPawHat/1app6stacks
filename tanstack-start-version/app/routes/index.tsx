import { createFileRoute, redirect } from "@tanstack/react-router";
import { getRandomPokemonPair } from "~/utils/get-random-pokemon-pair";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const [redDexId, blueDexId] = getRandomPokemonPair(Math.random());
    throw redirect({
      to: "/battle/red/$redDexId/blue/$blueDexId",
      params: {
        redDexId: redDexId.toString(),
        blueDexId: blueDexId.toString(),
      },
    });
  },
});
