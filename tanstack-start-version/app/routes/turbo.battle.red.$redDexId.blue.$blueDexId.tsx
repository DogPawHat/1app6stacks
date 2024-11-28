import * as React from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../convex/_generated/api";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import VoteFallback from "~/utils/vote-fallback";
import PokemonSprite from "~/utils/pokemon-sprite";
import { getRandomPokemonPair } from "~/utils/get-random-pokemon-pair";

export const Route = createFileRoute(
  "/turbo/battle/red/$redDexId/blue/$blueDexId"
)({
  params: {
    parse: ({ redDexId, blueDexId }) => ({
      redDexId: parseInt(redDexId, 10),
      blueDexId: parseInt(blueDexId, 10),
    }),
    stringify: ({ redDexId, blueDexId }) => ({
      redDexId: redDexId.toString(),
      blueDexId: blueDexId.toString(),
    }),
  },
  loader: ({ context, params, preload }) => {
    context.queryClient.prefetchQuery(
      convexQuery(api.pokemon.getPairByDexIds, {
        redDexId: params.redDexId,
        blueDexId: params.blueDexId,
      })
    );
    if (preload === false) {
      const nextPair = getRandomPokemonPair(Math.random());
      context.queryClient.prefetchQuery(
        convexQuery(api.pokemon.getPairByDexIds, {
          redDexId: nextPair[0],
          blueDexId: nextPair[1],
        })
      );

      return {
        nextPairPromise: Promise.resolve(nextPair),
      };
    }

    return {
      nextPairPromise: new Promise(() => {
        void 0;
      }) as Promise<[number, number]>,
    };
  },
  pendingComponent: VoteFallback,
  component: VoteContent,
});

function VoteContent() {
  const router = useRouter();
  const { nextPairPromise } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const { redDexId, blueDexId } = Route.useParams();
  const { data: twoPokemon } = useSuspenseQuery(
    convexQuery(api.pokemon.getPairByDexIds, {
      redDexId: Number(redDexId),
      blueDexId: Number(blueDexId),
    })
  );

  const commitVote = useConvexMutation(api.pokemon.vote);
  const { mutate: vote, isPending: votePending } = useMutation({
    mutationFn: commitVote,
    onSuccess: async () => {
      const nextPair = await nextPairPromise;
      router.preloadRoute({
        to: "/results",
      });
      navigate({
        params: {
          redDexId: nextPair[0],
          blueDexId: nextPair[1],
        },
      });
    },
  });

  return (
    <div className="flex justify-center gap-16 items-center min-h-[80vh]">
      {twoPokemon.map((pokemon, index) => (
        <div key={pokemon._id} className="flex flex-col items-center gap-4">
          <PokemonSprite pokemon={pokemon} className="w-64 h-64" />
          <div className="text-center">
            <span className="text-gray-500 text-lg">#{pokemon.dexId}</span>
            <h2 className="text-2xl font-bold capitalize">{pokemon.name}</h2>
            <button
              type="button"
              onMouseOver={async () => {
                const nextPair = await nextPairPromise;
                router.preloadRoute({
                  to: Route.to,
                  params: {
                    redDexId: nextPair[0],
                    blueDexId: nextPair[1],
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
      <React.Suspense fallback={null}>
        <PreloadNextPairSprite nextPairPromise={nextPairPromise} />
      </React.Suspense>
    </div>
  );
}

function PreloadNextPairSprite({
  nextPairPromise,
}: {
  nextPairPromise: Promise<[number, number]>;
}) {
  const nextPairDexIds = React.use(nextPairPromise);
  const { data: nextPairPokemon } = useSuspenseQuery(
    convexQuery(api.pokemon.getPairByDexIds, {
      redDexId: nextPairDexIds[0],
      blueDexId: nextPairDexIds[1],
    })
  );

  return (
    <div className="hidden">
      {nextPairPokemon.map((pokemon) => (
        <div key={pokemon._id} className="hidden">
          <PokemonSprite pokemon={pokemon} className="w-64 h-64" />
        </div>
      ))}
    </div>
  );
}
