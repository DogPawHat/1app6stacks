import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useServerFn } from "@tanstack/start";
import { useSuspenseQuery } from "@tanstack/react-query";

import { api } from "../../convex/_generated/api";
import VoteFallback from "~/utils/vote-fallback";
import { PokemonSprite } from "~/utils/sprite";
import { recordServerVote } from "~/sdk/turbo/record-vote";
import { setServerNextTurboRandomPokemonPair } from "~/sdk/turbo/set-next-pokemon-pair";
import type { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/turbo/red/$redDexId/blue/$blueDexId")({
  pendingComponent: VoteFallback,
  loader: async ({ params, context, preload }) => {
    void Promise.allSettled([
      context.queryClient.prefetchQuery(
        convexQuery(api.pokemon.getPairByDexIds, {
          redDexId: parseInt(params.redDexId, 10),
          blueDexId: parseInt(params.blueDexId, 10),
        })
      ),
      (async () => {
        if (preload === false) {
          const getNextPairAndSeed = await setServerNextTurboRandomPokemonPair({
            data: {
              currentPair: [
                parseInt(params.redDexId, 10),
                parseInt(params.blueDexId, 10),
              ],
            },
          });
          context.queryClient.setQueryData(
            convexQuery(api.pokemon.getPairByDexIds, {
              redDexId: getNextPairAndSeed.pair[0].dexId,
              blueDexId: getNextPairAndSeed.pair[1].dexId,
            }).queryKey,
            getNextPairAndSeed.pair
          );
        }
      })(),
    ]);
  },
  component: TurboVoteContent,
});

function TurboVoteContent() {
  const navigate = Route.useNavigate();
  const { redDexId, blueDexId } = Route.useParams();
  const queryClient = useQueryClient();
  const recordVote = useServerFn(recordServerVote);
  const { data: twoPokemon } = useSuspenseQuery(
    convexQuery(api.pokemon.getPairByDexIds, {
      redDexId: parseInt(redDexId, 10),
      blueDexId: parseInt(blueDexId, 10),
    })
  );

  const { mutate: handleRecordVote, isPending: votePending } = useMutation({
    mutationFn: ({
      winner,
      loser,
    }: {
      winner: Id<"pokemon">;
      loser: Id<"pokemon">;
    }) => recordVote({ data: { winner, loser } }),
    onSuccess: (data) => {
      queryClient.setQueryData(
        convexQuery(api.pokemon.getPairByDexIds, {
          redDexId: data.pair[0].dexId,
          blueDexId: data.pair[1].dexId,
        }).queryKey,
        data.pair
      );
      navigate({
        to: Route.to,
        params: {
          redDexId: `${data.pair[0].dexId}`,
          blueDexId: `${data.pair[1].dexId}`,
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
              onMouseDown={() =>
                handleRecordVote({
                  winner: pokemon._id,
                  loser: twoPokemon[index === 0 ? 1 : 0]._id,
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
