import { createFileRoute } from "@tanstack/react-router";
import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../convex/_generated/api";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import VoteFallback from "~/utils/vote-fallback";
import PokemonSprite from "~/utils/pokemon-sprite";
import { getRandomPokemonPair } from "~/utils/get-random-pokemon-pair";

export const Route = createFileRoute(
  "/_battleLayout/battle/red/$redDexId/blue/$blueDexId"
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
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.pokemon.getPairByDexIds, {
        redDexId: params.redDexId,
        blueDexId: params.blueDexId,
      })
    );
  },
  pendingComponent: VoteFallback,
  component: VoteContent,
});

function VoteContent() {
  const navigate = Route.useNavigate();
  const { redDexId, blueDexId } = Route.useParams();
  const { data: twoPokemon } = useSuspenseQuery(
    convexQuery(api.pokemon.getPairByDexIds, {
      redDexId: Number(redDexId),
      blueDexId: Number(blueDexId),
    })
  );

  const { mutate: vote, isPending: votePending } = useMutation({
    mutationFn: useConvexMutation(api.pokemon.vote),
    onSuccess: () => {
      const newPair = getRandomPokemonPair(Math.random());
      navigate({
        params: {
          redDexId: newPair[0],
          blueDexId: newPair[1],
        },
      });
    },
  });

  return (
    <div className="flex justify-center gap-16 items-center min-h-[80vh]">
      {twoPokemon.map((pokemon, index) => (
        <div key={pokemon.dexId} className="flex flex-col items-center gap-4">
          <PokemonSprite pokemon={pokemon} className="w-64 h-64" />
          <div className="text-center">
            <span className="text-gray-500 text-lg">#{pokemon.dexId}</span>
            <h2 className="text-2xl font-bold capitalize">{pokemon.name}</h2>
            <form className="mt-4">
              <button
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
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
