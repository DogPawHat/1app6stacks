  import { createFileRoute, redirect } from "@tanstack/react-router";
  import { useConvexMutation } from "@convex-dev/react-query";
  import { useMutation } from "@tanstack/react-query";
  import { api } from "../../convex/_generated/api";
  import { convexQuery } from "@convex-dev/react-query";
  import { useSuspenseQuery, infiniteQueryOptions } from "@tanstack/react-query";
  import { createStore, atom, useAtomValue } from "jotai";
  import { z } from "zod";
  import VoteFallback from "~/utils/vote-fallback";
  import { PokemonSprite } from "~/utils/sprite";
  import { getTwoRandomNumbers } from "~/utils/two-random-numbers";

  const paramsSchema = z.object({
    currentBattle: z.tuple([z.number(), z.number()]).readonly(),
    nextBattle: z.tuple([z.number(), z.number()]).readonly(),
  });

  export const Route = createFileRoute("/")({
    validateSearch: paramsSchema,
    loaderDeps: ({search}) => ({
      currentBattle: search.currentBattle,
      nextBattle: search.nextBattle,
    }),
    onError: (error) => {
      if (typeof error === "object" && "routerCode" in error && error.routerCode === "VALIDATE_SEARCH") {
        const currentBattle = getTwoRandomNumbers(1025);
        const nextBattle = getTwoRandomNumbers(1025);

        throw redirect({
          to: "/",
          search: {
            currentBattle,
            nextBattle,
          },
        });
      }
    },
    loader: async (opts) => {
      const {currentBattle, nextBattle} = opts.deps;

      const ensureDataPromise = opts.context.queryClient.ensureQueryData(
        convexQuery(api.pokemon.getTwoPokemon, {
          dexNumber1: currentBattle[0],
          dexNumber2: currentBattle[1],
        })
      );

      void opts.context.queryClient.ensureQueryData(
        convexQuery(api.pokemon.getTwoPokemon, {
          dexNumber1: nextBattle[0],
          dexNumber2: nextBattle[1],
        })
      );
      await ensureDataPromise;
    },
    pendingComponent: () => (
      <VoteContainerComponent>
        <VoteFallback />
      </VoteContainerComponent>
    ),
    component: VoteComponent,
  });

  function VoteComponent() {
    const currentBattle = Route.useSearch({select: search => search.currentBattle});
    const nextBattle = Route.useSearch({select: search => search.nextBattle});
    const navigate = Route.useNavigate();

    const { data: twoPokemon } = useSuspenseQuery(
      convexQuery(api.pokemon.getTwoPokemon, {
        dexNumber1: currentBattle[0],
        dexNumber2: currentBattle[1],
      })
    );

    const { mutate: recordBattle } = useMutation({
      mutationFn: useConvexMutation(api.pokemon.recordBattle),
      onSuccess: () => {
        navigate({
          to: "/",
          search: {
            currentBattle: nextBattle,
            nextBattle: getTwoRandomNumbers(1025),
          },
        });
      },
    });

    return (
      <VoteContainerComponent>
        <div className="flex justify-center gap-16 items-center min-h-[80vh]">
          {twoPokemon.map((pokemon, index) => (
            <div
              key={pokemon.dexNumber}
              className="flex flex-col items-center gap-4"
            >
              <PokemonSprite dexId={pokemon.dexNumber} className="w-64 h-64" />
              <div className="text-center">
                <span className="text-gray-500 text-lg">
                  #{pokemon.dexNumber}
                </span>
                <h2 className="text-2xl font-bold capitalize">{pokemon.name}</h2>
                <form className="mt-4">
                  <button
                    onClick={() =>
                      recordBattle({
                        winnerId: twoPokemon[index === 0 ? 1 : 0]._id,
                        loserId: pokemon._id,
                      })
                    }
                    className="px-8 py-3 bg-blue-500 text-white rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Vote
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </VoteContainerComponent>
    );
  }

  function VoteContainerComponent({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex justify-center gap-16 items-center min-h-[80vh]">
        {children}
      </div>
    );
  }
