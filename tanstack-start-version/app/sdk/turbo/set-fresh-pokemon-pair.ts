import { createServerFn } from "@tanstack/start";
import { deleteCookie } from "vinxi/http";

import { getTwoRandomPokemon } from "~/sdk/lib";

// You've gone to turbo, so you need a fresh pair
export const setServerFreshTurboRandomPokemonPair = createServerFn({
  method: "POST",
}).handler(async () => {
  deleteCookie("nextPairAndSeed");
  const newNextPairAndSeed = await getTwoRandomPokemon();

  return newNextPairAndSeed;
});
