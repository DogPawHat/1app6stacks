import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../convex/_generated/api";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";

import VoteFallback from "~/utils/vote-fallback";
import { PokemonSprite } from "~/utils/sprite";
import { getRandomNumberQueryOptions } from "~/sdk/query-options";

export const Route = createFileRoute("/")({
  component: VoteComponent,
});

function VoteContent() {
  const { data: pokemonSeed } = useSuspenseQuery(getRandomNumberQueryOptions());

  const { data: twoPokemon } = useSuspenseQuery(
    convexQuery(api.pokemon.getRandomPair, { randomSeed: pokemonSeed }),
  );

  const { mutate: vote, isPending: votePending } = useMutation({
    mutationFn: useConvexMutation(api.pokemon.vote),
  });

  return (
    <div className="flex justify-center gap-16 items-center min-h-[80vh]">
      {twoPokemon.map((pokemon, index) => (
        <div key={pokemon.dexId} className="flex flex-col items-center gap-4">
          <PokemonSprite dexId={pokemon.dexId} className="w-64 h-64" />
          <div className="text-center">
            <span className="text-gray-500 text-lg">#{pokemon.dexId}</span>
            <h2 className="text-2xl font-bold capitalize">{pokemon.name}</h2>
            <button
              type="button"
              onMouseDown={() =>
                vote({
                  voteFor: pokemon._id,
                  voteAgainst: twoPokemon[index === 0 ? 1 : 0]._id,
                })
              }
              disabled={votePending}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Vote
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function VoteComponent() {
  return (
    <div className="flex justify-center gap-16 items-center min-h-[80vh]">
      <React.Suspense fallback={<VoteFallback />}>
        <VoteContent />
      </React.Suspense>
    </div>
  );
}
