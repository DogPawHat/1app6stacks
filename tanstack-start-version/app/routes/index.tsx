import { createFileRoute, redirect } from "@tanstack/react-router";
import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../convex/_generated/api";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createStoreWithProducer } from "@xstate/store";
import { useSelector } from "@xstate/store/react";
import { produce } from "immer";

import VoteFallback from "~/utils/vote-fallback";
import { PokemonSprite } from "~/utils/sprite";
import { getTwoRandomNumbers } from "~/utils/two-random-numbers";

const battleStore = createStoreWithProducer(produce, {
  context: {
    currentBattle: getTwoRandomNumbers(1025),
    nextBattle: getTwoRandomNumbers(1025),
  },
  on: {
    next: (context) => {
      context.currentBattle = context.nextBattle;
      context.nextBattle = getTwoRandomNumbers(1025);
    },
  },
});

export const Route = createFileRoute("/")({
  beforeLoad: (opts) => {
    return {
      battleStore,
    };
  },
  loader: async (opts) => {
    const currentBattleStore = opts.context.battleStore.getSnapshot();

    const ensureDataPromise = opts.context.queryClient.ensureQueryData(
      convexQuery(api.pokemon.getTwoPokemon, {
        dexNumber1: currentBattleStore.context.currentBattle[0],
        dexNumber2: currentBattleStore.context.currentBattle[1],
      })
    );

    void opts.context.queryClient.ensureQueryData(
      convexQuery(api.pokemon.getTwoPokemon, {
        dexNumber1: currentBattleStore.context.nextBattle[0],
        dexNumber2: currentBattleStore.context.nextBattle[1],
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
  const { battleStore } = Route.useRouteContext();

  const currentBattle = useSelector(
    battleStore,
    (state) => state.context.currentBattle
  );
  const nextBattle = useSelector(
    battleStore,
    (state) => state.context.nextBattle
  );

  const { data: twoPokemon } = useSuspenseQuery(
    convexQuery(api.pokemon.getTwoPokemon, {
      dexNumber1: currentBattle[0],
      dexNumber2: currentBattle[1],
    })
  );

  const { mutate: recordBattle } = useMutation({
    mutationFn: useConvexMutation(api.pokemon.recordBattle),
    onSuccess: () => {
      battleStore.send({
        type: "next",
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
