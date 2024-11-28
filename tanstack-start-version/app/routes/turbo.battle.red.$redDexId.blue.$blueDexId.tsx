import {
  createFileRoute,
  defer,
  useRouter,
  Await,
  type DeferredPromise,
} from "@tanstack/react-router";
import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../convex/_generated/api";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import VoteFallback from "~/utils/vote-fallback";
import { PokemonSprite } from "~/utils/sprite";
import { getRandomPokemonPair } from "~/utils/get-random-pokemon-pair";
import React from "react";

export const Route = createFileRoute(
  "/turbo/battle/red/$redDexId/blue/$blueDexId",
)({
  loader: ({ context, params, preload }) => {
    context.queryClient.prefetchQuery(
      convexQuery(api.pokemon.getPairByDexIds, {
        redDexId: parseInt(params.redDexId, 10),
        blueDexId: parseInt(params.blueDexId, 10),
      }),
    );
    if (preload === false) {
      const nextPair = getRandomPokemonPair(Math.random());
      context.queryClient.prefetchQuery(
        convexQuery(api.pokemon.getPairByDexIds, {
          redDexId: nextPair[0],
          blueDexId: nextPair[1],
        }),
      );

      return {
        nextPair: defer(Promise.resolve(nextPair)),
      };
    }

    return {
      nextPair: defer(
        new Promise(() => {
          void 0;
        }),
      ) as DeferredPromise<[number, number]>,
    };
  },
  pendingComponent: VoteFallback,
  component: VoteContent,
});

function VoteContent() {
  const router = useRouter();
  const { nextPair } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const { redDexId, blueDexId } = Route.useParams();
  const { data: twoPokemon } = useSuspenseQuery(
    convexQuery(api.pokemon.getPairByDexIds, {
      redDexId: Number(redDexId),
      blueDexId: Number(blueDexId),
    }),
  );

  const commitVote = useConvexMutation(api.pokemon.vote);
  const { mutate: vote, isPending: votePending } = useMutation({
    mutationFn: commitVote,
    onSuccess: async () => {
      const resolvedNextPair = await nextPair;
      navigate({
        params: {
          redDexId: resolvedNextPair[0].toString(),
          blueDexId: resolvedNextPair[1].toString(),
        },
      });
    },
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
              onMouseOver={async () => {
                const resolvedNextPair = await nextPair;
                router.preloadRoute({
                  to: Route.to,
                  params: {
                    redDexId: resolvedNextPair[0].toString(),
                    blueDexId: resolvedNextPair[1].toString(),
                  },
                });
              }}
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
      <Await promise={nextPair} fallback={null}>
        {(nextPair) =>
          nextPair.map((dexId) => (
            <div key={dexId} className="hidden">
              <PokemonSprite dexId={dexId} className="w-64 h-64" />
            </div>
          ))
        }
      </Await>
    </div>
  );
}
