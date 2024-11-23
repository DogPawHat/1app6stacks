import { createStoreWithProducer } from "@xstate/store";
import { useSelector } from "@xstate/store/react";
import { produce } from "immer";
import { createContext, useContext } from "react";

export const createPokemonSeedStore = () => createStoreWithProducer(
  produce,
  {
    context: {
      pokemonSeed: Math.random(),
    },
    on: {
      update_seed: (context) => {
        context.pokemonSeed = Math.random();
      },
    },
  }
);

export const SeedStoreContext = createContext<ReturnType<
  typeof createPokemonSeedStore
> | null>(null);

export const useSeedStore = () => {
  const seedStore = useContext(SeedStoreContext);
  if (!seedStore) {
    throw new Error("useSeedStore must be used within a SeedStoreContext");
  }
  return seedStore;
};

export const usePokemonSeed = () => {
  const seedStore = useSeedStore();
  return useSelector(seedStore, (state) => state.context.pokemonSeed);
};

export const useUpdatePokemonSeed = () => {
  const seedStore = useSeedStore();
  const updatePokemonSeed = () => {
    seedStore.send({ type: "update_seed" });
  };
  return updatePokemonSeed; 
};
