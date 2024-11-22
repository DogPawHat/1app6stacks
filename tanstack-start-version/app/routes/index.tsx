import {
  createFileRoute,
  useRouter,
} from "@tanstack/react-router";
import { useConvexMutation } from "@convex-dev/react-query";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../convex/_generated/api";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { atom, createStore, useAtomValue, Provider as JotaiProvider } from "jotai";
import VoteFallback from "~/utils/vote-fallback";
import { PokemonSprite } from "~/utils/sprite";
import { getTwoRandomNumbers } from "~/utils/two-random-numbers";

const currentBattleAtom = atom<Promise<[number, number]>>(
  new Promise(() => {}) as Promise<[number, number]>
);

export const Route = createFileRoute("/")((() => {
  const jotaiStore = createStore();

  return {
    loader: async (opts) => {
      const currentBattle = getTwoRandomNumbers(1025);

      jotaiStore.set(currentBattleAtom, Promise.resolve(currentBattle));

      const ensureDataPromise = opts.context.queryClient.ensureQueryData(
        convexQuery(api.pokemon.getTwoPokemon, {
          dexNumber1: currentBattle[0],
          dexNumber2: currentBattle[1],
        })
      );

      await ensureDataPromise;
    },
    pendingComponent: () => (
      <VoteContainerComponent>
        <VoteFallback />
      </VoteContainerComponent>
    ),
    component: () => (
      <JotaiProvider store={jotaiStore}>
        <VoteComponent />
      </JotaiProvider>
    ),
  };
})());

function VoteComponent() {
  const router = useRouter();
  const currentBattle = useAtomValue(currentBattleAtom);

  const { data: twoPokemon } = useSuspenseQuery(
    convexQuery(api.pokemon.getTwoPokemon, {
      dexNumber1: currentBattle[0],
      dexNumber2: currentBattle[1],
    })
  );

  const { mutate: recordBattle } = useMutation({
    mutationFn: useConvexMutation(api.pokemon.recordBattle),
    onSuccess: () => {
      router.invalidate();
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
